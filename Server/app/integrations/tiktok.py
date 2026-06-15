"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              INTEGRAÇÃO TIKTOK API — ClacsListening                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ONDE ENCONTRAR A API:                                                       ║
║  https://developers.tiktok.com                                               ║
║                                                                              ║
║  IMPORTANTE — CONTEXTO DA API TIKTOK:                                        ║
║  O TikTok tem TRÊS APIs distintas com acesso muito diferente:                ║
║                                                                              ║
║  A) TikTok for Developers — Login Kit + Content Posting API                  ║
║     Para: contas de utilizadores que deram consentimento (OAuth)             ║
║     Acesso: médio (aprovação necessária)                                     ║
║     URL: https://developers.tiktok.com/products/login-kit/                  ║
║                                                                              ║
║  B) TikTok Research API (usada aqui para social listening)                   ║
║     Para: investigadores académicos e empresas (aprovação obrigatória)       ║
║     Acesso: pesquisa de vídeos e comentários por hashtag/keyword             ║
║     URL: https://developers.tiktok.com/products/research-api/               ║
║     NOTA: Aprovação demora 2-4 semanas e requer justificação de uso          ║
║                                                                              ║
║  C) TikTok Display API — descontinuada em 2024                               ║
║                                                                              ║
║  ALTERNATIVA PARA COMEÇAR MAIS RÁPIDO:                                       ║
║  Se ainda não tens aprovação da Research API, usa uma destas alternativas:  ║
║  - Apify TikTok Scraper: https://apify.com/clockworks/tiktok-scraper         ║
║    (~$0.50/1000 vídeos, sem aprovação necessária)                            ║
║  - Phantombuster TikTok: https://phantombuster.com/automations/tiktok        ║
║  - SocialFetch.dev (já integrado no social_collector.py): suporta TikTok    ║
║                                                                              ║
║  COMO OBTER A RESEARCH API:                                                  ║
║  1. Vai a https://developers.tiktok.com/application/                         ║
║  2. Cria uma aplicação → tipo "Research"                                     ║
║  3. Preenche o formulário de aprovação (inglês, detalha o caso de uso)       ║
║  4. Aguarda aprovação (2-4 semanas)                                          ║
║  5. Após aprovação, recebes CLIENT_KEY e CLIENT_SECRET                       ║
║                                                                              ║
║  AUTENTICAÇÃO — CLIENT CREDENTIALS FLOW:                                     ║
║  POST https://open.tiktokapis.com/v2/oauth/token/                            ║
║  Body: grant_type=client_credentials&client_key=...&client_secret=...        ║
║  O token expira em 7200 segundos (2h) — renovação automática implementada   ║
║                                                                              ║
║  RATE LIMITS DA RESEARCH API:                                                ║
║  - 1.000 pedidos/dia por app                                                 ║
║  - Máximo 100 vídeos por query                                               ║
║  - Janela de dados: últimos 30 dias                                          ║
║                                                                              ║
║  VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env):                                  ║
║  TIKTOK_CLIENT_KEY=xxxxxxxxxxxxxxxxxx                                        ║
║  TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                       ║
║  TIKTOK_USE_APIFY=false          # true para usar Apify como fallback        ║
║  APIFY_API_TOKEN=apify_api_...   # necessário se TIKTOK_USE_APIFY=true       ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import httpx

from app.collectors.base import BaseCollector, RawMention
from app.config import settings

logger = logging.getLogger(__name__)

# Endpoints da Research API
TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
TIKTOK_RESEARCH_BASE = "https://open.tiktokapis.com/v2/research"

# Endpoint do Apify (alternativa sem aprovação)
APIFY_BASE = "https://api.apify.com/v2"
APIFY_TIKTOK_ACTOR = "clockworks~tiktok-scraper"


