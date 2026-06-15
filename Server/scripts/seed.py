"""Cria tenant, utilizador admin e projecto piloto para desenvolvimento."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import settings
from app.models.database import Base
from app.models.models import Tenant, User, Project, Keyword, UserRole
from app.core.security import hash_password


async def seed():
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as db:
        # Tenant
        tenant = Tenant(
            name="ReservaAO",
            slug="reservaao",
            plan="pro",
            whatsapp_number="+244900000000",
        )
        db.add(tenant)
        await db.flush()

        # Admin user
        admin = User(
            tenant_id=tenant.id,
            email="admin@reservaao.ao",
            hashed_password=hash_password("admin1234"),
            full_name="Admin ReservaAO",
            role=UserRole.admin,
        )
        db.add(admin)
        await db.flush()

        # Project
        project = Project(
            tenant_id=tenant.id,
            name="ReservaAO — Marca Principal",
            description="Monitorização da marca ReservaAO e concorrentes",
            industry="hospitality",
        )
        db.add(project)
        await db.flush()

        # Keywords
        keywords = [
            ("ReservaAO", True),
            ("Reserva AO", True),
            ("reservaao.ao", True),
            ("hotel Angola", False),
            ("restaurante Luanda", False),
            ("reserva hotel Luanda", False),
        ]
        for term, is_brand in keywords:
            db.add(Keyword(project_id=project.id, term=term, is_brand=is_brand))

        await db.commit()
        print("✓ Seed concluído")
        print(f"  Tenant:   {tenant.name} (id={tenant.id})")
        print(f"  Admin:    {admin.email} / admin1234")
        print(f"  Projecto: {project.name} (id={project.id})")
        print(f"  Keywords: {len(keywords)}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
