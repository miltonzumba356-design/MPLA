"""Geração de relatórios diários/semanais com Claude."""
import logging
from datetime import datetime, timedelta

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

REPORT_SYSTEM = """És o ClacsBrain, analista de reputação para marcas angolanas.
Gera relatórios executivos concisos em português europeu (sem calão), formatados para WhatsApp.
Usa *negrito* para títulos e emojis para destacar pontos-chave."""


def _format_report_prompt(project_name: str, period: str, stats: dict, top_mentions: list[dict]) -> str:
    mention_summaries = "\n".join(
        f"- [{m['source']}] {m['sentiment']} | {m['summary']}" for m in top_mentions[:10]
    )
    return f"""Cria um relatório executivo para:

Marca: {project_name}
Período: {period}

Estatísticas:
- Total de menções: {stats.get('total', 0)}
- Positivas: {stats.get('positive', 0)}
- Negativas: {stats.get('negative', 0)}
- Neutras: {stats.get('neutral', 0)}
- Score de sentimento médio: {stats.get('avg_score', 0):.2f}

Menções mais relevantes:
{mention_summaries}

Inclui: resumo executivo, principais insights, alertas activos, recomendações de acção.
Formato: WhatsApp (máximo 800 palavras)."""


async def generate_report(
    project_name: str,
    period_start: datetime,
    period_end: datetime,
    stats: dict,
    top_mentions: list[dict],
) -> str:
    period_str = f"{period_start.strftime('%d/%m/%Y')} – {period_end.strftime('%d/%m/%Y')}"
    prompt = _format_report_prompt(project_name, period_str, stats, top_mentions)

    try:
        message = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=1024,
            system=REPORT_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    except Exception as exc:
        logger.error(f"Report generation failed: {exc}")
        return f"Erro ao gerar relatório: {exc}"
