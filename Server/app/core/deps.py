from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models.models import Project, User, UserRole
from app.core.security import decode_token

bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sem utilizador")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilizador inactivo")

    return user


def require_role(*roles: UserRole):
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")
        return current_user
    return _check


async def get_project_for_user(
    project_id: int,
    db: AsyncSession,
    current_user: User,
    include_inactive: bool = False,
) -> Project:
    q = select(Project).where(Project.id == project_id, Project.tenant_id == current_user.tenant_id)
    if not include_inactive:
        q = q.where(Project.is_active == True)
    result = await db.execute(q)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Projecto não encontrado")
    return project
