import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Security: Prevent using default JWT secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be set in production. ' +
    'Generate a secure random secret with: openssl rand -base64 64'
  );
}

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    subscriptionTier: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; subscriptionTier: string };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier,
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
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; subscriptionTier: string };
      req.userId = decoded.userId;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        subscriptionTier: decoded.subscriptionTier,
      };
    }

    next();
  } catch (error) {
    // Token invalid but continue anyway
    next();
  }
};

export const requireSubscription = (tiers: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!tiers.includes(req.user.subscriptionTier)) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        requiredTiers: tiers,
        currentTier: req.user.subscriptionTier
      });
    }

    next();
  };
};

export const generateToken = (userId: number, email: string, subscriptionTier: string): string => {
  return jwt.sign(
    { userId, email, subscriptionTier },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
