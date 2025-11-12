"""
Influencer Management System
============================

Complete influencer marketing platform for managing partnerships, campaigns, and ROI tracking.

Features:
- Influencer database and profiles
- Outreach campaign management
- Collaboration tracking
- Performance metrics (reach, engagement, conversions)
- Payment and contract management
- Content approval workflow
- ROI analytics

Author: SmartFlow Systems
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum


class InfluencerTier(str, Enum):
    """Influencer tiers based on follower count"""
    NANO = "nano"  # 1K-10K followers
    MICRO = "micro"  # 10K-100K followers
    MID = "mid"  # 100K-500K followers
    MACRO = "macro"  # 500K-1M followers
    MEGA = "mega"  # 1M+ followers


class CampaignStatus(str, Enum):
    """Campaign lifecycle states"""
    DRAFT = "draft"
    OUTREACH = "outreach"
    NEGOTIATION = "negotiation"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CollaborationType(str, Enum):
    """Types of influencer collaborations"""
    SPONSORED_POST = "sponsored_post"
    PRODUCT_REVIEW = "product_review"
    UNBOXING = "unboxing"
    GIVEAWAY = "giveaway"
    BRAND_AMBASSADOR = "brand_ambassador"
    AFFILIATE = "affiliate"
    EVENT_APPEARANCE = "event_appearance"


class PaymentStatus(str, Enum):
    """Payment tracking states"""
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    DISPUTED = "disputed"


@dataclass
class SocialStats:
    """Social media statistics"""
    platform: str  # Instagram, TikTok, YouTube, etc.
    followers: int
    engagement_rate: float  # Percentage
    avg_likes: int
    avg_comments: int
    avg_views: int = 0
    verified: bool = False


@dataclass
class Influencer:
    """Influencer profile"""
    id: str
    name: str
    email: str
    phone: Optional[str]
    tier: InfluencerTier

    # Social profiles
    social_stats: List[SocialStats]

    # Profile info
    niche: List[str]  # Fashion, Tech, Fitness, etc.
    location: str
    bio: str
    website: Optional[str]

    # Business
    rate_per_post: float
    preferred_collaboration: List[CollaborationType]

    # Metadata
    created_at: datetime
    last_contact: Optional[datetime] = None
    tags: List[str] = None
    notes: str = ""

    # Performance
    total_collaborations: int = 0
    avg_roi: float = 0.0

    def __post_init__(self):
        if self.tags is None:
            self.tags = []


@dataclass
class Campaign:
    """Influencer marketing campaign"""
    id: str
    name: str
    description: str
    status: CampaignStatus

    # Target
    target_influencers: List[str]  # Influencer IDs
    collaboration_type: CollaborationType

    # Budget
    total_budget: float
    cost_per_influencer: float

    # Timeline
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime

    # Content
    brief: str  # Campaign brief for influencers
    required_hashtags: List[str]
    required_mentions: List[str]
    content_guidelines: str

    # Tracking
    conversions: int = 0
    total_reach: int = 0
    total_engagement: int = 0
    roi: float = 0.0

    # Metadata
    created_by: str = ""
    tags: List[str] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []


@dataclass
class Collaboration:
    """Individual collaboration instance"""
    id: str
    campaign_id: str
    influencer_id: str

    # Details
    collaboration_type: CollaborationType
    agreed_rate: float
    deliverables: List[str]  # e.g., ["1 Instagram post", "3 Stories"]

    # Status
    status: str  # pending, approved, published, completed
    payment_status: PaymentStatus

    # Timeline
    agreed_date: datetime
    publish_date: Optional[datetime]
    completed_date: Optional[datetime]

    # Content
    content_url: Optional[str] = None
    content_approved: bool = False
    approval_notes: str = ""

    # Performance
    reach: int = 0
    engagement: int = 0
    clicks: int = 0
    conversions: int = 0

    # Payment
    invoice_number: Optional[str] = None
    payment_date: Optional[datetime] = None


class InfluencerManager:
    """
    Manages influencer marketing operations

    Features:
    - Influencer CRM
    - Campaign management
    - Collaboration tracking
    - Performance analytics
    - Payment processing
    """

    def __init__(self, storage_path: str = "data/influencers"):
        """
        Initialize influencer manager

        Args:
            storage_path: Directory for data storage
        """
        self.storage_path = storage_path
        self.influencers_path = os.path.join(storage_path, "influencers")
        self.campaigns_path = os.path.join(storage_path, "campaigns")
        self.collaborations_path = os.path.join(storage_path, "collaborations")

        os.makedirs(self.influencers_path, exist_ok=True)
        os.makedirs(self.campaigns_path, exist_ok=True)
        os.makedirs(self.collaborations_path, exist_ok=True)

    # ============================================
    # Influencer Management
    # ============================================

    def add_influencer(
        self,
        name: str,
        email: str,
        social_stats: List[Dict[str, Any]],
        niche: List[str],
        location: str,
        bio: str,
        rate_per_post: float,
        tier: InfluencerTier,
        phone: Optional[str] = None,
        website: Optional[str] = None,
        preferred_collaboration: Optional[List[CollaborationType]] = None
    ) -> Influencer:
        """Add new influencer to database"""
        influencer_id = str(uuid.uuid4())

        # Parse social stats
        stats = [SocialStats(**stat) for stat in social_stats]

        influencer = Influencer(
            id=influencer_id,
            name=name,
            email=email,
            phone=phone,
            tier=tier,
            social_stats=stats,
            niche=niche,
            location=location,
            bio=bio,
            website=website,
            rate_per_post=rate_per_post,
            preferred_collaboration=preferred_collaboration or [],
            created_at=datetime.utcnow()
        )

        self._save_influencer(influencer)
        return influencer

    def get_influencer(self, influencer_id: str) -> Optional[Influencer]:
        """Get influencer by ID"""
        return self._load_influencer(influencer_id)

    def list_influencers(
        self,
        tier: Optional[InfluencerTier] = None,
        niche: Optional[str] = None,
        min_followers: Optional[int] = None
    ) -> List[Influencer]:
        """
        List influencers with optional filters

        Args:
            tier: Filter by tier
            niche: Filter by niche
            min_followers: Minimum follower count

        Returns:
            List of influencers
        """
        influencers = []

        for filename in os.listdir(self.influencers_path):
            if filename.endswith('.json'):
                influencer_id = filename[:-5]
                influencer = self._load_influencer(influencer_id)

                if influencer:
                    # Apply filters
                    if tier and influencer.tier != tier:
                        continue
                    if niche and niche not in influencer.niche:
                        continue
                    if min_followers:
                        max_followers = max([s.followers for s in influencer.social_stats], default=0)
                        if max_followers < min_followers:
                            continue

                    influencers.append(influencer)

        return influencers

    def update_influencer(self, influencer_id: str, updates: Dict[str, Any]) -> Optional[Influencer]:
        """Update influencer details"""
        influencer = self._load_influencer(influencer_id)
        if not influencer:
            return None

        # Apply updates
        for key, value in updates.items():
            if hasattr(influencer, key):
                setattr(influencer, key, value)

        self._save_influencer(influencer)
        return influencer

    # ============================================
    # Campaign Management
    # ============================================

    def create_campaign(
        self,
        name: str,
        description: str,
        collaboration_type: CollaborationType,
        total_budget: float,
        cost_per_influencer: float,
        brief: str,
        required_hashtags: List[str],
        required_mentions: List[str],
        content_guidelines: str,
        target_influencers: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        created_by: str = ""
    ) -> Campaign:
        """Create new influencer campaign"""
        campaign_id = str(uuid.uuid4())

        campaign = Campaign(
            id=campaign_id,
            name=name,
            description=description,
            status=CampaignStatus.DRAFT,
            target_influencers=target_influencers or [],
            collaboration_type=collaboration_type,
            total_budget=total_budget,
            cost_per_influencer=cost_per_influencer,
            start_date=start_date,
            end_date=end_date,
            created_at=datetime.utcnow(),
            brief=brief,
            required_hashtags=required_hashtags,
            required_mentions=required_mentions,
            content_guidelines=content_guidelines,
            created_by=created_by
        )

        self._save_campaign(campaign)
        return campaign

    def get_campaign(self, campaign_id: str) -> Optional[Campaign]:
        """Get campaign by ID"""
        return self._load_campaign(campaign_id)

    def list_campaigns(self, status: Optional[CampaignStatus] = None) -> List[Campaign]:
        """List campaigns with optional status filter"""
        campaigns = []

        for filename in os.listdir(self.campaigns_path):
            if filename.endswith('.json'):
                campaign_id = filename[:-5]
                campaign = self._load_campaign(campaign_id)

                if campaign:
                    if status is None or campaign.status == status:
                        campaigns.append(campaign)

        # Sort by created date (newest first)
        campaigns.sort(key=lambda c: c.created_at, reverse=True)
        return campaigns

    def update_campaign_status(self, campaign_id: str, status: CampaignStatus) -> Optional[Campaign]:
        """Update campaign status"""
        campaign = self._load_campaign(campaign_id)
        if not campaign:
            return None

        campaign.status = status

        # Set dates based on status
        if status == CampaignStatus.ACTIVE and not campaign.start_date:
            campaign.start_date = datetime.utcnow()
        elif status == CampaignStatus.COMPLETED and not campaign.end_date:
            campaign.end_date = datetime.utcnow()

        self._save_campaign(campaign)
        return campaign

    # ============================================
    # Collaboration Management
    # ============================================

    def create_collaboration(
        self,
        campaign_id: str,
        influencer_id: str,
        collaboration_type: CollaborationType,
        agreed_rate: float,
        deliverables: List[str],
        publish_date: Optional[datetime] = None
    ) -> Collaboration:
        """Create collaboration between campaign and influencer"""
        collaboration_id = str(uuid.uuid4())

        collaboration = Collaboration(
            id=collaboration_id,
            campaign_id=campaign_id,
            influencer_id=influencer_id,
            collaboration_type=collaboration_type,
            agreed_rate=agreed_rate,
            deliverables=deliverables,
            status="pending",
            payment_status=PaymentStatus.PENDING,
            agreed_date=datetime.utcnow(),
            publish_date=publish_date
        )

        self._save_collaboration(collaboration)

        # Update influencer last contact
        influencer = self._load_influencer(influencer_id)
        if influencer:
            influencer.last_contact = datetime.utcnow()
            self._save_influencer(influencer)

        return collaboration

    def get_collaboration(self, collaboration_id: str) -> Optional[Collaboration]:
        """Get collaboration by ID"""
        return self._load_collaboration(collaboration_id)

    def list_collaborations(
        self,
        campaign_id: Optional[str] = None,
        influencer_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Collaboration]:
        """List collaborations with filters"""
        collaborations = []

        for filename in os.listdir(self.collaborations_path):
            if filename.endswith('.json'):
                collab_id = filename[:-5]
                collab = self._load_collaboration(collab_id)

                if collab:
                    if campaign_id and collab.campaign_id != campaign_id:
                        continue
                    if influencer_id and collab.influencer_id != influencer_id:
                        continue
                    if status and collab.status != status:
                        continue

                    collaborations.append(collab)

        return collaborations

    def update_collaboration(
        self,
        collaboration_id: str,
        updates: Dict[str, Any]
    ) -> Optional[Collaboration]:
        """Update collaboration details"""
        collab = self._load_collaboration(collaboration_id)
        if not collab:
            return None

        for key, value in updates.items():
            if hasattr(collab, key):
                setattr(collab, key, value)

        # Update timestamps
        if 'status' in updates:
            if updates['status'] == 'completed' and not collab.completed_date:
                collab.completed_date = datetime.utcnow()

        if 'payment_status' in updates:
            if updates['payment_status'] == PaymentStatus.PAID and not collab.payment_date:
                collab.payment_date = datetime.utcnow()

        self._save_collaboration(collab)
        return collab

    # ============================================
    # Analytics
    # ============================================

    def get_campaign_analytics(self, campaign_id: str) -> Dict[str, Any]:
        """Get comprehensive campaign analytics"""
        campaign = self._load_campaign(campaign_id)
        if not campaign:
            return {}

        collaborations = self.list_collaborations(campaign_id=campaign_id)

        total_spent = sum(c.agreed_rate for c in collaborations)
        total_reach = sum(c.reach for c in collaborations)
        total_engagement = sum(c.engagement for c in collaborations)
        total_conversions = sum(c.conversions for c in collaborations)

        # Calculate ROI (simplified)
        revenue_generated = total_conversions * 50  # Assume $50 per conversion
        roi = ((revenue_generated - total_spent) / total_spent * 100) if total_spent > 0 else 0

        # Engagement rate
        engagement_rate = (total_engagement / total_reach * 100) if total_reach > 0 else 0

        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign.name,
            "status": campaign.status.value,
            "total_influencers": len(collaborations),
            "total_budget": campaign.total_budget,
            "total_spent": total_spent,
            "budget_remaining": campaign.total_budget - total_spent,
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "engagement_rate": round(engagement_rate, 2),
            "total_conversions": total_conversions,
            "roi": round(roi, 2),
            "revenue_generated": revenue_generated,
            "cost_per_conversion": round(total_spent / total_conversions, 2) if total_conversions > 0 else 0,
            "collaborations": len(collaborations),
            "completed_collaborations": len([c for c in collaborations if c.status == "completed"]),
            "pending_payments": len([c for c in collaborations if c.payment_status == PaymentStatus.PENDING])
        }

    def get_influencer_performance(self, influencer_id: str) -> Dict[str, Any]:
        """Get influencer performance metrics"""
        influencer = self._load_influencer(influencer_id)
        if not influencer:
            return {}

        collaborations = self.list_collaborations(influencer_id=influencer_id)
        completed = [c for c in collaborations if c.status == "completed"]

        total_reach = sum(c.reach for c in completed)
        total_engagement = sum(c.engagement for c in completed)
        total_conversions = sum(c.conversions for c in completed)
        total_earned = sum(c.agreed_rate for c in collaborations)

        avg_engagement_rate = (total_engagement / total_reach * 100) if total_reach > 0 else 0

        return {
            "influencer_id": influencer_id,
            "name": influencer.name,
            "tier": influencer.tier.value,
            "total_collaborations": len(collaborations),
            "completed_collaborations": len(completed),
            "total_earned": total_earned,
            "avg_rate": influencer.rate_per_post,
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "avg_engagement_rate": round(avg_engagement_rate, 2),
            "total_conversions": total_conversions,
            "avg_conversions_per_campaign": round(total_conversions / len(completed), 2) if completed else 0
        }

    # ============================================
    # Storage Methods
    # ============================================

    def _save_influencer(self, influencer: Influencer):
        """Save influencer to disk"""
        filepath = os.path.join(self.influencers_path, f"{influencer.id}.json")

        data = asdict(influencer)
        data['tier'] = influencer.tier.value
        data['preferred_collaboration'] = [c.value for c in influencer.preferred_collaboration]
        data['created_at'] = influencer.created_at.isoformat()
        if influencer.last_contact:
            data['last_contact'] = influencer.last_contact.isoformat()

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def _load_influencer(self, influencer_id: str) -> Optional[Influencer]:
        """Load influencer from disk"""
        filepath = os.path.join(self.influencers_path, f"{influencer_id}.json")

        if not os.path.exists(filepath):
            return None

        with open(filepath, 'r') as f:
            data = json.load(f)

        # Convert types
        data['tier'] = InfluencerTier(data['tier'])
        data['preferred_collaboration'] = [CollaborationType(c) for c in data.get('preferred_collaboration', [])]
        data['social_stats'] = [SocialStats(**s) for s in data['social_stats']]
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        if data.get('last_contact'):
            data['last_contact'] = datetime.fromisoformat(data['last_contact'])

        return Influencer(**data)

    def _save_campaign(self, campaign: Campaign):
        """Save campaign to disk"""
        filepath = os.path.join(self.campaigns_path, f"{campaign.id}.json")

        data = asdict(campaign)
        data['status'] = campaign.status.value
        data['collaboration_type'] = campaign.collaboration_type.value
        data['created_at'] = campaign.created_at.isoformat()
        if campaign.start_date:
            data['start_date'] = campaign.start_date.isoformat()
        if campaign.end_date:
            data['end_date'] = campaign.end_date.isoformat()

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def _load_campaign(self, campaign_id: str) -> Optional[Campaign]:
        """Load campaign from disk"""
        filepath = os.path.join(self.campaigns_path, f"{campaign_id}.json")

        if not os.path.exists(filepath):
            return None

        with open(filepath, 'r') as f:
            data = json.load(f)

        # Convert types
        data['status'] = CampaignStatus(data['status'])
        data['collaboration_type'] = CollaborationType(data['collaboration_type'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        if data.get('start_date'):
            data['start_date'] = datetime.fromisoformat(data['start_date'])
        if data.get('end_date'):
            data['end_date'] = datetime.fromisoformat(data['end_date'])

        return Campaign(**data)

    def _save_collaboration(self, collab: Collaboration):
        """Save collaboration to disk"""
        filepath = os.path.join(self.collaborations_path, f"{collab.id}.json")

        data = asdict(collab)
        data['collaboration_type'] = collab.collaboration_type.value
        data['payment_status'] = collab.payment_status.value
        data['agreed_date'] = collab.agreed_date.isoformat()
        if collab.publish_date:
            data['publish_date'] = collab.publish_date.isoformat()
        if collab.completed_date:
            data['completed_date'] = collab.completed_date.isoformat()
        if collab.payment_date:
            data['payment_date'] = collab.payment_date.isoformat()

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def _load_collaboration(self, collaboration_id: str) -> Optional[Collaboration]:
        """Load collaboration from disk"""
        filepath = os.path.join(self.collaborations_path, f"{collaboration_id}.json")

        if not os.path.exists(filepath):
            return None

        with open(filepath, 'r') as f:
            data = json.load(f)

        # Convert types
        data['collaboration_type'] = CollaborationType(data['collaboration_type'])
        data['payment_status'] = PaymentStatus(data['payment_status'])
        data['agreed_date'] = datetime.fromisoformat(data['agreed_date'])
        if data.get('publish_date'):
            data['publish_date'] = datetime.fromisoformat(data['publish_date'])
        if data.get('completed_date'):
            data['completed_date'] = datetime.fromisoformat(data['completed_date'])
        if data.get('payment_date'):
            data['payment_date'] = datetime.fromisoformat(data['payment_date'])

        return Collaboration(**data)


# Singleton instance
_influencer_manager = None


def get_influencer_manager() -> InfluencerManager:
    """Get or create singleton InfluencerManager instance"""
    global _influencer_manager
    if _influencer_manager is None:
        _influencer_manager = InfluencerManager()
    return _influencer_manager
