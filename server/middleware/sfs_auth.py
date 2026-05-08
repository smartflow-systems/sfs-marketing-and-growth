"""
SFS Auth — Python/Flask equivalent of sfs-auth.ts

Validates SFS JWT tokens issued by SFS-Backend.
Token payload shape: { userId, email, orgId, role, plan }

Usage (Flask):
    from sfs_auth import get_current_user, require_org, CurrentUser
    from functools import wraps

    @app.route("/api/bookings")
    @require_org
    def list_bookings(sfs_user: CurrentUser):
        bookings = Booking.query.filter_by(tenant_id=sfs_user.orgId).all()
        ...

Secrets (Replit / .env):
    SFS_JWT_SECRET  — primary; must match SFS-Backend
    JWT_SECRET      — legacy fallback (logs a warning)
"""

import os
import logging
from dataclasses import dataclass
from functools import wraps
from typing import Optional, Callable

from flask import request, jsonify, g

logger = logging.getLogger(__name__)

# HS256 is the SFS-Backend signing algorithm
_ALGORITHM = "HS256"


@dataclass
class CurrentUser:
    userId: str
    email: str
    orgId: str
    role: str
    plan: str


def _resolve_secret() -> Optional[str]:
    """Return SFS_JWT_SECRET, falling back to JWT_SECRET with a warning."""
    sfs_secret = os.environ.get("SFS_JWT_SECRET")
    if sfs_secret:
        return sfs_secret

    legacy_secret = os.environ.get("JWT_SECRET")
    if legacy_secret:
        logger.warning(
            "SFS_JWT_SECRET not set — falling back to JWT_SECRET. "
            "Migrate to SFS_JWT_SECRET to align with the SFS hub."
        )
        return legacy_secret

    return None


def _decode_token(token: str) -> Optional[CurrentUser]:
    """
    Decode and validate an SFS JWT. Returns CurrentUser or None.
    Accepts both 'userId' and 'sub' as the user-ID claim for flexibility.
    """
    try:
        from jose import jwt as jose_jwt, JWTError
    except ImportError:
        logger.error("python-jose is not installed. Run: pip install python-jose[cryptography]")
        return None

    secret = _resolve_secret()
    if not secret:
        logger.error("No JWT secret configured (SFS_JWT_SECRET / JWT_SECRET).")
        return None

    try:
        payload = jose_jwt.decode(token, secret, algorithms=[_ALGORITHM])
    except JWTError as exc:
        logger.debug("JWT decode failed: %s", exc)
        return None

    user_id = payload.get("userId") or payload.get("sub")
    email = payload.get("email")
    org_id = payload.get("orgId")
    role = payload.get("role")
    plan = payload.get("plan")

    if not all([user_id, email, org_id, role, plan]):
        logger.debug(
            "JWT missing required fields. Got: userId=%s email=%s orgId=%s role=%s plan=%s",
            user_id, email, org_id, role, plan,
        )
        return None

    return CurrentUser(
        userId=str(user_id),
        email=str(email),
        orgId=str(org_id),
        role=str(role),
        plan=str(plan),
    )


def get_sfs_user() -> Optional[CurrentUser]:
    """
    Parse and return the CurrentUser from the Authorization header.
    Returns None if the token is absent or invalid (does not abort).
    Caches the result on Flask's request-scoped `g`.
    """
    if hasattr(g, "_sfs_user"):
        return g._sfs_user

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        g._sfs_user = None
        return None

    token = auth_header[len("Bearer "):]
    g._sfs_user = _decode_token(token)
    return g._sfs_user


def require_org(f: Callable) -> Callable:
    """
    Flask route decorator that requires a valid SFS JWT with an orgId.

    Injects `sfs_user: CurrentUser` as the first keyword argument.

    Returns 401 if token is missing or invalid.
    Returns 403 if orgId is absent in the payload.

    Example:
        @app.route("/api/bookings")
        @require_org
        def list_bookings(sfs_user):
            rows = Booking.query.filter_by(tenant_id=sfs_user.orgId).all()
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing Bearer token"}), 401

        secret = _resolve_secret()
        if not secret:
            return jsonify({"error": "SFS_JWT_SECRET not configured"}), 500

        token = auth_header[len("Bearer "):]
        user = _decode_token(token)

        if user is None:
            return jsonify({"error": "Invalid or expired token"}), 401

        if not user.orgId:
            return jsonify({"error": "No org context in token"}), 403

        kwargs["sfs_user"] = user
        return f(*args, **kwargs)

    return decorated
