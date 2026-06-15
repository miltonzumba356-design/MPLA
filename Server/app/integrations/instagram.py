"""
╔══════════════════════════════════════════════════════════════════════════════╗
║           INTEGRAÇÃO INSTAGRAM GRAPH API — ClacsListening                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ONDE ENCONTRAR A API:                                                       ║
║  https://developers.facebook.com/docs/instagram-api                          ║
║                                                                              ║
║  IMPORTANTE — DOIS TIPOS DE API:                                             ║
║                                                                              ║
║  A) Instagram Graph API (usada aqui) — para CONTAS PROFISSIONAIS             ║
║     ✓ Acesso aos teus próprios posts e comentários                           ║
║     ✓ Comentários em que foste mencionado                                    ║
║     ✓ Hashtag search (limitado: 30 hashtags únicas por app por semana)       ║
║     ✓ Mentions (@suaconta) em posts e stories                                ║
║     ✗ Não acessa contas privadas ou DMs de utilizadores não conectados       ║
║                                                                              ║
║  B) Instagram Basic Display API — para contas pessoais (uso limitado)        ║
║     Documentação: https://developers.facebook.com/docs/instagram-basic-display-api
║                                                                              ║
║  COMO OBTER ACESSO:                                                          ║
║  1. A conta Instagram DEVE ser do tipo Profissional (Business ou Creator)    ║
║     Instagram → Definições → Conta → Mudar para conta profissional           ║
║  2. Liga a conta Instagram a uma Página Facebook                              ║
║     (obrigatório — sem esta ligação a API não funciona)                      ║
║  3. Em developers.facebook.com → teu App → Adicionar produto: Instagram      ║
║  4. Permissões necessárias (Graph API Explorer para teste):                  ║
║     - instagram_basic             ← info da conta e posts                    ║
║     - instagram_manage_comments   ← ler e responder comentários              ║
║     - instagram_manage_insights   ← métricas de alcance                      ║
║     - pages_show_list             ← necessário para ligar à Página           ║
║  5. Para obter o INSTAGRAM_BUSINESS_ACCOUNT_ID:                              ║
║     GET https://graph.facebook.com/v19.0/{page-id}?fields=instagram_business_account
║                                                                              ║
║  HASHTAG SEARCH — COMO FUNCIONA:                                             ║
║  A API permite pesquisar posts públicos por hashtag APENAS se a tua conta    ║
║  já usou essa hashtag ou se ela foi mencionada na tua conta.                 ║
║  Limite: 30 hashtags únicas por semana por app.                              ║
║  Documentação: https://developers.facebook.com/docs/instagram-api/guides/hashtag-search
║                                                                              ║
║  VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env):                                  ║
║  INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxxxxx...   (mesmo token da Página Facebook)  ║
║  INSTAGRAM_BUSINESS_ACCOUNT_ID=17841400000000000                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import logging
from datetime import datetime
from typing import Optional

from app.collectors.base import BaseCollector, RawMention
from app.config import settings

logger = logging.getLogger(__name__)

# Usamos a mesma Graph API do Facebook — Instagram é produto da Meta
GRAPH_API_BASE = "https://graph.facebook.com/v19.0"


class InstagramCollector(BaseCollector):
    """
    Monitoriza menções, comentários e hashtags no Instagram.

    O Instagram Graph API partilha a autenticação com o Facebook —
    o mesmo Page Access Token serve para ambos.
    """

    name = "instagram"
    source = "instagram"

    def __init__(self):
        super().__init__()
        self._token = settings.INSTAGRAM_ACCESS_TOKEN
        self._account_id = settings.INSTAGRAM_BUSINESS_ACCOUNT_ID

    async def collect(self, keywords: list[str], hashtags: Optional[list[str]] = None, **kwargs) -> list[RawMention]:
        """
        Agrega menções de três fontes Instagram.

        Parâmetros:
          keywords — termos para filtrar comentários
          hashtags — hashtags a monitorizar (ex: ['reservaao', 'hotelluanda'])
                     se não fornecidas, derivam das keywords automaticamente
        """
        if not self._is_configured():
            logger.warning(
                "Instagram não configurado. "
                "Define INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID no .env"
            )
            return []

        # Converte keywords em hashtags se não fornecidas explicitamente
        if not hashtags:
            hashtags = [kw.lower().replace(" ", "").replace("-", "") for kw in keywords]

        mentions: list[RawMention] = []

        # 1. Comentários nos teus posts que contenham keywords
        mentions += await self._collect_media_comments(keywords)

        # 2. Posts públicos com as hashtags monitoradas
        for hashtag in hashtags[:5]:  # limite por sessão para não esgotar quota
            mentions += await self._search_hashtag(hashtag, keywords)

        # 3. Menções directas (@suaconta) em posts e stories
        mentions += await self._collect_mentions()

        # Dedup
        seen: set[str] = set()
        unique = [m for m in mentions if not (m.content_hash in seen or seen.add(m.content_hash))]

        logger.info(f"Instagram: {len(unique)} menções únicas")
        return unique

    # ─── Fonte 1: Comentários nos teus posts ──────────────────────────────────

    async def _collect_media_comments(self, keywords: list[str]) -> list[RawMention]:
        """
        Recolhe comentários nos posts (medias) da conta Instagram.

        Fluxo:
          1. GET /{ig-account-id}/media → lista de posts recentes
          2. Para cada post: GET /{media-id}/comments → comentários

        Endpoint: GET /{ig-user-id}/media
        Documentação: https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
        """
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._account_id}/media",
                params={
                    # Campos disponíveis: https://developers.facebook.com/docs/instagram-api/reference/ig-media
                    "fields": "id,caption,media_type,timestamp,permalink,like_count,comments_count",
                    "limit": 20,
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            medias = resp.json().get("data", [])
        except Exception as exc:
            logger.error(f"Instagram media list error: {exc}")
            return []

        mentions = []
        for media in medias:
            media_id = media.get("id", "")
            media_url = media.get("permalink", "")
            like_count = media.get("like_count", 0)

            if not media.get("comments_count", 0):
                continue  # pula posts sem comentários

            try:
                resp = await self._get(
                    f"{GRAPH_API_BASE}/{media_id}/comments",
                    params={
                        "fields": "id,text,username,timestamp,like_count",
                        "limit": 100,
                        "access_token": self._token,
                    },
                )
                resp.raise_for_status()
                comments = resp.json().get("data", [])
            except Exception as exc:
                logger.warning(f"Instagram comments error for {media_id}: {exc}")
                continue

            for comment in comments:
                text = comment.get("text", "").strip()
                if not text:
                    continue

                # Filtra por keyword — comentários negativos sem keyword são igualmente importantes
                # por isso incluímos TODOS os comentários nos próprios posts
                mentions.append(
                    RawMention(
                        source=self.source,
                        content=text,
                        url=media_url,
                        title="Comentário Instagram",
                        author=comment.get("username"),
                        published_at=_parse_ig_date(comment.get("timestamp")),
                        reach_estimate=like_count,
                        engagement=comment.get("like_count", 0),
                    )
                )

        return mentions

    # ─── Fonte 2: Pesquisa por Hashtag ────────────────────────────────────────

    async def _search_hashtag(self, hashtag: str, keywords: list[str]) -> list[RawMention]:
        """
        Pesquisa posts públicos que usaram uma hashtag específica.

        LIMITAÇÕES IMPORTANTES DA API:
        - Só devolve posts top/recentes dos últimos 24h (não histórico completo)
        - Máximo 30 hashtags únicas diferentes por semana por app
        - Não devolve o username do autor (privacidade Meta) — só o media_id
        - Só funciona para contas profissionais (Business/Creator)

        Fluxo:
          1. GET /ig_hashtag_search?q={hashtag} → obtém hashtag_id
          2. GET /{hashtag_id}/recent_media       → posts recentes
             ou /{hashtag_id}/top_media           → posts com mais engagement

        Documentação: https://developers.facebook.com/docs/instagram-api/guides/hashtag-search
        """
        # Passo 1: Obter o ID da hashtag
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/ig_hashtag_search",
                params={
                    "user_id": self._account_id,
                    "q": hashtag.lstrip("#"),   # sem o '#'
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            hashtag_id = resp.json().get("data", [{}])[0].get("id")
            if not hashtag_id:
                return []
        except Exception as exc:
            logger.warning(f"Instagram hashtag search error #{hashtag}: {exc}")
            return []

        # Passo 2: Obter posts recentes com essa hashtag
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{hashtag_id}/recent_media",
                params={
                    "user_id": self._account_id,
                    # ATENÇÃO: o campo 'username' NÃO está disponível por política de privacidade
                    "fields": "id,caption,media_type,timestamp,permalink,like_count,comments_count",
                    "limit": 50,
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            posts = resp.json().get("data", [])
        except Exception as exc:
            logger.warning(f"Instagram hashtag posts error #{hashtag}: {exc}")
            return []

        mentions = []
        for post in posts:
            caption = post.get("caption", "").strip()
            if not caption:
                continue

            # Filtra por keywords se fornecidas (hashtag já é filtro suficiente)
            if keywords and not any(kw.lower() in caption.lower() for kw in keywords):
                # Inclui na mesma — o post usou a nossa hashtag, já é relevante
                pass

            mentions.append(
                RawMention(
                    source=self.source,
                    content=caption,
                    url=post.get("permalink"),
                    title=f"Post Instagram #{hashtag}",
                    author=None,   # não disponível via hashtag search
                    published_at=_parse_ig_date(post.get("timestamp")),
                    reach_estimate=post.get("like_count", 0) * 10,
                    influencer_score=_score_from_likes(post.get("like_count", 0)),
                    engagement=post.get("like_count", 0) + post.get("comments_count", 0),
                )
            )

        return mentions

    # ─── Fonte 3: Menções directas (@conta) ───────────────────────────────────

    async def _collect_mentions(self) -> list[RawMention]:
        """
        Recolhe posts e stories onde a tua conta foi mencionada (@suaconta).

        Endpoint: GET /{ig-user-id}/tags
        Requer: instagram_manage_comments
        Documentação: https://developers.facebook.com/docs/instagram-api/reference/ig-user/tags
        """
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._account_id}/tags",
                params={
                    "fields": "id,caption,media_type,timestamp,permalink,like_count,username",
                    "limit": 50,
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            tags = resp.json().get("data", [])
        except Exception as exc:
            logger.debug(f"Instagram mentions (tags) error: {exc}")
            return []

        mentions = []
        for tag in tags:
            caption = tag.get("caption", "").strip()
            if not caption:
                continue

            mentions.append(
                RawMention(
                    source=self.source,
                    content=caption,
                    url=tag.get("permalink"),
                    title="Menção Instagram",
                    author=tag.get("username"),
                    published_at=_parse_ig_date(tag.get("timestamp")),
                    reach_estimate=tag.get("like_count", 0) * 15,
                    influencer_score=_score_from_likes(tag.get("like_count", 0)),
                    engagement=tag.get("like_count", 0),
                )
            )

        return mentions

    # ─── Insights da conta ────────────────────────────────────────────────────

    async def get_account_insights(self) -> dict:
        """
        Obtém métricas da conta: alcance, impressões, seguidores ganhos/perdidos.

        Endpoint: GET /{ig-user-id}/insights
        Métricas disponíveis: impressions, reach, follower_count, profile_views,
                              website_clicks, email_contacts
        Documentação: https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights
        """
        try:
            resp = await self._get(
                f"{GRAPH_API_BASE}/{self._account_id}/insights",
                params={
                    "metric": "reach,impressions,follower_count,profile_views",
                    "period": "day",
                    "access_token": self._token,
                },
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            logger.error(f"Instagram insights error: {exc}")
            return {}

    def _is_configured(self) -> bool:
        return bool(self._token and self._account_id)


# ─── Utilitários ──────────────────────────────────────────────────────────────

def _parse_ig_date(date_str: Optional[str]) -> Optional[datetime]:
    """
    Instagram retorna datas ISO 8601 com timezone UTC:
    "2024-03-15T10:30:00+0000"
    """
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("+0000", "+00:00"))
    except Exception:
        return None


def _score_from_likes(likes: int) -> float:
    """Deriva um influencer score a partir dos likes de um post."""
    if likes >= 100_000:
        return 10.0
    if likes >= 10_000:
        return 8.0
    if likes >= 1_000:
        return 6.0
    if likes >= 100:
        return 4.0
    return min(likes / 50, 2.0)
