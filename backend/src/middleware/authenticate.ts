import { RequestLike, Role } from '../types/http';

export function authenticate(req: RequestLike): void {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Unauthorized: missing bearer token');
  }

  // Placeholder for JWT/session verification.
  req.auth = {
    userId: req.headers['x-user-id'] || 'resolved-user-id',
    clubId: req.headers['x-club-id'],
    roles: (req.headers['x-roles']?.split(',') || ['customer']) as Role[],
  };
}
