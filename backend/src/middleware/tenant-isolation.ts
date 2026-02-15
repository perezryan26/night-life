import { RequestLike } from '../types/http';

export function enforceTenantIsolation(req: RequestLike): void {
  const routeClubId = req.params.clubId || req.query.club_id || req.headers['x-club-id'];
  const authClubId = req.auth?.clubId;

  if (!routeClubId) {
    throw new Error('Missing club_id context');
  }

  if (authClubId && authClubId !== routeClubId) {
    throw new Error('Forbidden: cross-tenant request blocked');
  }

  req.tenantId = routeClubId;
}
