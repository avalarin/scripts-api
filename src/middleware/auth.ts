import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthConfig } from '../types/config';

export const authMiddleware: (config: AuthConfig) => RequestHandler = (config) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/api/health') {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    const { bearerToken } = config;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (token !== bearerToken) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    next();
  };
};
