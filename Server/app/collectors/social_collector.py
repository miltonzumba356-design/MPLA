import logging
from datetime import datetime
from typing import Optional

import httpx

from app.collectors.base import BaseCollector, RawMention
from app.config import settings

logger = logging.getLogger(__name__)

SOCIALFETCH_BASE = "https://api.socialfetch.dev/v1"

PLATFORMS = ["instagram", "twitter", "facebook", "tiktok", "youtube"]


class SocialCollector(BaseCollector):
    name = "social"
    source = "instagram"  # overridden per-platform

    async def collect(self, keywords: list[str], platforms: Optional[list[str]] = None, **kwargs) -> list[RawMention]:
        if not settings.SOCIALFETCH_API_KEY:
            logger.warning("SOCIALFETCH_API_KEY not set — social collection skipped")
            return []

        platforms = platforms or PLATFORMS
        mentions: list[RawMention] = []

        for keyword in keywords:
            for platform in platforms:
                results = await self._search(keyword, platform)
                mentions.extend(results)

        seen: set[str] = set()
        unique = []
        for m in mentions:
            if m.content_hash not in seen:
                seen.add(m.content_hash)
                unique.append(m)

        logger.info(f"Social: {len(unique)} unique mentions for {keywords}")
        return unique

    async def _search(self, keyword: str, platform: str) -> list[RawMention]:
        try:
            resp = await self.client.get(
                f"{SOCIALFETCH_BASE}/search",
                params={"query": keyword, "platform": platform, "limit": 25},
                headers={"Authorization": f"Bearer {settings.SOCIALFETCH_API_KEY}"},
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.warning(f"SocialFetch {platform}/{keyword}: {exc}")
            return []

        mentions = []
        for item in data.get("results", []):
            mentions.append(
                RawMention(
                    source=platform,
                    content=item.get("text", ""),
                    url=item.get("url"),
                    title=None,
                    author=item.get("author", {}).get("username"),
                    published_at=_parse_dt(item.get("created_at")),
                    reach_estimate=item.get("author", {}).get("followers", 0),
                    influencer_score=_influencer_score(item.get("author", {}).get("followers", 0)),
                    engagement=item.get("likes", 0) + item.get("comments", 0) + item.get("shares", 0),
                )
            )
        return mentions


def _parse_dt(val: Optional[str]) -> Optional[datetime]:
    if not val:
        return None
    try:
        return datetime.fromisoformat(val.replace("Z", "+00:00"))
    except Exception:
        return None


def _influencer_score(followers: int) -> float:
    if followers >= 1_000_000:
        return 10.0
    if followers >= 100_000:
        return 8.0
    if followers >= 10_000:
        return 6.0
    if followers >= 1_000:
        return 4.0
    return max(0.0, followers / 1000)
