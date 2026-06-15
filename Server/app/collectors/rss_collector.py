import logging
from datetime import datetime
from email.utils import parsedate_to_datetime
from urllib.parse import quote_plus

import feedparser

from app.collectors.base import BaseCollector, RawMention

logger = logging.getLogger(__name__)

# Fontes RSS angolanas + globais relevantes para Angola
RSS_SOURCES = [
    # Google News PT
    "https://news.google.com/rss/search?q={query}&hl=pt-PT&gl=AO&ceid=AO:pt-419",
    # Jornais angolanos
    "https://jornaldeangola.sapo.ao/feed/",
    "https://www.angop.ao/angola/pt_pt/rss/",
    "https://www.voanews.com/api/zkmqoeiviq",
    "https://expansao.co.ao/feed/",
    "https://novojornal.co.ao/feed/",
    "https://www.opais.net/feed/",
    "https://club-k.net/index.php?format=feed&type=rss",
]

GOOGLE_NEWS_TPL = "https://news.google.com/rss/search?q={query}&hl=pt-PT&gl=AO&ceid=AO:pt-419"


class RSSCollector(BaseCollector):
    name = "rss"
    source = "rss"

    async def collect(self, keywords: list[str], **kwargs) -> list[RawMention]:
        mentions: list[RawMention] = []

        for keyword in keywords:
            url = GOOGLE_NEWS_TPL.format(query=quote_plus(keyword))
            mentions.extend(await self._parse_feed(url, keywords))

        for source_url in RSS_SOURCES[1:]:  # skip Google News template
            mentions.extend(await self._parse_feed(source_url, keywords))

        seen: set[str] = set()
        unique: list[RawMention] = []
        for m in mentions:
            if m.content_hash not in seen:
                seen.add(m.content_hash)
                unique.append(m)

        logger.info(f"RSS: {len(unique)} unique mentions for {keywords}")
        return unique

    async def _parse_feed(self, url: str, keywords: list[str]) -> list[RawMention]:
        try:
            response = await self._get(url)
            feed = feedparser.parse(response.text)
        except Exception as exc:
            logger.warning(f"RSS feed error {url}: {exc}")
            return []

        mentions = []
        for entry in feed.entries:
            content = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
            title = getattr(entry, "title", "")
            full_text = f"{title} {content}"

            if not any(kw.lower() in full_text.lower() for kw in keywords):
                continue

            published_at = None
            if hasattr(entry, "published"):
                try:
                    published_at = parsedate_to_datetime(entry.published)
                except Exception:
                    pass

            mentions.append(
                RawMention(
                    source=self.source,
                    content=content or title,
                    url=getattr(entry, "link", None),
                    title=title,
                    author=getattr(entry, "author", None),
                    published_at=published_at,
                    reach_estimate=self._estimate_reach(url),
                )
            )

        return mentions

    def _estimate_reach(self, url: str) -> int:
        if "google.com" in url:
            return 50_000
        reach_map = {
            "jornaldeangola": 80_000,
            "angop": 60_000,
            "novojornal": 40_000,
            "opais": 35_000,
            "expansao": 30_000,
            "club-k": 25_000,
        }
        for key, val in reach_map.items():
            if key in url:
                return val
        return 10_000
