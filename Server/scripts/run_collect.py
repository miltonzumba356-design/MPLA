"""Executa uma colecta manual para um projecto específico."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.collectors.registry import CollectorRegistry

KEYWORDS = sys.argv[1:] or ["ReservaAO", "hotel Luanda"]


async def main():
    print(f"Colectando para: {KEYWORDS}")
    registry = CollectorRegistry()
    try:
        mentions = await registry.collect_all(KEYWORDS)
        print(f"\n{len(mentions)} menções encontradas:\n")
        for m in mentions[:20]:
            print(f"[{m.source}] {m.title or m.content[:80]}")
            if m.url:
                print(f"  → {m.url}")
    finally:
        await registry.close()


if __name__ == "__main__":
    asyncio.run(main())
