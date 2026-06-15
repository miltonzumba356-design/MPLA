from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

_engine = None
_session_factory = None


class Base(DeclarativeBase):
    pass


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
    return _engine


def get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _session_factory


# Convenience proxies used across the codebase
class _EngineProxy:
    def begin(self):
        return get_engine().begin()

    def dispose(self):
        return get_engine().dispose()

    def __getattr__(self, item):
        return getattr(get_engine(), item)


engine = _EngineProxy()

# AsyncSessionLocal is a callable that creates sessions
def AsyncSessionLocal():
    return get_session_factory()()


async def get_db() -> AsyncSession:
    async with get_session_factory()() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
