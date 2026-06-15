"""Testa os colectores com dados simulados (sem rede)."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.collectors.base import RawMention
from app.core.alerts import should_create_alert, map_severity


def test_raw_mention_hash():
    m1 = RawMention(source="rss", content="ReservaAO lança nova plataforma", url="https://example.ao/post/1")
    m2 = RawMention(source="rss", content="ReservaAO lança nova plataforma", url="https://example.ao/post/1")
    assert m1.content_hash == m2.content_hash, "Hash deve ser determinístico"
    print("✓ content_hash determinístico")


def test_keyword_matching():
    m = RawMention(source="rss", content="O ReservaAO está a crescer em Luanda", title="Notícia")
    assert m.matches_keywords(["ReservaAO", "hotel"])
    assert not m.matches_keywords(["TripAdvisor", "Booking"])
    print("✓ keyword matching OK")


def test_dedup():
    mentions = [
        RawMention(source="rss", content="Texto A", url="https://a.ao"),
        RawMention(source="rss", content="Texto A", url="https://a.ao"),
        RawMention(source="rss", content="Texto B", url="https://b.ao"),
    ]
    seen = set()
    unique = []
    for m in mentions:
        if m.content_hash not in seen:
            seen.add(m.content_hash)
            unique.append(m)
    assert len(unique) == 2
    print("✓ deduplicação OK")


def test_alert_logic():
    assert should_create_alert("critical")
    assert should_create_alert("high")
    assert should_create_alert("medium")
    assert should_create_alert("low")
    assert not should_create_alert("none")
    print("✓ lógica de alertas OK")


def test_severity_mapping():
    from app.models.models import AlertSeverity
    assert map_severity("critical") == AlertSeverity.critical
    assert map_severity("high") == AlertSeverity.high
    assert map_severity("medium") == AlertSeverity.medium
    assert map_severity("low") == AlertSeverity.low
    print("✓ mapeamento de severidade OK")


def test_influencer_score():
    from app.collectors.social_collector import _influencer_score
    assert _influencer_score(1_500_000) == 10.0
    assert _influencer_score(500_000) == 8.0
    assert _influencer_score(50_000) == 6.0
    assert _influencer_score(5_000) == 4.0
    assert _influencer_score(500) == 0.5
    print("✓ influencer score OK")


if __name__ == "__main__":
    test_raw_mention_hash()
    test_keyword_matching()
    test_dedup()
    test_alert_logic()
    test_severity_mapping()
    test_influencer_score()
    print("\n✓ Todos os testes passaram")
