from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models.models import Alert, AlertStatus, Project, User
from app.schemas.schemas import AlertOut, AlertAcknowledge
from app.core.deps import get_current_user, get_project_for_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/", response_model=list[AlertOut])
async def list_alerts(
    project_id: int = Query(...),
    status: AlertStatus | None = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_project_for_user(project_id, db, current_user)
    q = select(Alert).where(Alert.project_id == project_id)
    if status:
        q = q.where(Alert.status == status)
    q = q.order_by(Alert.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
async def acknowledge_alert(
    alert_id: int,
    data: AlertAcknowledge,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert)
        .join(Project, Project.id == Alert.project_id)
        .where(Alert.id == alert_id, Project.tenant_id == current_user.tenant_id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    alert.status = AlertStatus.acknowledged
    await db.commit()
    await db.refresh(alert)
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertOut)
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert)
        .join(Project, Project.id == Alert.project_id)
        .where(Alert.id == alert_id, Project.tenant_id == current_user.tenant_id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    alert.status = AlertStatus.resolved
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.id
    await db.commit()
    await db.refresh(alert)
    return alert
