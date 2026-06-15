"""ClacsBrain — analisa menções com Claude API, especializado em português angolano."""
import json
import logging
from dataclasses import dataclass
from typing import Optional

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """És o ClacsBrain, um analista especializado em reputação de marcas no mercado angolano.
Analisas menções em português angolano (incluindo calão de Luanda como "ganda", "fixe", "na boa", "ya", "maningue").

Responde SEMPRE em JSON válido com esta estrutura exacta:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentiment_score": <float entre -1.0 e 1.0>,
  "topics": ["lista", "de", "tópicos"],
  "summary": "<resumo em 1-2 frases em PT>",
  "action_recommended": "<acção recomendada ou null>",
  "alert_severity": "none" | "low" | "medium" | "high" | "critical",
  "alert_reason": "<razão para o alerta ou null>"
}

Critérios de alerta:
- critical: crise de reputação, acusações graves, viral negativo
- high: reclamação pública recorrente, influencer negativo
- medium: menção negativa com algum alcance
- low: menção negativa menor
- none: neutro ou positivo"""


@dataclass
class BrainResult:
    sentiment: str
    sentiment_score: float
    topics: list[str]
    summary: str
    action_recommended: Optional[str]
    alert_severity: str
    alert_reason: Optional[str]


async def analyse_mention(
    content: str,
    title: Optional[str],
    source: str,
    author: Optional[str],
    reach: int,
    industry: str = "hospitality",
) -> Optional[BrainResult]:
    prompt = f"""Analisa esta menção e devolve JSON:

Fonte: {source}
Autor: {author or "desconhecido"}
Alcance estimado: {reach:,} pessoas
Indústria: {industry}
Título: {title or "(sem título)"}

Conteúdo:
{content[:2000]}"""

    try:
        message = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=512,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()

        # Extract JSON from possible markdown code block
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        data = json.loads(raw)
        return BrainResult(
            sentiment=data.get("sentiment", "neutral"),
            sentiment_score=float(data.get("sentiment_score", 0.0)),
            topics=data.get("topics", []),
            summary=data.get("summary", ""),
            action_recommended=data.get("action_recommended"),
            alert_severity=data.get("alert_severity", "none"),
            alert_reason=data.get("alert_reason"),
        )
    except Exception as exc:
        logger.error(f"Brain analysis failed: {exc}")
        return None
