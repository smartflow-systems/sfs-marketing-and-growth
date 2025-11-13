"""
Google Calendar OAuth Integration
==================================

Complete OAuth 2.0 integration with Google Calendar API for appointment sync.

Features:
- OAuth 2.0 authorization flow
- Calendar event creation and updates
- Two-way sync with booking system
- Automatic token refresh
- Multiple calendar support
- Event reminders and notifications
- Conflict detection

Author: SmartFlow Systems
"""

import os
import json
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import logging
from dataclasses import dataclass

# Google OAuth and Calendar API
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from google.auth.transport.requests import Request
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    logging.warning("Google Calendar dependencies not installed. Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")


logger = logging.getLogger(__name__)


@dataclass
class CalendarEvent:
    """Google Calendar event"""
    id: str
    summary: str
    description: Optional[str]
    start: datetime
    end: datetime
    attendees: List[str]
    location: Optional[str]
    status: str  # confirmed, tentative, cancelled


class GoogleCalendarManager:
    """
    Manages Google Calendar OAuth and syncing

    OAuth Flow:
    1. User initiates authorization
    2. Redirect to Google consent screen
    3. Google redirects back with auth code
    4. Exchange code for access + refresh tokens
    5. Store tokens securely
    6. Auto-refresh when expired
    """

    # OAuth 2.0 scopes
    SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]

    def __init__(self, credentials_path: str = "data/google_credentials", tokens_path: str = "data/google_tokens"):
        """
        Initialize Google Calendar manager

        Args:
            credentials_path: Directory to store OAuth client credentials
            tokens_path: Directory to store user tokens
        """
        if not GOOGLE_AVAILABLE:
            raise ImportError("Google Calendar libraries not installed")

        self.credentials_path = credentials_path
        self.tokens_path = tokens_path
        os.makedirs(credentials_path, exist_ok=True)
        os.makedirs(tokens_path, exist_ok=True)

        # OAuth client configuration
        self.client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:5000/oauth/google/callback")

    def get_authorization_url(self, state: str) -> str:
        """
        Get Google OAuth authorization URL

        Args:
            state: CSRF token for security

        Returns:
            Authorization URL to redirect user to
        """
        if not self.client_id or not self.client_secret:
            raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")

        # Create OAuth config
        client_config = {
            "web": {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uris": [self.redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

        # Create flow
        flow = Flow.from_client_config(
            client_config,
            scopes=self.SCOPES,
            redirect_uri=self.redirect_uri
        )

        # Generate authorization URL
        authorization_url, _ = flow.authorization_url(
            access_type='offline',  # Request refresh token
            include_granted_scopes='true',
            state=state,
            prompt='consent'  # Force consent screen to get refresh token
        )

        return authorization_url

    def handle_oauth_callback(self, authorization_code: str, user_id: str) -> Credentials:
        """
        Handle OAuth callback and exchange code for tokens

        Args:
            authorization_code: Auth code from Google
            user_id: User ID to associate tokens with

        Returns:
            Google OAuth credentials
        """
        if not self.client_id or not self.client_secret:
            raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")

        # Create OAuth config
        client_config = {
            "web": {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uris": [self.redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

        # Create flow
        flow = Flow.from_client_config(
            client_config,
            scopes=self.SCOPES,
            redirect_uri=self.redirect_uri
        )

        # Exchange code for tokens
        flow.fetch_token(code=authorization_code)

        credentials = flow.credentials

        # Save tokens
        self._save_credentials(user_id, credentials)

        logger.info(f"Google Calendar authorized for user {user_id}")

        return credentials

    def get_credentials(self, user_id: str) -> Optional[Credentials]:
        """
        Get stored credentials for user, refreshing if needed

        Args:
            user_id: User ID

        Returns:
            Credentials or None if not authorized
        """
        token_file = os.path.join(self.tokens_path, f"{user_id}.pickle")

        if not os.path.exists(token_file):
            return None

        # Load credentials
        with open(token_file, 'rb') as f:
            credentials = pickle.load(f)

        # Refresh if expired
        if credentials.expired and credentials.refresh_token:
            try:
                credentials.refresh(Request())
                self._save_credentials(user_id, credentials)
                logger.info(f"Refreshed Google Calendar token for user {user_id}")
            except Exception as e:
                logger.error(f"Failed to refresh token: {e}")
                return None

        return credentials

    def revoke_access(self, user_id: str) -> bool:
        """
        Revoke Google Calendar access for user

        Args:
            user_id: User ID

        Returns:
            True if successful
        """
        token_file = os.path.join(self.tokens_path, f"{user_id}.pickle")

        if os.path.exists(token_file):
            os.remove(token_file)
            logger.info(f"Revoked Google Calendar access for user {user_id}")
            return True

        return False

    def create_event(
        self,
        user_id: str,
        summary: str,
        start: datetime,
        end: datetime,
        description: Optional[str] = None,
        attendees: Optional[List[str]] = None,
        location: Optional[str] = None,
        calendar_id: str = 'primary',
        send_notifications: bool = True
    ) -> Optional[CalendarEvent]:
        """
        Create Google Calendar event

        Args:
            user_id: User ID
            summary: Event title
            start: Start datetime
            end: End datetime
            description: Event description
            attendees: List of attendee emails
            location: Event location
            calendar_id: Calendar ID (default: primary)
            send_notifications: Send email notifications to attendees

        Returns:
            Created CalendarEvent or None on error
        """
        credentials = self.get_credentials(user_id)
        if not credentials:
            logger.warning(f"No credentials for user {user_id}")
            return None

        try:
            service = build('calendar', 'v3', credentials=credentials)

            # Build event
            event = {
                'summary': summary,
                'start': {
                    'dateTime': start.isoformat(),
                    'timeZone': 'UTC'
                },
                'end': {
                    'dateTime': end.isoformat(),
                    'timeZone': 'UTC'
                }
            }

            if description:
                event['description'] = description

            if location:
                event['location'] = location

            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]

            # Add reminders
            event['reminders'] = {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                    {'method': 'popup', 'minutes': 60},  # 1 hour before
                ]
            }

            # Create event
            created_event = service.events().insert(
                calendarId=calendar_id,
                body=event,
                sendNotifications=send_notifications
            ).execute()

            logger.info(f"Created Google Calendar event: {created_event['id']}")

            return self._parse_event(created_event)

        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to create event: {e}", exc_info=True)
            return None

    def update_event(
        self,
        user_id: str,
        event_id: str,
        summary: Optional[str] = None,
        start: Optional[datetime] = None,
        end: Optional[datetime] = None,
        description: Optional[str] = None,
        location: Optional[str] = None,
        calendar_id: str = 'primary',
        send_notifications: bool = True
    ) -> Optional[CalendarEvent]:
        """
        Update existing Google Calendar event

        Args:
            user_id: User ID
            event_id: Google Calendar event ID
            summary: New title
            start: New start datetime
            end: New end datetime
            description: New description
            location: New location
            calendar_id: Calendar ID
            send_notifications: Send email notifications

        Returns:
            Updated CalendarEvent or None on error
        """
        credentials = self.get_credentials(user_id)
        if not credentials:
            return None

        try:
            service = build('calendar', 'v3', credentials=credentials)

            # Get existing event
            event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()

            # Update fields
            if summary:
                event['summary'] = summary
            if start:
                event['start'] = {'dateTime': start.isoformat(), 'timeZone': 'UTC'}
            if end:
                event['end'] = {'dateTime': end.isoformat(), 'timeZone': 'UTC'}
            if description is not None:
                event['description'] = description
            if location is not None:
                event['location'] = location

            # Update event
            updated_event = service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event,
                sendNotifications=send_notifications
            ).execute()

            logger.info(f"Updated Google Calendar event: {event_id}")

            return self._parse_event(updated_event)

        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to update event: {e}", exc_info=True)
            return None

    def delete_event(
        self,
        user_id: str,
        event_id: str,
        calendar_id: str = 'primary',
        send_notifications: bool = True
    ) -> bool:
        """
        Delete Google Calendar event

        Args:
            user_id: User ID
            event_id: Event ID to delete
            calendar_id: Calendar ID
            send_notifications: Send cancellation notifications

        Returns:
            True if successful
        """
        credentials = self.get_credentials(user_id)
        if not credentials:
            return False

        try:
            service = build('calendar', 'v3', credentials=credentials)

            service.events().delete(
                calendarId=calendar_id,
                eventId=event_id,
                sendNotifications=send_notifications
            ).execute()

            logger.info(f"Deleted Google Calendar event: {event_id}")
            return True

        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to delete event: {e}", exc_info=True)
            return False

    def list_events(
        self,
        user_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        max_results: int = 100,
        calendar_id: str = 'primary'
    ) -> List[CalendarEvent]:
        """
        List Google Calendar events

        Args:
            user_id: User ID
            start_time: Filter events starting after this time
            end_time: Filter events ending before this time
            max_results: Maximum number of events
            calendar_id: Calendar ID

        Returns:
            List of CalendarEvent objects
        """
        credentials = self.get_credentials(user_id)
        if not credentials:
            return []

        try:
            service = build('calendar', 'v3', credentials=credentials)

            # Build query parameters
            params = {
                'calendarId': calendar_id,
                'maxResults': max_results,
                'singleEvents': True,
                'orderBy': 'startTime'
            }

            if start_time:
                params['timeMin'] = start_time.isoformat() + 'Z'
            if end_time:
                params['timeMax'] = end_time.isoformat() + 'Z'

            # List events
            events_result = service.events().list(**params).execute()
            events = events_result.get('items', [])

            return [self._parse_event(event) for event in events]

        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return []
        except Exception as e:
            logger.error(f"Failed to list events: {e}", exc_info=True)
            return []

    def check_availability(
        self,
        user_id: str,
        start: datetime,
        end: datetime,
        calendar_id: str = 'primary'
    ) -> bool:
        """
        Check if time slot is available (no conflicts)

        Args:
            user_id: User ID
            start: Start datetime
            end: End datetime
            calendar_id: Calendar ID

        Returns:
            True if available, False if conflict exists
        """
        events = self.list_events(
            user_id=user_id,
            start_time=start,
            end_time=end,
            calendar_id=calendar_id
        )

        # Check for overlapping events
        for event in events:
            if event.status != 'cancelled':
                # Check if time ranges overlap
                if start < event.end and end > event.start:
                    return False  # Conflict found

        return True  # Available

    def list_calendars(self, user_id: str) -> List[Dict[str, str]]:
        """
        List all calendars for user

        Args:
            user_id: User ID

        Returns:
            List of calendar dictionaries with id, summary, description
        """
        credentials = self.get_credentials(user_id)
        if not credentials:
            return []

        try:
            service = build('calendar', 'v3', credentials=credentials)

            calendar_list = service.calendarList().list().execute()
            calendars = calendar_list.get('items', [])

            return [
                {
                    'id': cal.get('id'),
                    'summary': cal.get('summary'),
                    'description': cal.get('description', ''),
                    'primary': cal.get('primary', False)
                }
                for cal in calendars
            ]

        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return []
        except Exception as e:
            logger.error(f"Failed to list calendars: {e}", exc_info=True)
            return []

    def _save_credentials(self, user_id: str, credentials: Credentials) -> None:
        """Save credentials to disk"""
        token_file = os.path.join(self.tokens_path, f"{user_id}.pickle")

        with open(token_file, 'wb') as f:
            pickle.dump(credentials, f)

    def _parse_event(self, event_data: Dict[str, Any]) -> CalendarEvent:
        """Parse Google Calendar event data into CalendarEvent"""
        # Parse start/end times
        start_data = event_data.get('start', {})
        end_data = event_data.get('end', {})

        if 'dateTime' in start_data:
            start = datetime.fromisoformat(start_data['dateTime'].replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_data['dateTime'].replace('Z', '+00:00'))
        else:
            # All-day event
            start = datetime.fromisoformat(start_data['date'])
            end = datetime.fromisoformat(end_data['date'])

        # Parse attendees
        attendees = []
        for attendee in event_data.get('attendees', []):
            attendees.append(attendee.get('email', ''))

        return CalendarEvent(
            id=event_data['id'],
            summary=event_data.get('summary', 'No title'),
            description=event_data.get('description'),
            start=start.replace(tzinfo=None),  # Convert to naive UTC
            end=end.replace(tzinfo=None),
            attendees=attendees,
            location=event_data.get('location'),
            status=event_data.get('status', 'confirmed')
        )


# Singleton instance
_calendar_manager = None


def get_calendar_manager() -> GoogleCalendarManager:
    """Get or create singleton GoogleCalendarManager instance"""
    global _calendar_manager
    if _calendar_manager is None and GOOGLE_AVAILABLE:
        _calendar_manager = GoogleCalendarManager()
    return _calendar_manager
