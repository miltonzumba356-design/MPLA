import logging
from datetime import datetime
from typing import Optional

from app.collectors.base import BaseCollector, RawMention
from app.config import settings

logger = logging.getLogger(__name__)

PLACES_API = "https://maps.googleapis.com/maps/api/place"


class GoogleReviewsCollector(BaseCollector):
    name = "google_reviews"
    source = "google_reviews"

    async def collect(self, keywords: list[str], place_ids: Optional[list[str]] = None, **kwargs) -> list[RawMention]:
        if not settings.GOOGLE_PLACES_API_KEY:
            logger.warning("GOOGLE_PLACES_API_KEY not set — Google Reviews skipped")
            return []

        mentions: list[RawMention] = []

        # If place_ids provided, fetch reviews directly
        if place_ids:
            for place_id in place_ids:
                mentions.extend(await self._fetch_reviews(place_id))
            return mentions

        # Otherwise, search for places matching keywords
        for keyword in keywords:
            place_results = await self._search_places(keyword)
            for place_id in place_results:
                mentions.extend(await self._fetch_reviews(place_id))

        seen: set[str] = set()
        unique = []
        for m in mentions:
            if m.content_hash not in seen:
                seen.add(m.content_hash)
                unique.append(m)

        logger.info(f"GoogleReviews: {len(unique)} reviews collected")
        return unique

    async def _search_places(self, keyword: str) -> list[str]:
        try:
            resp = await self._get(
                f"{PLACES_API}/textsearch/json",
                params={
                    "query": keyword,
                    "key": settings.GOOGLE_PLACES_API_KEY,
                    "region": "ao",
                    "language": "pt",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return [r["place_id"] for r in data.get("results", [])[:3]]
        except Exception as exc:
            logger.warning(f"Places search error: {exc}")
            return []

    async def _fetch_reviews(self, place_id: str) -> list[RawMention]:
        try:
            resp = await self._get(
                f"{PLACES_API}/details/json",
                params={
                    "place_id": place_id,
                    "fields": "name,reviews,rating",
                    "key": settings.GOOGLE_PLACES_API_KEY,
                    "language": "pt",
                },
            )
            resp.raise_for_status()
            data = resp.json().get("result", {})
        except Exception as exc:
            logger.warning(f"Place details error {place_id}: {exc}")
            return []

        place_name = data.get("name", "")
        mentions = []
        for review in data.get("reviews", []):
            text = review.get("text", "").strip()
            if not text:
                continue
            mentions.append(
                RawMention(
                    source=self.source,
                    content=text,
                    url=f"https://maps.google.com/?cid={place_id}",
                    title=f"Review: {place_name} — {review.get('rating', '?')}★",
                    author=review.get("author_name"),
                    published_at=_ts(review.get("time")),
                    reach_estimate=500,
                    influencer_score=0.0,
                    engagement=review.get("rating", 3),
                )
            )
        return mentions


def _ts(unix_ts: Optional[int]) -> Optional[datetime]:
    if not unix_ts:
        return None
    try:
        return datetime.utcfromtimestamp(unix_ts)
    except Exception:
        return None
