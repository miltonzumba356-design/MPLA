"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              INTEGRAÇÃO FACEBOOK GRAPH API — ClacsListening                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ONDE ENCONTRAR A API:                                                       ║
║  https://developers.facebook.com/docs/graph-api                              ║
║                                                                              ║
║  O QUE PODEMOS MONITORIZAR:                                                  ║
║  ✓ Comentários nas publicações das tuas Páginas                              ║
║  ✓ Menções da tua Página (@suamarca)                                        ║
║  ✓ Avaliações (Reviews) da Página                                            ║
║  ✓ Métricas de alcance e engagement (Page Insights)                         ║
║  ✗ Publicações de outros utilizadores sobre a marca (requer permissão        ║
║    especial "public_content" — muito difícil de obter)                       ║
║                                                                              ║
║  COMO OBTER ACESSO:                                                          ║
║  1. https://developers.facebook.com → Criar App → tipo "Business"            ║
║  2. Adicionar produto "Facebook Login"                                       ║
║  3. Permissões necessárias (pedir em App Review):                            ║
║     - pages_read_engagement    ← comentários, likes, alcance                 ║
║     - pages_read_user_content  ← conteúdo publicado por utilizadores        ║
║     - pages_manage_metadata    ← info da página                              ║
║     - pages_show_list          ← listar páginas do utilizador                ║
║  4. Gera um Page Access Token:                                               ║
║     Graph API Explorer → https://developers.facebook.com/tools/explorer     ║
║     Selecciona a tua página → gera token → usa "Extend Token" para 60 dias  ║
║     Para token permanente (nunca expira), usa System User no Business Manager║
║                                                                              ║
║  WEBHOOK PARA NOTIFICAÇÕES EM TEMPO REAL:                                   ║
║  App → Webhooks → Subscribe to "Page" com campos:                           ║
║    feed, mention, ratings, comments                                          ║
║  https://developers.facebook.com/docs/graph-api/webhooks                    ║
║                                                                              ║
║  ATENÇÃO — LIMITAÇÕES IMPORTANTES:                                           ║
║  - Rate limit: 200 chamadas por hora por utilizador                          ║
║  - Dados de utilizadores privados: NÃO acessíveis (GDPR/políticas Meta)     ║
║  - Publicações de grupos privados: NÃO acessíveis                            ║
║                                                                              ║
║  VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env):                                  ║
║  FACEBOOK_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxx...                                ║
║  FACEBOOK_PAGE_ID=123456789012345                                            ║
║  FACEBOOK_APP_ID=987654321                                                   ║
║  FACEBOOK_APP_SECRET=abc123def456...                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import logging
from datetime import datetime
from typing import Optional

import httpx

from app.collectors.base import BaseCollector, RawMention
from app.config import settings

logger = logging.getLogger(__name__)

# Versão da API — muda periodicamente. Verifica sempre a versão mais recente:
# https://developers.facebook.com/docs/graph-api/changelog
GRAPH_API_BASE = "https://graph.facebook.com/v19.0"