class TikTokCollector(BaseCollector):
    """
    Monitoriza menções e vídeos no TikTok.

    Usa a Research API oficial quando configurada,
    com fallback para Apify se TIKTOK_USE_APIFY=true.
    """

    name = "tiktok"
    source = "tiktok"

    def __init__(self):
        super().__init__()
        self._client_key = settings.TIKTOK_CLIENT_KEY
        self._client_secret = settings.TIKTOK_CLIENT_SECRET
        self._use_apify = settings.TIKTOK_USE_APIFY
        self._apify_token = settings.APIFY_API_TOKEN

        # Cache do access token (expira em 2h)
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None

    async def collect(self, keywords: list[str], **kwargs) -> list[RawMention]:
        """Colecta vídeos TikTok para os keywords fornecidos."""
        if self._use_apify and self._apify_token:
            # Caminho rápido: Apify não requer aprovação
            return await self._collect_via_apify(keywords)

        if not self._is_configured():
            logger.warning(
                "TikTok não configurado. "
                "Define TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET, "
                "ou usa TIKTOK_USE_APIFY=true com APIFY_API_TOKEN."
            )
            return []

        mentions: list[RawMention] = []
        for keyword in keywords:
            mentions += await self._search_videos(keyword)

        # Dedup
        seen: set[str] = set()
        unique = [m for m in mentions if not (m.content_hash in seen or seen.add(m.content_hash))]

        logger.info(f"TikTok: {len(unique)} vídeos únicos para {keywords}")
        return unique

    # ─── Research API — Pesquisa de Vídeos ────────────────────────────────────

    async def _search_videos(self, keyword: str) -> list[RawMention]:
        """
        Pesquisa vídeos TikTok por keyword/hashtag.

        Endpoint: POST /v2/research/video/query/
        Campos disponíveis: id, create_time, username, region_code,
                            video_description, music_id, like_count,
                            comment_count, share_count, view_count,
                            hashtag_names, effect_ids

        Documentação: https://developers.tiktok.com/doc/research-api-specs-query-videos
        """
        token = await self._get_access_token()
        if not token:
            return []

        # A Research API usa uma query estruturada (não texto livre simples)
        # AND/OR entre condições — documentação completa:
        # https://developers.tiktok.com/doc/research-api-specs-query-videos#query_object
        query = {
            "and": [
                {
                    # Pesquisa no texto da descrição do vídeo
                    "operation": "IN",
                    "field_name": "keyword",
                    "field_values": [keyword],
                }
            ]
        }

        # A janela de datas é obrigatória — máximo 30 dias
        now = datetime.utcnow()
        start_date = (now - timedelta(days=7)).strftime("%Y%m%d")
        end_date = now.strftime("%Y%m%d")

        payload = {
            "query": query,
            "start_date": start_date,
            "end_date": end_date,
            "max_count": 100,          # máximo por chamada
            "cursor": 0,               # para paginação (incrementa com cada página)
            "search_id": "",           # vazio na primeira chamada
            "is_random": False,        # True para amostragem aleatória
        }

        try:
            resp = await self.client.post(
                f"{TIKTOK_RESEARCH_BASE}/video/query/",
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            videos = data.get("videos", [])
        except Exception as exc:
            logger.error(f"TikTok Research API error para '{keyword}': {exc}")
            return []

        mentions = []
        for video in videos:
            description = video.get("video_description", "").strip()
            username = video.get("username", "")
            view_count = video.get("view_count", 0)
            like_count = video.get("like_count", 0)
            comment_count = video.get("comment_count", 0)
            share_count = video.get("share_count", 0)
            video_id = video.get("id", "")
            hashtags = video.get("hashtag_names", [])

            if not description and not hashtags:
                continue

            content = description or f"#{' #'.join(hashtags)}"

            mentions.append(
                RawMention(
                    source=self.source,
                    content=content,
                    url=f"https://www.tiktok.com/@{username}/video/{video_id}" if username and video_id else None,
                    title=f"TikTok @{username}" if username else "TikTok vídeo",
                    author=username,
                    published_at=_ts_to_datetime(video.get("create_time")),
                    # View count é a melhor métrica de alcance no TikTok
                    reach_estimate=view_count,
                    influencer_score=_tiktok_influencer_score(view_count),
                    engagement=like_count + comment_count + share_count,
                )
            )

        return mentions

    # ─── Alternativa: Apify TikTok Scraper ────────────────────────────────────

    async def _collect_via_apify(self, keywords: list[str]) -> list[RawMention]:
        """
        Usa o Apify TikTok Scraper como alternativa à Research API.

        Vantagens: sem aprovação necessária, acesso imediato
        Desvantagens: custo (~$0.50/1000 resultados), não é API oficial

        Como configurar o Apify:
          1. Cria conta em https://apify.com
          2. Vai a Console → Actors → clockworks/tiktok-scraper
          3. Clica em "Try for free" para testar
          4. Em Account → Integrations, encontras o APIFY_API_TOKEN

        Documentação do actor: https://apify.com/clockworks/tiktok-scraper
        """
        mentions = []

        # Parâmetros do actor Apify — documentação em:
        # https://apify.com/clockworks/tiktok-scraper/input-schema
        actor_input = {
            "searchQueries": keywords,
            "resultsPerPage": 30,
            "maxProfilesPerQuery": 1,
            "shouldDownloadVideos": False,    # economiza custos
            "shouldDownloadCovers": False,
            "shouldDownloadSubtitles": False,
            "shouldDownloadSlideshowImages": False,
        }

        try:
            # Inicia o actor (execução assíncrona)
            resp = await self.client.post(
                f"{APIFY_BASE}/acts/{APIFY_ACTOR_TIKTOK}/runs",
                json={"input": actor_input},
                headers={"Authorization": f"Bearer {self._apify_token}"},
                params={"timeout": 60, "memory": 256},
                timeout=90,
            )
            resp.raise_for_status()
            run_id = resp.json().get("data", {}).get("id")
            if not run_id:
                return []

            # Aguarda conclusão (polling simples)
            for _ in range(12):  # até 60 segundos
                import asyncio
                await asyncio.sleep(5)

                status_resp = await self.client.get(
                    f"{APIFY_BASE}/actor-runs/{run_id}",
                    headers={"Authorization": f"Bearer {self._apify_token}"},
                )
                run_data = status_resp.json().get("data", {})
                if run_data.get("status") in ("SUCCEEDED", "FAILED"):
                    break

            if run_data.get("status") != "SUCCEEDED":
                logger.error(f"Apify TikTok run failed: {run_data.get('status')}")
                return []

            # Recolhe resultados
            dataset_id = run_data.get("defaultDatasetId")
            items_resp = await self.client.get(
                f"{APIFY_BASE}/datasets/{dataset_id}/items",
                headers={"Authorization": f"Bearer {self._apify_token}"},
                params={"format": "json", "limit": 200},
            )
            items_resp.raise_for_status()
            items = items_resp.json()

        except Exception as exc:
            logger.error(f"Apify TikTok error: {exc}")
            return []

        for item in items:
            text = item.get("text", "").strip()
            if not text:
                continue

            author = item.get("authorMeta", {}).get("name") or item.get("author", "")
            plays = item.get("playCount", 0)
            likes = item.get("diggCount", 0)
            comments = item.get("commentCount", 0)
            shares = item.get("shareCount", 0)

            mentions.append(
                RawMention(
                    source=self.source,
                    content=text,
                    url=item.get("webVideoUrl"),
                    title=f"TikTok @{author}" if author else "TikTok vídeo",
                    author=author,
                    published_at=_ts_to_datetime(item.get("createTime")),
                    reach_estimate=plays,
                    influencer_score=_tiktok_influencer_score(plays),
                    engagement=likes + comments + shares,
                )
            )

        logger.info(f"Apify TikTok: {len(mentions)} vídeos para {keywords}")
        return mentions

    # ─── Autenticação ─────────────────────────────────────────────────────────

    async def _get_access_token(self) -> Optional[str]:
        """
        Obtém ou renova o access token via Client Credentials.

        Endpoint: POST https://open.tiktokapis.com/v2/oauth/token/
        Documentação: https://developers.tiktok.com/doc/oauth-user-access-token-management

        O token expira em 7200s (2h) — renovamos automaticamente.
        """
        now = datetime.utcnow()

        # Usa token em cache se ainda válido (com 60s de margem)
        if self._access_token and self._token_expires_at:
            if now < self._token_expires_at - timedelta(seconds=60):
                return self._access_token

        try:
            resp = await self.client.post(
                TIKTOK_TOKEN_URL,
                data={
                    "client_key": self._client_key,
                    "client_secret": self._client_secret,
                    "grant_type": "client_credentials",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()

            self._access_token = data.get("access_token")
            expires_in = data.get("expires_in", 7200)
            self._token_expires_at = now + timedelta(seconds=expires_in)

            logger.debug("TikTok access token renovado")
            return self._access_token
        except Exception as exc:
            logger.error(f"TikTok token error: {exc}")
            return None

    def _is_configured(self) -> bool:
        return bool(self._client_key and self._client_secret)


# ─── Utilitários ──────────────────────────────────────────────────────────────

def _ts_to_datetime(timestamp) -> Optional[datetime]:
    """Converte UNIX timestamp (int ou str) para datetime."""
    if not timestamp:
        return None
    try:
        return datetime.utcfromtimestamp(int(timestamp))
    except Exception:
        return None


def _tiktok_influencer_score(view_count: int) -> float:
    """
    No TikTok o alcance é medido em views, não em seguidores.
    Um vídeo viral com 1M views de uma conta pequena é mais relevante
    do que um vídeo com 1k views de uma conta com 1M seguidores.
    """
    if view_count >= 10_000_000:
        return 10.0
    if view_count >= 1_000_000:
        return 8.5
    if view_count >= 100_000:
        return 7.0
    if view_count >= 10_000:
        return 5.0
    if view_count >= 1_000:
        return 3.0
    return max(0.0, view_count / 1000)


# Corrige referência ao actor Apify que ficou com nome errado
APIFY_ACTOR_TIKTOK = APIFY_TIKTOK_ACTOR
