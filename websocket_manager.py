"""
WebSocket Manager for Real-Time Features
========================================

Provides real-time communication for:
- Live analytics updates
- Experiment result updates
- Notification delivery
- User presence tracking
- Real-time collaboration

Author: SmartFlow Systems
"""

import logging
from typing import Dict, Set, Optional, Any, List
from datetime import datetime
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
import json


logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections and real-time events

    Features:
    - Room-based messaging (tenant isolation)
    - User presence tracking
    - Broadcast to specific users/tenants
    - Event namespacing
    - Connection state management
    """

    def __init__(self, socketio: SocketIO):
        """
        Initialize WebSocket manager

        Args:
            socketio: Flask-SocketIO instance
        """
        self.socketio = socketio

        # Track connected users: {user_id: {sid, tenant_id, connected_at}}
        self.connected_users: Dict[str, Dict[str, Any]] = {}

        # Track room memberships: {room_id: set(user_ids)}
        self.room_members: Dict[str, Set[str]] = {}

        # Register event handlers
        self._register_handlers()

    def _register_handlers(self):
        """Register Socket.IO event handlers"""

        @self.socketio.on('connect')
        def handle_connect():
            """Handle client connection"""
            sid = request.sid
            logger.info(f"WebSocket connection: {sid}")

            # Send connection confirmation
            emit('connected', {
                'sid': sid,
                'timestamp': datetime.utcnow().isoformat()
            })

        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Handle client disconnection"""
            sid = request.sid

            # Find and remove user
            user_id = None
            for uid, data in list(self.connected_users.items()):
                if data['sid'] == sid:
                    user_id = uid
                    break

            if user_id:
                self._remove_user(user_id)
                logger.info(f"User {user_id} disconnected")

        @self.socketio.on('authenticate')
        def handle_authenticate(data):
            """
            Authenticate WebSocket connection

            Expected data:
            {
                "user_id": "user-123",
                "tenant_id": "tenant-456"
            }
            """
            user_id = data.get('user_id')
            tenant_id = data.get('tenant_id')

            if not user_id or not tenant_id:
                emit('error', {'message': 'user_id and tenant_id required'})
                return

            # Store user connection
            self.connected_users[user_id] = {
                'sid': request.sid,
                'tenant_id': tenant_id,
                'connected_at': datetime.utcnow()
            }

            # Join tenant room for tenant-wide broadcasts
            tenant_room = f"tenant:{tenant_id}"
            join_room(tenant_room)

            # Track room membership
            if tenant_room not in self.room_members:
                self.room_members[tenant_room] = set()
            self.room_members[tenant_room].add(user_id)

            # Also join personal room
            user_room = f"user:{user_id}"
            join_room(user_room)

            logger.info(f"User {user_id} authenticated and joined tenant {tenant_id}")

            # Notify user
            emit('authenticated', {
                'user_id': user_id,
                'tenant_id': tenant_id,
                'rooms': rooms()
            })

            # Notify tenant of new user
            self.broadcast_to_tenant(
                tenant_id,
                'user_joined',
                {'user_id': user_id},
                exclude_user=user_id
            )

        @self.socketio.on('subscribe')
        def handle_subscribe(data):
            """
            Subscribe to specific channel/room

            Expected data:
            {
                "channel": "analytics" | "experiments" | "notifications"
            }
            """
            channel = data.get('channel')
            if not channel:
                emit('error', {'message': 'channel required'})
                return

            join_room(channel)

            emit('subscribed', {'channel': channel})
            logger.info(f"Client {request.sid} subscribed to {channel}")

        @self.socketio.on('unsubscribe')
        def handle_unsubscribe(data):
            """Unsubscribe from channel"""
            channel = data.get('channel')
            if channel:
                leave_room(channel)
                emit('unsubscribed', {'channel': channel})

        @self.socketio.on('ping')
        def handle_ping():
            """Handle ping for keepalive"""
            emit('pong', {'timestamp': datetime.utcnow().isoformat()})

    def _remove_user(self, user_id: str):
        """Remove user from all tracking"""
        if user_id not in self.connected_users:
            return

        user_data = self.connected_users[user_id]
        tenant_id = user_data.get('tenant_id')

        # Remove from room memberships
        for room_id, members in list(self.room_members.items()):
            members.discard(user_id)
            if not members:
                del self.room_members[room_id]

        # Notify tenant
        if tenant_id:
            self.broadcast_to_tenant(
                tenant_id,
                'user_left',
                {'user_id': user_id},
                exclude_user=user_id
            )

        # Remove from connected users
        del self.connected_users[user_id]

    def send_to_user(self, user_id: str, event: str, data: Dict[str, Any]):
        """
        Send message to specific user

        Args:
            user_id: Target user ID
            event: Event name
            data: Event payload
        """
        user_room = f"user:{user_id}"
        self.socketio.emit(event, data, room=user_room)
        logger.debug(f"Sent {event} to user {user_id}")

    def broadcast_to_tenant(
        self,
        tenant_id: str,
        event: str,
        data: Dict[str, Any],
        exclude_user: Optional[str] = None
    ):
        """
        Broadcast message to all users in a tenant

        Args:
            tenant_id: Tenant ID
            event: Event name
            data: Event payload
            exclude_user: Optional user ID to exclude from broadcast
        """
        tenant_room = f"tenant:{tenant_id}"

        if exclude_user:
            # Send to all except one user
            user_sid = self.connected_users.get(exclude_user, {}).get('sid')
            if user_sid:
                self.socketio.emit(
                    event,
                    data,
                    room=tenant_room,
                    skip_sid=user_sid
                )
            else:
                self.socketio.emit(event, data, room=tenant_room)
        else:
            self.socketio.emit(event, data, room=tenant_room)

        logger.debug(f"Broadcast {event} to tenant {tenant_id}")

    def broadcast_to_channel(self, channel: str, event: str, data: Dict[str, Any]):
        """
        Broadcast to specific channel

        Args:
            channel: Channel name (e.g., "analytics", "experiments")
            event: Event name
            data: Event payload
        """
        self.socketio.emit(event, data, room=channel)
        logger.debug(f"Broadcast {event} to channel {channel}")

    def broadcast_to_all(self, event: str, data: Dict[str, Any]):
        """
        Broadcast to all connected clients

        Args:
            event: Event name
            data: Event payload
        """
        self.socketio.emit(event, data, broadcast=True)
        logger.debug(f"Broadcast {event} to all clients")

    def get_connected_users(self, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get list of connected users

        Args:
            tenant_id: Optional filter by tenant

        Returns:
            List of user connection info
        """
        if tenant_id:
            return [
                {'user_id': uid, **data}
                for uid, data in self.connected_users.items()
                if data.get('tenant_id') == tenant_id
            ]
        else:
            return [
                {'user_id': uid, **data}
                for uid, data in self.connected_users.items()
            ]

    def is_user_connected(self, user_id: str) -> bool:
        """Check if user is connected"""
        return user_id in self.connected_users

    # ============================================
    # Domain-Specific Event Emitters
    # ============================================

    def notify_analytics_update(self, tenant_id: str, metrics: Dict[str, Any]):
        """
        Send real-time analytics update

        Args:
            tenant_id: Tenant ID
            metrics: Updated metrics data
        """
        self.broadcast_to_tenant(
            tenant_id,
            'analytics:update',
            {
                'metrics': metrics,
                'timestamp': datetime.utcnow().isoformat()
            }
        )

    def notify_experiment_update(
        self,
        tenant_id: str,
        experiment_id: str,
        experiment_data: Dict[str, Any]
    ):
        """
        Send real-time experiment update

        Args:
            tenant_id: Tenant ID
            experiment_id: Experiment ID
            experiment_data: Updated experiment data
        """
        self.broadcast_to_tenant(
            tenant_id,
            'experiment:update',
            {
                'experiment_id': experiment_id,
                'experiment': experiment_data,
                'timestamp': datetime.utcnow().isoformat()
            }
        )

    def notify_experiment_completed(
        self,
        tenant_id: str,
        experiment_id: str,
        winner: Optional[str],
        significance: Optional[float]
    ):
        """
        Notify when experiment completes

        Args:
            tenant_id: Tenant ID
            experiment_id: Experiment ID
            winner: Winner variant ID
            significance: Statistical significance
        """
        self.broadcast_to_tenant(
            tenant_id,
            'experiment:completed',
            {
                'experiment_id': experiment_id,
                'winner': winner,
                'significance': significance,
                'timestamp': datetime.utcnow().isoformat()
            }
        )

    def notify_booking_created(
        self,
        tenant_id: str,
        booking_data: Dict[str, Any]
    ):
        """
        Notify of new booking

        Args:
            tenant_id: Tenant ID
            booking_data: Booking information
        """
        self.broadcast_to_tenant(
            tenant_id,
            'booking:created',
            {
                'booking': booking_data,
                'timestamp': datetime.utcnow().isoformat()
            }
        )

    def notify_user(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ):
        """
        Send notification to user

        Args:
            user_id: User ID
            notification_type: Type (info, success, warning, error)
            title: Notification title
            message: Notification message
            data: Optional additional data
        """
        self.send_to_user(
            user_id,
            'notification',
            {
                'type': notification_type,
                'title': title,
                'message': message,
                'data': data or {},
                'timestamp': datetime.utcnow().isoformat()
            }
        )

    def broadcast_system_announcement(
        self,
        title: str,
        message: str,
        level: str = 'info'
    ):
        """
        Broadcast system-wide announcement

        Args:
            title: Announcement title
            message: Announcement message
            level: Severity level (info, warning, critical)
        """
        self.broadcast_to_all(
            'system:announcement',
            {
                'title': title,
                'message': message,
                'level': level,
                'timestamp': datetime.utcnow().isoformat()
            }
        )


# Global instance (initialized in app.py)
_websocket_manager: Optional[WebSocketManager] = None


def init_websocket_manager(socketio: SocketIO) -> WebSocketManager:
    """
    Initialize WebSocket manager

    Args:
        socketio: Flask-SocketIO instance

    Returns:
        WebSocketManager instance
    """
    global _websocket_manager
    _websocket_manager = WebSocketManager(socketio)
    logger.info("WebSocket manager initialized")
    return _websocket_manager


def get_websocket_manager() -> Optional[WebSocketManager]:
    """Get WebSocket manager instance"""
    return _websocket_manager