class FacebookCollector(BaseCollector):
    """
    Colecta menções da(s) Página(s) Facebook monitorizada(s).

    Fontes de dados:
      1. Comentários nas publicações da Página
      2. Menções da Página em publicações de terceiros (se permissão concedida)
      3. Avaliações (Reviews) da Página
      4. Posts feitos por visitantes na Página
    """

    name = "facebook"
    source = "facebook"

    def __init__(self):
        super().__init__()
        # Token de acesso à Página — obtido no Graph API Explorer ou via OAuth
        self._token = settings.FACEBOOK_PAGE_ACCESS_TOKEN
        self._page_id = settings.FACEBOOK_PAGE_ID

    async def collect(self, keywords: list[str], **kwargs) -> list[RawMention]:
        """Ponto de entrada principal — agrega todas as fontes Facebook."""
        if not self._is_configured():
            logger.warning(
                "Facebook não configurado. "
                "Define FACEBOOK_PAGE_ACCESS_TOKEN e FACEBOOK_PAGE_ID no .env"
            )
            return []

        mentions: list[RawMention] = []

        # 1. Comentários recentes nas publicações da Página
        mentions += await self._collect_post_comments(keywords)

        # 2. Avaliações (estrelas + texto) da Página
        mentions += await self._collect_page_reviews(keywords)

        # 3. Menções (@nomeDaPágina) — requer permissão pages_read_user_content
        mentions += await self._collect_page_mentions(keywords)

        # Dedup por hash
        seen: set[str] = set()
        unique = [m for m in mentions if not (m.content_hash in seen or seen.add(m.content_hash))]

        logger.info(f"Facebook: {len(unique)} menções únicas para {keywords}")
        return unique

    # ─── Fonte 1: Comentários nos Posts ───────────────────────────────────────

    async def _collect_post_comments(self, keywords: list[str]) -> list[RawMention]:
        """
        Busca os posts recentes da Página e recolhe comentários que contenham keywords.

        Endpoint: GET /{page-id}/posts
        Documentação: https://developers.facebook.com/docs/graph-api/reference/page/posts/
        """
        try:
            # Primeiro, obtemos os posts recentes da página (máximo 25 por chamada)
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._page_id}/posts",
                params={
                    "fields": "id,message,created_time,permalink_url,shares,reactions.summary(true)",
                    "limit": 25,
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            posts = resp.json().get("data", [])
        except Exception as exc:
            logger.error(f"Facebook posts error: {exc}")
            return []

        mentions = []
        for post in posts:
            post_id = post.get("id", "")
            post_url = post.get("permalink_url", "")
            post_reactions = post.get("reactions", {}).get("summary", {}).get("total_count", 0)
            post_shares = post.get("shares", {}).get("count", 0)

            # Para cada post, recolhe comentários
            try:
                resp = await self._get(
                    f"{GRAPH_API_BASE}/{post_id}/comments",
                    params={
                        # Campos disponíveis: https://developers.facebook.com/docs/graph-api/reference/comment/
                        "fields": "id,message,from,created_time,like_count",
                        "limit": 50,
                        "access_token": self._token,
                    },
                )
                resp.raise_for_status()
                comments = resp.json().get("data", [])
            except Exception as exc:
                logger.warning(f"Facebook comments error for post {post_id}: {exc}")
                continue

            for comment in comments:
                text = comment.get("message", "").strip()
                if not text:
                    continue

                # Filtra por keywords se fornecidas (comentários da própria página incluem todos)
                if keywords and not any(kw.lower() in text.lower() for kw in keywords):
                    continue

                author_info = comment.get("from", {})
                mentions.append(
                    RawMention(
                        source=self.source,
                        content=text,
                        url=post_url,
                        title=f"Comentário em publicação Facebook",
                        author=author_info.get("name"),
                        published_at=_parse_fb_date(comment.get("created_time")),
                        # O reach é o alcance do post-pai (comentário herda visibilidade)
                        reach_estimate=post_reactions + post_shares * 10,
                        engagement=comment.get("like_count", 0),
                    )
                )

        return mentions

    # ─── Fonte 2: Avaliações da Página ────────────────────────────────────────

    async def _collect_page_reviews(self, keywords: list[str]) -> list[RawMention]:
        """
        Recolhe avaliações (Reviews) deixadas na Página Facebook.

        Endpoint: GET /{page-id}/ratings
        Nota: 'ratings' e 'reviews' são sinónimos nesta API.
        Requer permissão: pages_read_user_content
        Documentação: https://developers.facebook.com/docs/graph-api/reference/page/ratings/
        """
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._page_id}/ratings",
                params={
                    "fields": "reviewer{name},rating,review_text,created_time",
                    "limit": 50,
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            ratings = resp.json().get("data", [])
        except Exception as exc:
            logger.warning(f"Facebook ratings error: {exc}")
            return []

        mentions = []
        for rating in ratings:
            text = rating.get("review_text", "").strip()
            stars = rating.get("rating", 3)
            reviewer = rating.get("reviewer", {}).get("name", "")

            if not text:
                continue

            # Inclui todas as avaliações (não só as com keywords)
            # porque avaliações são sempre relevantes para reputação
            mentions.append(
                RawMention(
                    source=self.source,
                    content=text,
                    url=f"https://www.facebook.com/{self._page_id}/reviews/",
                    title=f"Avaliação Facebook — {stars}★",
                    author=reviewer,
                    published_at=_parse_fb_date(rating.get("created_time")),
                    reach_estimate=200,   # avaliações têm alcance moderado
                    engagement=stars,     # usamos estrelas como proxy de engagement
                )
            )

        return mentions

    # ─── Fonte 3: Menções da Página ───────────────────────────────────────────

    async def _collect_page_mentions(self, keywords: list[str]) -> list[RawMention]:
        """
        Recolhe publicações onde a Página foi mencionada (@Página).

        Endpoint: GET /{page-id}/tagged
        Requer: pages_read_user_content (aprovação obrigatória pela Meta)
        Documentação: https://developers.facebook.com/docs/graph-api/reference/page/tagged/
        """
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._page_id}/tagged",
                params={
                    "fields": "message,story,from,created_time,permalink_url",
                    "limit": 25,
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            tagged = resp.json().get("data", [])
        except Exception as exc:
            # Esta chamada falha frequentemente se a permissão não foi aprovada
            logger.debug(f"Facebook tagged error (normal se sem permissão): {exc}")
            return []

        mentions = []
        for item in tagged:
            text = item.get("message") or item.get("story", "")
            if not text:
                continue

            mentions.append(
                RawMention(
                    source=self.source,
                    content=text,
                    url=item.get("permalink_url"),
                    title="Menção Facebook",
                    author=item.get("from", {}).get("name"),
                    published_at=_parse_fb_date(item.get("created_time")),
                    reach_estimate=1_000,
                )
            )

        return mentions

    # ─── Insights (métricas da Página) ────────────────────────────────────────

    async def get_page_insights(self, metric: str = "page_impressions", period: str = "day") -> dict:
        """
        Obtém métricas de alcance e engagement da Página.

        Métricas úteis:
          page_impressions        — número de vezes que a página foi vista
          page_engaged_users      — utilizadores que interagiram
          page_fans               — total de seguidores
          page_posts_impressions  — alcance das publicações

        Períodos disponíveis: day, week, days_28, month, lifetime

        Endpoint: GET /{page-id}/insights/{metric}
        Documentação: https://developers.facebook.com/docs/graph-api/reference/insights/
        """
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._page_id}/insights/{metric}",
                params={"period": period, "access_token": self._token},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            logger.error(f"Facebook insights error: {exc}")
            return {}

    def _is_configured(self) -> bool:
        return bool(self._token and self._page_id)


