"""
Orquestrador de colectores — corre todos em paralelo e devolve menções deduplicadas.

Colectores activos:
  1. RSSCollector         — Google News + jornais angolanos (sem autenticação)
  2. GoogleReviewsCollector — Google Maps Places API
  3. FacebookCollector    — Comentários, avaliações e menções na Página Facebook
  4. InstagramCollector   — Posts com hashtag, comentários e menções @conta
  5. TikTokCollector      — Vídeos por keyword (Research API ou Apify)
  6. SocialCollector      — SocialFetch.dev (fallback genérico para redes sociais)

Os colectores de redes sociais nativas (Facebook, Instagram, TikTok) substituem
o SocialCollector para essas plataformas quando configurados. O SocialCollector
mantém-se como fallback e para plataformas sem integração dedicada.
"""

import asyncio
import logging
from typing import Optional

from app.collectors.base import RawMention
from app.collectors.rss_collector import RSSCollector
from app.collectors.social_collector import SocialCollector
from app.collectors.google_reviews_collector import GoogleReviewsCollector
from app.integrations.facebook import FacebookCollector
from app.integrations.instagram import InstagramCollector
from app.integrations.tiktok import TikTokCollector

logger = logging.getLogger(__name__)


class CollectorRegistry:
    """Corre todos os colectores em paralelo e devolve menções únicas."""

    def __init__(self):
        # Colectores sempre activos (sem autenticação obrigatória)
        self.rss = RSSCollector()
        self.reviews = GoogleReviewsCollector()

        # Redes sociais nativas — activas se configuradas no .env
        self.facebook = FacebookCollector()
        self.instagram = InstagramCollector()
        self.tiktok = TikTokCollector()

        # Fallback genérico (SocialFetch.dev) — cobre plataformas não integradas
        # e serve de backup quando as APIs nativas falham
        self.social_fallback = SocialCollector()

    async def collect_all(
        self,
        keywords: list[str],
        place_ids: Optional[list[str]] = None,
        hashtags: Optional[list[str]] = None,
    ) -> list[RawMention]:
        """
        Executa todos os colectores em paralelo.

        Parâmetros:
          keywords  — termos a monitorizar (ex: ['ReservaAO', 'hotel Luanda'])
          place_ids — IDs do Google Maps para reviews (ex: ['ChIJxxxx'])
          hashtags  — hashtags Instagram/TikTok (derivadas dos keywords se None)
        """
        tasks = [
            # Imprensa e RSS angolanos — sempre corre
            self.rss.collect(keywords),

            # Google Reviews — corre se GOOGLE_PLACES_API_KEY configurado
            self.reviews.collect(keywords, place_ids=place_ids),

            # Facebook — corre se FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID configurados
            self.facebook.collect(keywords),

            # Instagram — corre se INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID configurados
            self.instagram.collect(keywords, hashtags=hashtags),

            # TikTok — corre se TIKTOK_CLIENT_KEY/SECRET ou TIKTOK_USE_APIFY=true configurados
            self.tiktok.collect(keywords),

            # SocialFetch fallback — corre se SOCIALFETCH_API_KEY configurado
            # Exclui plataformas já cobertas pelas integrações nativas
            self.social_fallback.collect(keywords, platforms=["youtube"]),
        ]

        # gather com return_exceptions=True garante que uma falha não para os outros
        results = await asyncio.gather(*tasks, return_exceptions=True)

        collector_names = ["rss", "google_reviews", "facebook", "instagram", "tiktok", "social_fallback"]
        all_mentions: list[RawMention] = []

        for name, result in zip(collector_names, results):
            if isinstance(result, Exception):
                logger.error(f"Collector '{name}' falhou: {result}")
            elif isinstance(result, list):
                logger.debug(f"Collector '{name}': {len(result)} menções")
                all_mentions.extend(result)

        # Dedup global por content_hash
        seen: set[str] = set()
        unique = []
        for m in all_mentions:
            if m.content_hash not in seen:
                seen.add(m.content_hash)
                unique.append(m)

        logger.info(
            f"Registry: {len(unique)} menções únicas "
            f"(total antes de dedup: {len(all_mentions)})"
        )
        return unique

    async def close(self):
        """Fecha todas as sessões HTTP abertas pelos colectores."""
        await asyncio.gather(
            self.rss.close(),
            self.reviews.close(),
            self.facebook.close(),
            self.instagram.close(),
            self.tiktok.close(),
            self.social_fallback.close(),
            return_exceptions=True,  # não falha se algum já estiver fechado
        )
