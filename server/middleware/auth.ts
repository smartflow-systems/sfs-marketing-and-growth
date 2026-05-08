import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// SFS_JWT_SECRET is the ecosystem-wide standard. Fall back to JWT_SECRET during transition.
const SFS_JWT_SECRET = process.env.SFS_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!process.env.SFS_JWT_SECRET && process.env.JWT_SECRET) {
  console.warn(
    '[sfs-auth] WARNING: SFS_JWT_SECRET not set — falling back to JWT_SECRET. ' +
    'Set SFS_JWT_SECRET to align with the SFS hub.'
  );
}

// Security: Prevent using default JWT secret in production
if (process.env.NODE_ENV === 'production' && SFS_JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error(
    'CRITICAL SECURITY ERROR: SFS_JWT_SECRET environment variable must be set in production. ' +
    'Use the same value as SFS-Backend. Generate with: openssl rand -base64 64'
  );
}

// SFS token payload shape — matches SFS-Backend JWT payload
export interface SfsTokenPayload {
  userId: string;
  email: string;
  orgId: string;
  role: string;
  plan: string;
  // Legacy field kept for backwards compat with tokens minted before SFS wiring
  subscriptionTier?: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: SfsTokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, SFS_JWT_SECRET) as SfsTokenPayload;
    req.userId = String(decoded.userId);
    req.user = {
      userId: String(decoded.userId),
      email: decoded.email,
      orgId: decoded.orgId || '',
      role: decoded.role || '',
      plan: decoded.plan || decoded.subscriptionTier || '',
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, SFS_JWT_SECRET) as SfsTokenPayload;
      req.userId = String(decoded.userId);
      req.user = {
        userId: String(decoded.userId),
        email: decoded.email,
        orgId: decoded.orgId || '',
        role: decoded.role || '',
        plan: decoded.plan || decoded.subscriptionTier || '',
      };
    }

    next();
  } catch (error) {
    // Token invalid but continue anyway
    next();
  }
};

export const requireOrg = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!req.user.orgId) {
    return res.status(403).json({ error: 'No org context in token' });
  }
  next();
};

export const requireSubscription = (tiers: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPlan = req.user.plan || req.user.subscriptionTier || '';
    if (!tiers.includes(userPlan)) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        requiredTiers: tiers,
        currentTier: userPlan,
      });
    }

    next();
  };
};

export const generateToken = (
  userId: string | number,
  email: string,
  plan: string,
  orgId = '',
  role = 'member',
): string => {
  return jwt.sign(
    { userId: String(userId), email, orgId, role, plan },
    SFS_JWT_SECRET,
    { expiresIn: '7d' },
  );
};
