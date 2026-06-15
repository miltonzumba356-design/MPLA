"""
Endpoints de webhook para receber eventos em tempo real das plataformas.

Como funciona:
  - WhatsApp/Facebook/Instagram: a Meta faz um GET de verificação e depois
    envia POSTs sempre que há um novo comentário, menção, etc.
  - TikTok: não tem webhook — usa polling (worker a cada 15min)

CONFIGURAÇÃO DO WEBHOOK:
  1. Torna o servidor acessível publicamente (HTTPS obrigatório)
     Em desenvolvimento: ngrok http 8000
     Em produção: o teu domínio com SSL (ex: api.clacslistening.ao)

  2. Regista o webhook em developers.facebook.com:
     App → WhatsApp → Configuração → Webhooks
     URL de callback: https://teu-dominio.ao/webhook/whatsapp
     Token de verificação: o valor de WHATSAPP_VERIFY_TOKEN no .env

  3. Subscreve os campos:
     Para WhatsApp: messages, message_status
     Para Facebook: feed, mention, ratings
     Para Instagram: mentions, comments
"""

import logging
from typing import Any

from fastapi import APIRouter, Query, Request, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.models.database import get_db
from app.models.models import Mention, MentionSource
from app.integrations.whatsapp import verify_webhook as verify_wa, parse_incoming_message
from app.integrations.facebook import verify_facebook_webhook, parse_facebook_webhook
from app.core.brain import analyse_mention
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["Webhooks"])


# ─── WhatsApp ─────────────────────────────────────────────────────────────────

@router.get("/whatsapp")
async def whatsapp_verify(
    hub_mode: str = Query(alias="hub.mode", default=""),
    hub_verify_token: str = Query(alias="hub.verify_token", default=""),
    hub_challenge: str = Query(alias="hub.challenge", default=""),
):
    """
    Verificação do webhook WhatsApp.

    A Meta faz este GET quando registas o webhook.
    Devolves o challenge para confirmar que és o dono do endpoint.
    """
    challenge = verify_wa(hub_mode, hub_verify_token, hub_challenge)
    if not challenge:
        raise HTTPException(status_code=403, detail="Verificação falhou")
    # A Meta espera o challenge como texto simples (não JSON)
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(challenge)


