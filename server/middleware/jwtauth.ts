// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userData?: {
    user_id: string;
    username: string;
    email: string;
  };
  user_id?: string;
  id?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        username?: string;
        email?: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }

      const payload = decoded as JWTPayload;
      console.log('Decoded JWT payload:', payload);

      // Extract user_id from different possible locations in the token
      let user_id: string | undefined;
      
      if (payload.userData?.user_id) {
        user_id = payload.userData.user_id;
      } else if (payload.user_id) {
        user_id = payload.user_id;
      } else if (payload.id) {
        user_id = payload.id;
      }

      if (!user_id) {
        console.error('No user_id found in token payload:', payload);
        res.status(403).json({ error: 'Invalid token: missing user_id' });
        return;
      }

      console.log('Authenticated user_id:', user_id);

      // Attach user info to request
      req.user = {
        user_id: user_id,
        username: payload.userData?.username,
        email: payload.userData?.email
      };

      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};