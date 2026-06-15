"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              INTEGRAÇÃO WHATSAPP BUSINESS API — ClacsListening              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ONDE ENCONTRAR A API:                                                       ║
║  https://developers.facebook.com/docs/whatsapp/cloud-api                    ║
║                                                                              ║
║  COMO OBTER ACESSO:                                                          ║
║  1. Cria uma conta em https://developers.facebook.com                        ║
║  2. Vai a "Meus Apps" → "Criar App" → tipo "Business"                        ║
║  3. Adiciona o produto "WhatsApp" ao teu app                                 ║
║  4. Em "Configuração da API", encontras:                                     ║
║     - WHATSAPP_PHONE_NUMBER_ID  (ex: 123456789012345)                        ║
║     - WHATSAPP_TOKEN            (token temporário para testes, ou            ║
║                                  token permanente via System User)           ║
║  5. Para produção, cria um "System User" em Meta Business Manager:           ║
║     https://business.facebook.com → Definições → Utilizadores do Sistema    ║
║                                                                              ║
║  PREÇOS:                                                                     ║
║  - Primeiras 1.000 conversas/mês: GRÁTIS                                    ║
║  - Depois: ~$0.005–$0.09 por conversa (varia por região)                    ║
║  https://developers.facebook.com/docs/whatsapp/pricing                      ║
║                                                                              ║
║  WEBHOOK (para receber mensagens de entrada):                                ║
║  - O teu servidor precisa de um endpoint HTTPS público                       ║
║  - Usa ngrok em desenvolvimento: ngrok http 8000                             ║
║  - Em produção, usa o teu domínio com SSL                                    ║
║  - Regista o webhook em: App → WhatsApp → Configuração → Webhooks            ║
║                                                                              ║
║  VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env):                                  ║
║  WHATSAPP_TOKEN=EAAxxxxxxxxxx...                                             ║
║  WHATSAPP_PHONE_NUMBER_ID=123456789012345                                    ║
║  WHATSAPP_VERIFY_TOKEN=qualquer-string-secreta-que-tu-defines               ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import logging
from enum import Enum
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# URL base da Cloud API do WhatsApp (versão v19.0 — verifica sempre a versão mais recente em
# https://developers.facebook.com/docs/graph-api/changelog)
WHATSAPP_API_BASE = "https://graph.facebook.com/v19.0"


class MessageType(str, Enum):
    TEXT = "text"
    TEMPLATE = "template"
    IMAGE = "image"
    DOCUMENT = "document"


# ─── Envio de mensagens ───────────────────────────────────────────────────────

async def send_text_message(to: str, body: str) -> dict:
    """
    Envia uma mensagem de texto simples.

    Parâmetros:
      to   — número no formato internacional sem '+' (ex: '244923456789')
      body — texto da mensagem (máximo 4.096 caracteres)

    Retorna o JSON da resposta da API ou um dict com 'error'.
    """
    if not _is_configured():
        logger.warning("WhatsApp não configurado — mensagem não enviada")
        return {"error": "not_configured"}

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": _clean_number(to),
        "type": MessageType.TEXT,
        "text": {
            "preview_url": False,  # muda para True se o corpo contiver URLs
            "body": body[:4096],   # API rejeita mensagens > 4096 chars
        },
    }
    return await _post_message(payload)


async def send_template_message(
    to: str,
    template_name: str,
    language_code: str = "pt_BR",
    components: Optional[list] = None,
) -> dict:
    """
    Envia uma mensagem usando um Template aprovado pela Meta.

    Os templates têm de ser criados e aprovados ANTES de serem usados:
    Meta Business Manager → WhatsApp → Gestor de modelos de mensagem
    https://business.facebook.com/wa/manage/message-templates/

    Parâmetros:
      template_name — nome do template (ex: 'alerta_reputacao')
      language_code — 'pt_BR' para português brasileiro (mais aceite),
                      'pt_PT' para europeu (suporte limitado na Meta)
      components    — lista de variáveis a substituir nos placeholders {{1}}, {{2}}...

    Exemplo de payload de components:
      [{"type": "body", "parameters": [{"type": "text", "text": "ReservaAO"}]}]
    """
    if not _is_configured():
        return {"error": "not_configured"}

    payload = {
        "messaging_product": "whatsapp",
        "to": _clean_number(to),
        "type": MessageType.TEMPLATE,
        "template": {
            "name": template_name,
            "language": {"code": language_code},
            "components": components or [],
        },
    }
    return await _post_message(payload)


