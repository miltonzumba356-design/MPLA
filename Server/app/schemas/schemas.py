from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, field_validator

from app.models.models import (
    UserRole, MentionSentiment, MentionSource,
    AlertSeverity, AlertStatus, ReportType,
)


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    tenant_id: int

    model_config = {"from_attributes": True}


# ─── Tenant ───────────────────────────────────────────────────────────────────

class TenantCreate(BaseModel):
    name: str
    slug: str
    plan: str = "starter"
    whatsapp_number: Optional[str] = None


class TenantOut(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Project ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: str = "hospitality"


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    industry: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Keyword ──────────────────────────────────────────────────────────────────

class KeywordCreate(BaseModel):
    term: str
    is_brand: bool = False


class KeywordOut(BaseModel):
    id: int
    term: str
    is_brand: bool
    is_active: bool

    model_config = {"from_attributes": True}


# ─── Mention ──────────────────────────────────────────────────────────────────

class MentionOut(BaseModel):
    id: int
    project_id: int
    source: MentionSource
    url: Optional[str]
    title: Optional[str]
    content: str
    author: Optional[str]
    published_at: Optional[datetime]
    collected_at: datetime
    sentiment: Optional[MentionSentiment]
    sentiment_score: Optional[float]
    topics: Optional[list]
    summary: Optional[str]
    action_recommended: Optional[str]
    reach_estimate: int
    influencer_score: float
    engagement: int
    processed: bool

    model_config = {"from_attributes": True}


class MentionFilter(BaseModel):
    project_id: Optional[int] = None
    source: Optional[MentionSource] = None
    sentiment: Optional[MentionSentiment] = None
    processed: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50
    offset: int = 0


class MentionStats(BaseModel):
    total: int
    positive: int
    negative: int
    neutral: int
    mixed: int
    avg_sentiment_score: float
    top_sources: list[dict[str, Any]]
    top_topics: list[dict[str, Any]]


# ─── Alert ────────────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: int
    project_id: int
    mention_id: Optional[int]
    severity: AlertSeverity
    status: AlertStatus
    title: str
    description: str
    sent_whatsapp: bool
    created_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AlertAcknowledge(BaseModel):
    note: Optional[str] = None


# ─── Report ───────────────────────────────────────────────────────────────────

class ReportOut(BaseModel):
    id: int
    project_id: int
    report_type: ReportType
    title: str
    content: str
    period_start: datetime
    period_end: datetime
    created_at: datetime
    sent_whatsapp: bool

    model_config = {"from_attributes": True}


class ReportRequest(BaseModel):
    project_id: int
    report_type: ReportType = ReportType.daily
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    send_whatsapp: bool = False


# ─── Competitor ───────────────────────────────────────────────────────────────

class CompetitorCreate(BaseModel):
    name: str
    keywords: list[str] = []


class CompetitorOut(BaseModel):
    id: int
    name: str
    keywords: list[str]
    is_active: bool

    model_config = {"from_attributes": True}
