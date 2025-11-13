"""
Social Media Scheduler & Automation
Handles scheduling and posting to Instagram, Twitter, LinkedIn, Facebook
"""

import os
import logging
from datetime import datetime
from typing import List, Dict, Optional, Literal
from dataclasses import dataclass
import json

logger = logging.getLogger(__name__)

# Platform API imports (install as needed)
try:
    import tweepy  # Twitter API
    TWITTER_AVAILABLE = True
except ImportError:
    TWITTER_AVAILABLE = False
    logger.warning("Tweepy not installed. Install with: pip install tweepy")

try:
    import requests  # For Meta Graph API (Facebook/Instagram)
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

Platform = Literal['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok']


@dataclass
class ScheduledPost:
    """Represents a scheduled social media post"""
    id: str
    tenant_id: str
    platform: Platform
    content: str
    media_urls: List[str]
    scheduled_at: datetime
    status: str  # scheduled, posting, posted, failed
    posted_at: Optional[datetime]
    platform_post_id: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime


class SocialMediaAPI:
    """Base class for social media platform APIs"""

    def __init__(self):
        self.twitter_api = None
        self.meta_access_token = None
        self.linkedin_access_token = None

        self._initialize_clients()

    def _initialize_clients(self):
        """Initialize API clients for each platform"""

        # Twitter/X API
        if TWITTER_AVAILABLE:
            api_key = os.environ.get("TWITTER_API_KEY")
            api_secret = os.environ.get("TWITTER_API_SECRET")
            access_token = os.environ.get("TWITTER_ACCESS_TOKEN")
            access_secret = os.environ.get("TWITTER_ACCESS_SECRET")

            if all([api_key, api_secret, access_token, access_secret]):
                try:
                    auth = tweepy.OAuthHandler(api_key, api_secret)
                    auth.set_access_token(access_token, access_secret)
                    self.twitter_api = tweepy.API(auth)
                    logger.info("Twitter API initialized")
                except Exception as e:
                    logger.error(f"Twitter API init failed: {e}")

        # Meta (Facebook/Instagram) API
        self.meta_access_token = os.environ.get("META_ACCESS_TOKEN")
        if self.meta_access_token:
            logger.info("Meta API token loaded")

        # LinkedIn API
        self.linkedin_access_token = os.environ.get("LINKEDIN_ACCESS_TOKEN")
        if self.linkedin_access_token:
            logger.info("LinkedIn API token loaded")

    # ===================
    # Twitter/X Methods
    # ===================

    def post_to_twitter(self, content: str, media_urls: Optional[List[str]] = None) -> Dict:
        """
        Post to Twitter/X

        Args:
            content: Tweet text (max 280 chars for regular accounts)
            media_urls: Optional list of image URLs to upload

        Returns:
            Dict with status and tweet_id or error
        """
        if not self.twitter_api:
            return {"success": False, "error": "Twitter API not configured"}

        try:
            # Upload media if provided
            media_ids = []
            if media_urls:
                for url in media_urls[:4]:  # Twitter allows max 4 images
                    # Download and upload media
                    # In production, you'd fetch from URL and upload
                    # For now, this is a placeholder
                    pass

            # Post tweet
            if media_ids:
                status = self.twitter_api.update_status(status=content, media_ids=media_ids)
            else:
                status = self.twitter_api.update_status(status=content)

            return {
                "success": True,
                "tweet_id": status.id_str,
                "url": f"https://twitter.com/user/status/{status.id_str}"
            }

        except Exception as e:
            logger.error(f"Twitter post failed: {e}")
            return {"success": False, "error": str(e)}

    # ===================
    # Facebook Methods
    # ===================

    def post_to_facebook(self, content: str, media_urls: Optional[List[str]] = None) -> Dict:
        """
        Post to Facebook page

        Args:
            content: Post text
            media_urls: Optional list of image/video URLs

        Returns:
            Dict with status and post_id or error
        """
        if not self.meta_access_token:
            return {"success": False, "error": "Facebook API not configured"}

        page_id = os.environ.get("META_PAGE_ID")
        if not page_id:
            return {"success": False, "error": "Facebook page ID not configured"}

        try:
            url = f"https://graph.facebook.com/v18.0/{page_id}/feed"

            data = {
                "message": content,
                "access_token": self.meta_access_token
            }

            # Add media if provided
            if media_urls and len(media_urls) > 0:
                # For photos, use /photos endpoint
                url = f"https://graph.facebook.com/v18.0/{page_id}/photos"
                data["url"] = media_urls[0]  # First image
                data["caption"] = content

            response = requests.post(url, data=data)
            result = response.json()

            if response.ok and "id" in result:
                return {
                    "success": True,
                    "post_id": result["id"],
                    "url": f"https://facebook.com/{result['id']}"
                }
            else:
                return {"success": False, "error": result.get("error", {}).get("message", "Unknown error")}

        except Exception as e:
            logger.error(f"Facebook post failed: {e}")
            return {"success": False, "error": str(e)}

    # ===================
    # Instagram Methods
    # ===================

    def post_to_instagram(self, content: str, media_urls: List[str]) -> Dict:
        """
        Post to Instagram (requires media)

        Args:
            content: Caption text (max 2200 chars)
            media_urls: List of image URLs (required for Instagram)

        Returns:
            Dict with status and media_id or error
        """
        if not self.meta_access_token:
            return {"success": False, "error": "Instagram API not configured"}

        instagram_account_id = os.environ.get("INSTAGRAM_ACCOUNT_ID")
        if not instagram_account_id:
            return {"success": False, "error": "Instagram account ID not configured"}

        if not media_urls or len(media_urls) == 0:
            return {"success": False, "error": "Instagram requires at least one image"}

        try:
            # Step 1: Create media container
            url = f"https://graph.facebook.com/v18.0/{instagram_account_id}/media"

            data = {
                "image_url": media_urls[0],
                "caption": content,
                "access_token": self.meta_access_token
            }

            response = requests.post(url, data=data)
            result = response.json()

            if not response.ok or "id" not in result:
                return {"success": False, "error": result.get("error", {}).get("message", "Container creation failed")}

            container_id = result["id"]

            # Step 2: Publish the media
            publish_url = f"https://graph.facebook.com/v18.0/{instagram_account_id}/media_publish"
            publish_data = {
                "creation_id": container_id,
                "access_token": self.meta_access_token
            }

            publish_response = requests.post(publish_url, data=publish_data)
            publish_result = publish_response.json()

            if publish_response.ok and "id" in publish_result:
                return {
                    "success": True,
                    "media_id": publish_result["id"],
                    "url": f"https://instagram.com/p/{publish_result['id']}"
                }
            else:
                return {"success": False, "error": publish_result.get("error", {}).get("message", "Publish failed")}

        except Exception as e:
            logger.error(f"Instagram post failed: {e}")
            return {"success": False, "error": str(e)}

    # ===================
    # LinkedIn Methods
    # ===================

    def post_to_linkedin(self, content: str, media_urls: Optional[List[str]] = None) -> Dict:
        """
        Post to LinkedIn

        Args:
            content: Post text
            media_urls: Optional list of image URLs

        Returns:
            Dict with status and post_id or error
        """
        if not self.linkedin_access_token:
            return {"success": False, "error": "LinkedIn API not configured"}

        try:
            # Get person URN (user ID)
            person_urn = os.environ.get("LINKEDIN_PERSON_URN")
            if not person_urn:
                # Fetch current user's URN
                me_url = "https://api.linkedin.com/v2/me"
                headers = {"Authorization": f"Bearer {self.linkedin_access_token}"}
                me_response = requests.get(me_url, headers=headers)
                me_data = me_response.json()
                person_urn = f"urn:li:person:{me_data['id']}"

            # Create share
            url = "https://api.linkedin.com/v2/ugcPosts"
            headers = {
                "Authorization": f"Bearer {self.linkedin_access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }

            post_data = {
                "author": person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }

            response = requests.post(url, headers=headers, json=post_data)
            result = response.json()

            if response.ok and "id" in result:
                return {
                    "success": True,
                    "post_id": result["id"],
                    "url": f"https://linkedin.com/feed/update/{result['id']}"
                }
            else:
                return {"success": False, "error": result.get("message", "Unknown error")}

        except Exception as e:
            logger.error(f"LinkedIn post failed: {e}")
            return {"success": False, "error": str(e)}

    # ===================
    # Unified Post Method
    # ===================

    def post_to_platform(
        self,
        platform: Platform,
        content: str,
        media_urls: Optional[List[str]] = None
    ) -> Dict:
        """
        Post to any platform

        Args:
            platform: Target platform
            content: Post text
            media_urls: Optional media URLs

        Returns:
            Dict with success status and platform-specific response
        """
        media_urls = media_urls or []

        if platform == "Twitter":
            return self.post_to_twitter(content, media_urls)
        elif platform == "Facebook":
            return self.post_to_facebook(content, media_urls)
        elif platform == "Instagram":
            return self.post_to_instagram(content, media_urls)
        elif platform == "LinkedIn":
            return self.post_to_linkedin(content, media_urls)
        elif platform == "TikTok":
            return {"success": False, "error": "TikTok API not yet implemented"}
        else:
            return {"success": False, "error": f"Unknown platform: {platform}"}


class SocialMediaScheduler:
    """
    Scheduler for social media posts
    Works with APScheduler to post at scheduled times
    """

    def __init__(self, db_session):
        self.db = db_session
        self.api = SocialMediaAPI()

    def schedule_post(
        self,
        tenant_id: str,
        platform: Platform,
        content: str,
        media_urls: List[str],
        scheduled_at: datetime
    ) -> ScheduledPost:
        """
        Schedule a post for later

        Args:
            tenant_id: Tenant ID
            platform: Target platform
            content: Post text
            media_urls: Media URLs
            scheduled_at: When to post

        Returns:
            ScheduledPost object
        """
        # In production, this would save to database
        # For now, return a mock object
        import uuid

        post = ScheduledPost(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            platform=platform,
            content=content,
            media_urls=media_urls,
            scheduled_at=scheduled_at,
            status="scheduled",
            posted_at=None,
            platform_post_id=None,
            error_message=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Add to APScheduler job queue
        # scheduler.add_job(
        #     self.execute_scheduled_post,
        #     'date',
        #     run_date=scheduled_at,
        #     args=[post.id]
        # )

        return post

    def execute_scheduled_post(self, post_id: str):
        """
        Execute a scheduled post

        This is called by APScheduler at the scheduled time

        Args:
            post_id: ID of the scheduled post
        """
        # In production:
        # 1. Get post from database
        # 2. Call API to post
        # 3. Update post status
        # 4. Log result

        logger.info(f"Executing scheduled post {post_id}")

        # Mock execution
        # post = get_post_from_db(post_id)
        # result = self.api.post_to_platform(post.platform, post.content, post.media_urls)
        #
        # if result["success"]:
        #     update_post_status(post_id, "posted", platform_post_id=result["post_id"])
        # else:
        #     update_post_status(post_id, "failed", error=result["error"])

        pass

    def post_immediately(
        self,
        platform: Platform,
        content: str,
        media_urls: Optional[List[str]] = None
    ) -> Dict:
        """
        Post immediately to a platform

        Args:
            platform: Target platform
            content: Post text
            media_urls: Optional media URLs

        Returns:
            Result dict from API
        """
        return self.api.post_to_platform(platform, content, media_urls)


# Global instance
_scheduler = None


def get_social_scheduler(db_session=None):
    """Get or create the global scheduler instance"""
    global _scheduler
    if _scheduler is None:
        _scheduler = SocialMediaScheduler(db_session)
    return _scheduler
