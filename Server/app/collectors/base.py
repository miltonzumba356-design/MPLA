import hashlib
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class RawMention:
    def __init__(
        self,
        source: str,
        content: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
        author: Optional[str] = None,
        published_at: Optional[datetime] = None,
        reach_estimate: int = 0,
        influencer_score: float = 0.0,
        engagement: int = 0,
    ):
        self.source = source
        self.content = content
        self.url = url
        self.title = title
        self.author = author
        self.published_at = published_at
        self.reach_estimate = reach_estimate
        self.influencer_score = influencer_score
        self.engagement = engagement
        self.content_hash = self._hash()

    def _hash(self) -> str:
        key = (self.url or "") + self.content[:200]
        return hashlib.sha256(key.encode()).hexdigest()

    def matches_keywords(self, keywords: list[str]) -> bool:
        text = f"{self.title or ''} {self.content}".lower()
        return any(kw.lower() in text for kw in keywords)

    def to_dict(self) -> dict:
        return {
            "source": self.source,
            "content": self.content,
            "url": self.url,
            "title": self.title,
            "author": self.author,
            "published_at": self.published_at,
            "reach_estimate": self.reach_estimate,
            "influencer_score": self.influencer_score,
            "engagement": self.engagement,
            "content_hash": self.content_hash,
        }


class BaseCollector(ABC):
    name: str = "base"
    source: str = "web"

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "ClacsListening/1.0 (+https://clacslistening.ao)"},
            follow_redirects=True,
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _get(self, url: str, **kwargs) -> httpx.Response:
        return await self.client.get(url, **kwargs)

    @abstractmethod
    async def collect(self, keywords: list[str], **kwargs) -> list[RawMention]:
        """Collect mentions for the given keywords."""
        ...

    async def close(self):
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()
