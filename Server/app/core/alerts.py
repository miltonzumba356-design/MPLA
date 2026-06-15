import logging
from datetime import datetime
from typing import Optional

import httpx

from app.config import settings
from app.models.models import Alert, AlertSeverity, AlertStatus, Mention, Project

logger = logging.getLogger(__name__)

WHATSAPP_API = "https://graph.facebook.com/v19.0/{phone_id}/messages"


def _severity_emoji(severity: AlertSeverity) -> str:
    return {
        AlertSeverity.critical: "🔴",
        AlertSeverity.high: "🟠",
        AlertSeverity.medium: "🟡",
        AlertSeverity.low: "🔵",
    }.get(severity, "⚪")


def build_alert_message(alert: Alert, project: Project, mention: Optional[Mention] = None) -> str:
    emoji = _severity_emoji(alert.severity)
    lines = [
        f"{emoji} *ClacsListening — Alerta {alert.severity.value.upper()}*",
        f"Projecto: {project.name}",
        f"",
        f"*{alert.title}*",
        f"{alert.description}",
    ]
    if mention:
        lines += [
            f"",
            f"Fonte: {mention.source.value}",
            f"Alcance: {mention.reach_estimate:,} pessoas",
        ]
        if mention.url:
            lines.append(f"Link: {mention.url}")
        if mention.action_recommended:
            lines.append(f"",
                         f"💡 Acção: {mention.action_recommended}")
    return "\n".join(lines)


async def send_whatsapp_message(to: str, body: str) -> bool:
    if not settings.WHATSAPP_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.warning("WhatsApp not configured — alert not sent")
        return False

    url = WHATSAPP_API.format(phone_id=settings.WHATSAPP_PHONE_NUMBER_ID)
    payload = {
        "messaging_product": "whatsapp",
        "to": to.lstrip("+"),
        "type": "text",
        "text": {"body": body},
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {settings.WHATSAPP_TOKEN}"},
                timeout=15,
            )
            resp.raise_for_status()
            return True
    except Exception as exc:
        logger.error(f"WhatsApp send failed: {exc}")
        return False


def should_create_alert(severity: str) -> bool:
    return severity in ("low", "medium", "high", "critical")


def map_severity(severity_str: str) -> AlertSeverity:
    return {
        "low": AlertSeverity.low,
        "medium": AlertSeverity.medium,
        "high": AlertSeverity.high,
        "critical": AlertSeverity.critical,
    }.get(severity_str, AlertSeverity.low)
