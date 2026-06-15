from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models.models import Project, Keyword, User, UserRole
from app.schemas.schemas import ProjectCreate, ProjectOut, KeywordCreate, KeywordOut
from app.core.deps import get_current_user, get_project_for_user, require_role

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=list[ProjectOut])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.tenant_id == current_user.tenant_id, Project.is_active == True)
    )
    return result.scalars().all()


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.superadmin)),
):
    project = Project(tenant_id=current_user.tenant_id, **data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.tenant_id == current_user.tenant_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Projecto não encontrado")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.superadmin)),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.tenant_id == current_user.tenant_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Projecto não encontrado")
    project.is_active = False
    await db.commit()


# ─── Keywords ─────────────────────────────────────────────────────────────────

@router.get("/{project_id}/keywords", response_model=list[KeywordOut])
async def list_keywords(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_project_for_user(project_id, db, current_user)
    result = await db.execute(
        select(Keyword).where(Keyword.project_id == project_id, Keyword.is_active == True)
    )
    return result.scalars().all()


@router.post("/{project_id}/keywords", response_model=KeywordOut, status_code=status.HTTP_201_CREATED)
async def add_keyword(
    project_id: int,
    data: KeywordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.superadmin)),
):
    await get_project_for_user(project_id, db, current_user)
    keyword = Keyword(project_id=project_id, **data.model_dump())
    db.add(keyword)
    await db.commit()
    await db.refresh(keyword)
    return keyword


@router.delete("/{project_id}/keywords/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_keyword(
    project_id: int,
    keyword_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.superadmin)),
):
    await get_project_for_user(project_id, db, current_user)
    result = await db.execute(
        select(Keyword).where(Keyword.id == keyword_id, Keyword.project_id == project_id)
    )
    kw = result.scalar_one_or_none()
    if not kw:
        raise HTTPException(status_code=404, detail="Keyword não encontrada")
    kw.is_active = False
    await db.commit()
