import { enforceTenantIsolation } from '../../middleware/tenant-isolation';
import { requireRole } from '../../middleware/require-role';
import { GraphQLOperation, RestEndpoint } from '../../types/routing';

export const bookingsRestEndpoints: RestEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/clubs/:clubId/bookings',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host']);
      return { status: 'requested' };
    },
  },
  {
    method: 'PATCH',
    path: '/api/v1/clubs/:clubId/bookings/:bookingId/approve',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'host']);
      return { status: 'approved' };
    },
  },
  {
    method: 'PATCH',
    path: '/api/v1/clubs/:clubId/bookings/:bookingId/reject',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'host']);
      return { status: 'rejected' };
    },
  },
];

export const bookingsGraphQLOperations: GraphQLOperation[] = [
  {
    type: 'Mutation',
    field: 'requestBooking',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host']);
      return { status: 'requested' };
    },
  },
  {
    type: 'Mutation',
    field: 'approveBooking',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'host']);
      return { status: 'approved' };
    },
  },
];
