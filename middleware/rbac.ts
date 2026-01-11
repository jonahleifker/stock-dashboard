import { Request, Response, NextFunction } from 'express';

export function requireRole(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles: string[] = (req as any).user?.roles || [];
    if (!required.some(r => roles.includes(r))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export function requirePermission(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const perms: string[] = (req as any).user?.permissions || [];
    if (!required.some(p => perms.includes(p))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