@router.post("/whatsapp")
async def whatsapp_receive(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Recebe eventos WhatsApp em tempo real.

    Eventos possíveis:
      - messages: nova mensagem recebida
      - statuses: delivered, read, failed

    A Meta espera uma resposta 200 em menos de 20 segundos.
    Por isso, processamos a mensagem em background.
    """
    payload = await request.json()

    # Valida que é mesmo da Meta (verificação por assinatura em produção)
    # Para verificação por X-Hub-Signature-256, ver:
    # https://developers.facebook.com/docs/graph-api/webhooks/getting-started#event-notifications
    # TODO: implementar verificação de assinatura HMAC-SHA256

    msg = parse_incoming_message(payload)
    if msg and msg.get("type") == "text":
        # Processa em background para não bloquear a resposta
        background_tasks.add_task(_process_incoming_message, msg, db)

    # A Meta exige 200 OK imediato
    return {"status": "ok"}


async def _process_incoming_message(msg: dict, db: AsyncSession):
    """Salva mensagem recebida como menção (útil para monitorar feedback directo)."""
    try:
        from app.collectors.base import RawMention
        raw = RawMention(
            source="whatsapp",  # não está no enum padrão — adiciona se necessário
            content=msg.get("text", ""),
            author=msg.get("name") or msg.get("from"),
        )
        logger.info(f"WhatsApp mensagem recebida de {msg.get('from')}: {msg.get('text', '')[:50]}")
        # Aqui podes salvar na DB ou encaminhar para análise
    except Exception as exc:
        logger.error(f"Erro ao processar mensagem WhatsApp: {exc}")


# ─── Facebook ─────────────────────────────────────────────────────────────────

@router.get("/facebook")
async def facebook_verify(
    hub_mode: str = Query(alias="hub.mode", default=""),
    hub_verify_token: str = Query(alias="hub.verify_token", default=""),
    hub_challenge: str = Query(alias="hub.challenge", default=""),
):
    """Verificação do webhook Facebook — mesmo mecanismo do WhatsApp."""
    challenge = verify_facebook_webhook(hub_mode, hub_verify_token, hub_challenge)
    if not challenge:
        raise HTTPException(status_code=403, detail="Verificação falhou")
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(challenge)


@router.post("/facebook")
async def facebook_receive(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Recebe eventos Facebook em tempo real.

    Eventos processados: feed (posts/comentários), ratings (avaliações), mention.
    Cada evento é analisado pelo ClacsBrain em background.
    """
    payload = await request.json()

    # Valida que vem do Facebook pela assinatura X-Hub-Signature-256
    # Documentação: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
    # TODO: implementar validação HMAC

    events = parse_facebook_webhook(payload)
    for event in events:
        background_tasks.add_task(_save_webhook_event, event, "facebook", db)

    return {"status": "ok"}


# ─── Instagram ────────────────────────────────────────────────────────────────

@router.get("/instagram")
async def instagram_verify(
    hub_mode: str = Query(alias="hub.mode", default=""),
    hub_verify_token: str = Query(alias="hub.verify_token", default=""),
    hub_challenge: str = Query(alias="hub.challenge", default=""),
):
    """
    Verificação do webhook Instagram.

    O Instagram partilha o mesmo mecanismo de webhook da Meta.
    Regista em: App → Instagram → Webhooks → mentions, comments
    """
    # Usa o mesmo verify_token do Facebook/WhatsApp (todos são Meta)
    challenge = verify_facebook_webhook(hub_mode, hub_verify_token, hub_challenge)
    if not challenge:
        raise HTTPException(status_code=403, detail="Verificação falhou")
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(challenge)


@router.post("/instagram")
async def instagram_receive(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Recebe eventos Instagram em tempo real.

    Campos subscritos:
      - mentions: quando alguém menciona a tua conta (@conta)
      - comments: novos comentários nos teus posts

    Estrutura do payload:
    https://developers.facebook.com/docs/instagram-api/guides/webhooks
    """
    payload = await request.json()

    try:
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                field = change.get("field")
                value = change.get("value", {})

                if field == "mentions":
                    # Alguém mencionou a conta num post ou story
                    event = {
                        "type": "instagram_mention",
                        "text": value.get("media_id", ""),  # precisas de outro GET para o texto
                        "from": value.get("from", {}).get("username", ""),
                        "media_id": value.get("media_id"),
                    }
                    background_tasks.add_task(_save_webhook_event, event, "instagram", db)

                elif field == "comments":
                    event = {
                        "type": "instagram_comment",
                        "text": value.get("text", ""),
                        "from": value.get("from", {}).get("username", ""),
                        "timestamp": value.get("timestamp"),
                    }
                    background_tasks.add_task(_save_webhook_event, event, "instagram", db)

    except Exception as exc:
        logger.error(f"Erro ao processar webhook Instagram: {exc}")

    return {"status": "ok"}


# ─── Utilitário interno ────────────────────────────────────────────────────────

async def _save_webhook_event(event: dict, platform: str, db: AsyncSession):
    """
    Guarda um evento de webhook como menção na base de dados.

    Em produção, deverias também:
      1. Associar ao projecto correcto (por keyword matching)
      2. Chamar o ClacsBrain para análise
      3. Criar alerta se severidade alta
    """
    import hashlib
    text = event.get("text", "").strip()
    if not text:
        logger.debug(f"Webhook {platform}: evento sem texto, ignorado")
        return

    # Dedup
    content_hash = hashlib.sha256(text[:200].encode()).hexdigest()
    from sqlalchemy import select
    exists = await db.execute(select(Mention.id).where(Mention.content_hash == content_hash))
    if exists.scalar_one_or_none():
        return

    source_map = {
        "facebook": MentionSource.facebook,
        "instagram": MentionSource.instagram,
        "whatsapp": MentionSource.rss,  # adapta se adicionares WhatsApp ao enum
    }

    # Para simplificar, associa ao primeiro projecto activo
    # Em produção, usa keyword matching para encontrar o projecto correcto
    from app.models.models import Project
    from sqlalchemy import select
    proj_result = await db.execute(select(Project).where(Project.is_active == True).limit(1))
    project = proj_result.scalar_one_or_none()
    if not project:
        return

    mention = Mention(
        project_id=project.id,
        source=source_map.get(platform, MentionSource.rss),
        content=text,
        author=event.get("from"),
        content_hash=content_hash,
    )
    db.add(mention)
    await db.commit()
    logger.info(f"Webhook {platform}: menção guardada (project={project.id})")