# ─── Webhook Facebook ─────────────────────────────────────────────────────────

def verify_facebook_webhook(mode: str, token: str, challenge: str) -> Optional[str]:
    """
    Verifica o webhook Facebook (mesmo mecanismo do WhatsApp — ambos são Meta).

    Quando registas o webhook em developers.facebook.com → Webhooks,
    a Meta faz um GET de verificação. Tens de devolver o challenge.

    Campos a subscrever para monitorização:
      - feed        ← publicações e comentários
      - mention     ← menções (@suapágina)
      - ratings     ← avaliações
    """
    if mode == "subscribe" and token == settings.FACEBOOK_WEBHOOK_VERIFY_TOKEN:
        return challenge
    return None


def parse_facebook_webhook(payload: dict) -> list[dict]:
    """
    Processa o payload de webhook recebido do Facebook.

    O webhook entrega eventos em tempo real — muito mais eficiente do que polling.

    Estrutura geral:
    {
      "object": "page",
      "entry": [{
        "id": "page_id",
        "time": 1234567890,
        "changes": [{
          "value": {"verb": "add", "message": "texto...", "from": {...}},
          "field": "feed"  # ou "mention", "ratings"
        }]
      }]
    }

    Documentação dos formatos: https://developers.facebook.com/docs/graph-api/webhooks/reference/page/
    """
    events = []
    try:
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                field = change.get("field")
                value = change.get("value", {})

                if field == "feed":
                    text = value.get("message", "")
                    if text:
                        events.append({
                            "type": "comment" if value.get("item") == "comment" else "post",
                            "text": text,
                            "from": value.get("from", {}).get("name", ""),
                            "timestamp": value.get("created_time"),
                            "post_id": value.get("post_id"),
                        })

                elif field == "ratings":
                    events.append({
                        "type": "review",
                        "text": value.get("review_text", ""),
                        "rating": value.get("rating"),
                        "from": value.get("reviewer", {}).get("name", ""),
                        "timestamp": value.get("created_time"),
                    })
    except Exception as exc:
        logger.error(f"Erro ao processar webhook Facebook: {exc}")

    return events


# ─── Utilitários ──────────────────────────────────────────────────────────────

def _parse_fb_date(date_str: Optional[str]) -> Optional[datetime]:
    """
    O Facebook retorna datas no formato ISO 8601 com timezone:
    "2024-03-15T10:30:00+0000"
    """
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("+0000", "+00:00"))
    except Exception:
        return None
