from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.database import get_db
from app.models.models import Mention, MentionSentiment, MentionSource, Project, User
from app.schemas.schemas import MentionOut, MentionStats
from app.core.deps import get_current_user, get_project_for_user

router = APIRouter(prefix="/mentions", tags=["Mentions"])


@router.get("/", response_model=list[MentionOut])
async def list_mentions(
    project_id: int = Query(...),
    source: Optional[MentionSource] = None,
    sentiment: Optional[MentionSentiment] = None,
    processed: Optional[bool] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_project_for_user(project_id, db, current_user)
    q = select(Mention).where(Mention.project_id == project_id)
    if source:
        q = q.where(Mention.source == source)
    if sentiment:
        q = q.where(Mention.sentiment == sentiment)
    if processed is not None:
        q = q.where(Mention.processed == processed)
    q = q.order_by(Mention.collected_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/stats", response_model=MentionStats)
async def mention_stats(
    project_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_project_for_user(project_id, db, current_user)
    # Total and sentiment counts
    rows = await db.execute(
        select(Mention.sentiment, func.count(Mention.id))
        .where(Mention.project_id == project_id)
        .group_by(Mention.sentiment)
    )
    counts = {row[0]: row[1] for row in rows}

    avg_row = await db.execute(
        select(func.avg(Mention.sentiment_score)).where(Mention.project_id == project_id)
    )
    avg_score = avg_row.scalar() or 0.0

    # Top sources
    src_rows = await db.execute(
        select(Mention.source, func.count(Mention.id).label("n"))
        .where(Mention.project_id == project_id)
        .group_by(Mention.source)
        .order_by(func.count(Mention.id).desc())
        .limit(5)
    )
    top_sources = [{"source": r[0].value, "count": r[1]} for r in src_rows]

    total = sum(counts.values())
    return MentionStats(
        total=total,
        positive=counts.get(MentionSentiment.positive, 0),
        negative=counts.get(MentionSentiment.negative, 0),
        neutral=counts.get(MentionSentiment.neutral, 0),
        mixed=counts.get(MentionSentiment.mixed, 0),
        avg_sentiment_score=float(avg_score),
        top_sources=top_sources,
        top_topics=[],
    )


@router.get("/{mention_id}", response_model=MentionOut)
async def get_mention(
    mention_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Mention)
        .join(Project, Project.id == Mention.project_id)
        .where(Mention.id == mention_id, Project.tenant_id == current_user.tenant_id)
    )
    mention = result.scalar_one_or_none()
    if not mention:
        raise HTTPException(status_code=404, detail="Menção não encontrada")
    return mention
