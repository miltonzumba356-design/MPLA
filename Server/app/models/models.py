from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime, ForeignKey,
    Enum, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.models.database import Base


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


class MentionSentiment(str, enum.Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"
    mixed = "mixed"


class MentionSource(str, enum.Enum):
    rss = "rss"
    instagram = "instagram"
    twitter = "twitter"
    facebook = "facebook"
    tiktok = "tiktok"
    youtube = "youtube"
    google_reviews = "google_reviews"
    web = "web"


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    open = "open"
    acknowledged = "acknowledged"
    resolved = "resolved"


class ReportType(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    custom = "custom"


# ─── Models ───────────────────────────────────────────────────────────────────

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    plan: Mapped[str] = mapped_column(String(50), default="starter")
    whatsapp_number: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users: Mapped[list["User"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    projects: Mapped[list["Project"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.analyst)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    whatsapp_number: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    tenant: Mapped["Tenant"] = relationship(back_populates="users")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    industry: Mapped[str] = mapped_column(String(100), default="hospitality")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant: Mapped["Tenant"] = relationship(back_populates="projects")
    keywords: Mapped[list["Keyword"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    mentions: Mapped[list["Mention"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    competitors: Mapped[list["Competitor"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    reports: Mapped[list["Report"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class Keyword(Base):
    __tablename__ = "keywords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    term: Mapped[str] = mapped_column(String(200), nullable=False)
    is_brand: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship(back_populates="keywords")

    __table_args__ = (UniqueConstraint("project_id", "term"),)


class Mention(Base):
    __tablename__ = "mentions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    source: Mapped[MentionSource] = mapped_column(Enum(MentionSource))
    url: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[Optional[str]] = mapped_column(String(200))
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    collected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # AI analysis
    sentiment: Mapped[Optional[MentionSentiment]] = mapped_column(Enum(MentionSentiment))
    sentiment_score: Mapped[Optional[float]] = mapped_column(Float)  # -1 to 1
    topics: Mapped[Optional[list]] = mapped_column(JSON)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    action_recommended: Mapped[Optional[str]] = mapped_column(Text)
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Reach metrics
    reach_estimate: Mapped[int] = mapped_column(Integer, default=0)
    influencer_score: Mapped[float] = mapped_column(Float, default=0.0)
    engagement: Mapped[int] = mapped_column(Integer, default=0)

    # Dedup
    content_hash: Mapped[str] = mapped_column(String(64), unique=True)

    project: Mapped["Project"] = relationship(back_populates="mentions")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="mention")

    __table_args__ = (
        Index("ix_mentions_project_collected", "project_id", "collected_at"),
        Index("ix_mentions_sentiment", "sentiment"),
        Index("ix_mentions_processed", "processed"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    mention_id: Mapped[Optional[int]] = mapped_column(ForeignKey("mentions.id", ondelete="SET NULL"))
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity))
    status: Mapped[AlertStatus] = mapped_column(Enum(AlertStatus), default=AlertStatus.open)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    sent_whatsapp: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    resolved_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    project: Mapped["Project"] = relationship(back_populates="alerts")
    mention: Mapped[Optional["Mention"]] = relationship(back_populates="alerts")


class Competitor(Base):
    __tablename__ = "competitors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    keywords: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    project: Mapped["Project"] = relationship(back_populates="competitors")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    report_type: Mapped[ReportType] = mapped_column(Enum(ReportType))
    title: Mapped[str] = mapped_column(String(300))
    content: Mapped[str] = mapped_column(Text)
    period_start: Mapped[datetime] = mapped_column(DateTime)
    period_end: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    sent_whatsapp: Mapped[bool] = mapped_column(Boolean, default=False)

    project: Mapped["Project"] = relationship(back_populates="reports")
