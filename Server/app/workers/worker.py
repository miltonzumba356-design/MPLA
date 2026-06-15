"""ARQ background worker — colecta, analisa, reporta."""
import logging
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_session_factory, engine
from app.models.models import (
    Project, Keyword, Mention, Alert, Report, Tenant, ReportType
)
from app.collectors.registry import CollectorRegistry
from app.core.brain import analyse_mention
from app.core.alerts import (
    build_alert_message, send_whatsapp_message,
    should_create_alert, map_severity,
)
from app.core.reports import generate_report
from app.config import settings

logger = logging.getLogger(__name__)


async def task_collect(ctx):
    """Corre todos os colectores para todos os projectos activos."""
    async with get_session_factory()() as db:
        result = await db.execute(select(Project).where(Project.is_active == True))
        projects = result.scalars().all()

        registry = CollectorRegistry()
        try:
            for project in projects:
                kw_result = await db.execute(
                    select(Keyword).where(Keyword.project_id == project.id, Keyword.is_active == True)
                )
                keywords = [kw.term for kw in kw_result.scalars().all()]
                if not keywords:
                    continue

                mentions = await registry.collect_all(keywords)
                new_count = 0

                for raw in mentions:
                    # Skip duplicates
                    exists = await db.execute(
                        select(Mention.id).where(Mention.content_hash == raw.content_hash)
                    )
                    if exists.scalar_one_or_none():
                        continue

                    mention = Mention(
                        project_id=project.id,
                        **raw.to_dict(),
                    )
                    db.add(mention)
                    new_count += 1

                await db.commit()
                logger.info(f"[collect] project={project.id} new={new_count}")
        finally:
            await registry.close()


async def task_brain(ctx):
    """Processa menções não analisadas com o ClacsBrain."""
    async with get_session_factory()() as db:
        result = await db.execute(
            select(Mention).where(Mention.processed == False).limit(100)
        )
        mentions = result.scalars().all()

        for mention in mentions:
            # Get project for industry context
            proj_result = await db.execute(select(Project).where(Project.id == mention.project_id))
            project = proj_result.scalar_one_or_none()
            industry = project.industry if project else "hospitality"

            analysis = await analyse_mention(
                content=mention.content,
                title=mention.title,
                source=mention.source.value,
                author=mention.author,
                reach=mention.reach_estimate,
                industry=industry,
            )

            if analysis:
                mention.sentiment = analysis.sentiment
                mention.sentiment_score = analysis.sentiment_score
                mention.topics = analysis.topics
                mention.summary = analysis.summary
                mention.action_recommended = analysis.action_recommended
                mention.processed = True
                mention.processed_at = datetime.utcnow()

                # Create alert if needed
                if should_create_alert(analysis.alert_severity) and project:
                    alert = Alert(
                        project_id=project.id,
                        mention_id=mention.id,
                        severity=map_severity(analysis.alert_severity),
                        title=f"Alerta: {analysis.alert_reason or 'menção negativa'}",
                        description=analysis.summary or "",
                    )
                    db.add(alert)
                    await db.flush()

                    # Send WhatsApp if tenant configured
                    tenant_result = await db.execute(
                        select(Tenant).where(Tenant.id == project.tenant_id)
                    )
                    tenant = tenant_result.scalar_one_or_none()
                    if tenant and tenant.whatsapp_number:
                        msg = build_alert_message(alert, project, mention)
                        sent = await send_whatsapp_message(tenant.whatsapp_number, msg)
                        alert.sent_whatsapp = sent

        await db.commit()
        logger.info(f"[brain] processed {len(mentions)} mentions")


async def task_daily_report(ctx):
    """Gera e envia relatório diário às 07:00 UTC."""
    now = datetime.utcnow()
    if now.hour != settings.REPORT_HOUR_UTC:
        return

    async with get_session_factory()() as db:
        result = await db.execute(select(Project).where(Project.is_active == True))
        projects = result.scalars().all()

        for project in projects:
            period_end = now
            period_start = now - timedelta(days=1)

            from sqlalchemy import func
            from app.models.models import MentionSentiment
            rows = await db.execute(
                select(Mention.sentiment, func.count(Mention.id))
                .where(
                    Mention.project_id == project.id,
                    Mention.collected_at >= period_start,
                )
                .group_by(Mention.sentiment)
            )
            counts = {r[0]: r[1] for r in rows}
            total = sum(counts.values())
            if total == 0:
                continue

            avg_row = await db.execute(
                select(func.avg(Mention.sentiment_score)).where(
                    Mention.project_id == project.id,
                    Mention.collected_at >= period_start,
                )
            )
            stats = {
                "total": total,
                "positive": counts.get(MentionSentiment.positive, 0),
                "negative": counts.get(MentionSentiment.negative, 0),
                "neutral": counts.get(MentionSentiment.neutral, 0),
                "avg_score": float(avg_row.scalar() or 0),
            }

            top_rows = await db.execute(
                select(Mention)
                .where(Mention.project_id == project.id, Mention.processed == True)
                .order_by(Mention.reach_estimate.desc())
                .limit(5)
            )
            top_mentions = [
                {"source": m.source.value, "sentiment": (m.sentiment.value if m.sentiment else "?"), "summary": m.summary or ""}
                for m in top_rows.scalars().all()
            ]

            content = await generate_report(project.name, period_start, period_end, stats, top_mentions)

            report = Report(
                project_id=project.id,
                report_type=ReportType.daily,
                title=f"Relatório Diário — {project.name} — {now.strftime('%d/%m/%Y')}",
                content=content,
                period_start=period_start,
                period_end=period_end,
            )
            db.add(report)
            await db.flush()

            tenant_result = await db.execute(select(Tenant).where(Tenant.id == project.tenant_id))
            tenant = tenant_result.scalar_one_or_none()
            if tenant and tenant.whatsapp_number:
                sent = await send_whatsapp_message(tenant.whatsapp_number, content[:4096])
                report.sent_whatsapp = sent

        await db.commit()
        logger.info("[daily_report] done")


# ARQ worker settings
class WorkerSettings:
    functions = [task_collect, task_brain, task_daily_report]
    redis_settings_from_env = True

    cron_jobs = [
        {"coroutine": task_collect, "minute": {0, 15, 30, 45}},
        {"coroutine": task_brain, "minute": {0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55}},
        {"coroutine": task_daily_report, "hour": settings.REPORT_HOUR_UTC, "minute": 0},
    ]