async def send_alert_whatsapp(
    to: str,
    project_name: str,
    severity: str,
    summary: str,
    source: str,
    url: Optional[str] = None,
    action: Optional[str] = None,
) -> bool:
    """
    Formata e envia um alerta de reputação via WhatsApp.
    Usa mensagem de texto simples (não requer aprovação de template).

    Retorna True se enviado com sucesso.
    """
    # Emoji por nível de severidade — visível em qualquer dispositivo
    severity_icons = {
        "critical": "🔴 CRÍTICO",
        "high":     "🟠 ALTO",
        "medium":   "🟡 MÉDIO",
        "low":      "🔵 BAIXO",
    }
    label = severity_icons.get(severity.lower(), "⚪ INFO")

    lines = [
        f"*ClacsListening — Alerta {label}*",
        f"━━━━━━━━━━━━━━━━━━━━",
        f"📌 Projecto: {project_name}",
        f"📡 Fonte: {source}",
        f"",
        f"{summary}",
    ]
    if url:
        lines += ["", f"🔗 {url}"]
    if action:
        lines += ["", f"💡 *Acção recomendada:* {action}"]

    lines += ["", f"_ClacsListening · Angola_"]

    body = "\n".join(lines)
    result = await send_text_message(to, body)
    return "error" not in result and "id" in result


async def send_daily_report_whatsapp(to: str, report_content: str) -> bool:
    """Envia um relatório diário (máximo 4096 chars — se maior, divide em partes)."""
    if len(report_content) <= 4096:
        result = await send_text_message(to, report_content)
        return "id" in result

    # Dividir em partes de ~3500 chars para deixar margem
    parts = [report_content[i:i+3500] for i in range(0, len(report_content), 3500)]
    total = len(parts)
    success = True
    for idx, part in enumerate(parts, 1):
        header = f"_(parte {idx}/{total})_\n\n" if total > 1 else ""
        result = await send_text_message(to, header + part)
        if "id" not in result:
            success = False
            logger.error(f"Falha ao enviar parte {idx}/{total}: {result}")
    return success


# ─── Webhook (receber mensagens de entrada) ───────────────────────────────────

def verify_webhook(mode: str, token: str, challenge: str) -> Optional[str]:
    """
    Verifica o webhook quando a Meta tenta confirmar a URL.

    A Meta faz um GET com ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
    Se o verify_token bater com o nosso, devolvemos o challenge (obrigatório).

    Este método é chamado pelo endpoint GET /webhook/whatsapp (ver api/routes/webhooks.py).
    """
    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("Webhook WhatsApp verificado com sucesso")
        return challenge
    logger.warning(f"Verificação de webhook falhou: mode={mode}, token={token}")
    return None


def parse_incoming_message(payload: dict) -> Optional[dict]:
    """
    Extrai a mensagem de entrada do payload enviado pela Meta.

    Estrutura do payload (simplificada):
    {
      "entry": [{
        "changes": [{
          "value": {
            "messages": [{"from": "244923...", "text": {"body": "..."}, "type": "text"}],
            "contacts": [{"profile": {"name": "..."}}]
          }
        }]
      }]
    }

    Retorna um dict normalizado ou None se não houver mensagem de texto.
    Documentação completa: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
    """
    try:
        entry = payload["entry"][0]
        change = entry["changes"][0]["value"]
        messages = change.get("messages", [])
        contacts = change.get("contacts", [])

        if not messages:
            return None  # pode ser um status update (delivered, read), não uma mensagem

        msg = messages[0]
        contact = contacts[0] if contacts else {}

        return {
            "from": msg["from"],           # número do remetente
            "name": contact.get("profile", {}).get("name", ""),
            "type": msg.get("type"),       # "text", "image", "audio", etc.
            "text": msg.get("text", {}).get("body") if msg.get("type") == "text" else None,
            "timestamp": msg.get("timestamp"),
            "message_id": msg.get("id"),
        }
    except (KeyError, IndexError):
        return None


# ─── Internos ─────────────────────────────────────────────────────────────────

async def _post_message(payload: dict) -> dict:
    """Faz o POST para a Graph API e devolve o JSON da resposta."""
    url = f"{WHATSAPP_API_BASE}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            data = resp.json()
            if resp.status_code != 200:
                logger.error(f"WhatsApp API erro {resp.status_code}: {data}")
            return data
    except Exception as exc:
        logger.error(f"WhatsApp request falhou: {exc}")
        return {"error": str(exc)}


def _is_configured() -> bool:
    return bool(settings.WHATSAPP_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID)


def _clean_number(number: str) -> str:
    """Remove espaços, '+' e traços — a API quer apenas dígitos."""
    return number.replace("+", "").replace(" ", "").replace("-", "").strip()
