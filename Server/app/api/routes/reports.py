from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.database import get_db
from app.models.models import Report, Mention, MentionSentiment, ReportType, User
from app.schemas.schemas import ReportOut, ReportRequest
from app.core.deps import get_current_user, get_project_for_user
from app.core.reports import generate_report
from app.core.alerts import send_whatsapp_message

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=list[ReportOut])
async def list_reports(
    project_id: int = Query(...),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_project_for_user(project_id, db, current_user)
    result = await db.execute(
        select(Report)
        .where(Report.project_id == project_id)
        .order_by(Report.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/generate", response_model=ReportOut, status_code=201)
async def generate(
    data: ReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await get_project_for_user(data.project_id, db, current_user)
    now = datetime.utcnow()
    period_end = data.period_end or now
    period_start = data.period_start or (now - timedelta(days=1 if data.report_type == ReportType.daily else 7))

    rows = await db.execute(
        select(Mention.sentiment, func.count(Mention.id))
        .where(
            Mention.project_id == data.project_id,
            Mention.collected_at >= period_start,
            Mention.collected_at <= period_end,
        )
        .group_by(Mention.sentiment)
    )
    counts = {r[0]: r[1] for r in rows}
    avg_row = await db.execute(
        select(func.avg(Mention.sentiment_score)).where(
            Mention.project_id == data.project_id,
            Mention.collected_at >= period_start,
            Mention.collected_at <= period_end,
        )
    )
    stats = {
        "total": sum(counts.values()),
        "positive": counts.get(MentionSentiment.positive, 0),
        "negative": counts.get(MentionSentiment.negative, 0),
        "neutral": counts.get(MentionSentiment.neutral, 0),
        "avg_score": float(avg_row.scalar() or 0),
    }

    top_rows = await db.execute(
        select(Mention)
        .where(
            Mention.project_id == data.project_id,
            Mention.processed == True,
            Mention.collected_at >= period_start,
            Mention.collected_at <= period_end,
        )
        .order_by(Mention.reach_estimate.desc())
        .limit(10)
    )
    top_mentions = [
        {"source": m.source.value, "sentiment": (m.sentiment.value if m.sentiment else "?"), "summary": m.summary or ""}
        for m in top_rows.scalars().all()
    ]

    content = await generate_report(project.name, period_start, period_end, stats, top_mentions)

    report = Report(
        project_id=data.project_id,
        report_type=data.report_type,
        title=f"Relatorio {data.report_type.value} - {project.name}",
        content=content,
        period_start=period_start,
        period_end=period_end,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    if data.send_whatsapp and project.tenant:
        number = project.tenant.whatsapp_number
        if number:
            sent = await send_whatsapp_message(number, content[:4096])
            report.sent_whatsapp = sent
            await db.commit()
            await db.refresh(report)

    return report
