import { RequestLike, Role } from '../types/http';

export function requireRole(req: RequestLike, allowed: Role[]): void {
  const userRoles = req.auth?.roles ?? [];

  if (!allowed.some((role) => userRoles.includes(role))) {
    throw new Error(`Forbidden: missing required role (${allowed.join(', ')})`);
  }
}
