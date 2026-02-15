import { enforceTenantIsolation } from '../../middleware/tenant-isolation';
import { requireRole } from '../../middleware/require-role';
import { GraphQLOperation, RestEndpoint } from '../../types/routing';

export const bookingsRestEndpoints: RestEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/clubs/:clubId/sections/:sectionId/availability',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host', 'analyst']);
      return {
        sectionId: req.params.sectionId,
        availableSpots: 6,
        heldSpots: 2,
        confirmedSpots: 12,
        availabilityVersion: 4,
      };
    },
  },
  {
    method: 'POST',
    path: '/api/v1/clubs/:clubId/sections/:sectionId/holds',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host']);
      return {
        status: 'hold_created',
        holdExpiresAt: '2026-01-01T00:05:00Z',
      };
    },
  },
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
    type: 'Query',
    field: 'sectionAvailability',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host', 'analyst']);
      return {
        availableSpots: 6,
        heldSpots: 2,
        confirmedSpots: 12,
        availabilityVersion: 4,
      };
    },
  },
  {
    type: 'Mutation',
    field: 'createAvailabilityHold',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host']);
      return {
        status: 'hold_created',
        holdExpiresAt: '2026-01-01T00:05:00Z',
      };
    },
  },
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
  {
    type: 'Subscription',
    field: 'availabilityUpdated',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['customer', 'club_admin', 'manager', 'host', 'analyst']);
      return {
        event: 'availability_updated',
        availabilityVersion: 5,
      };
    },
  },
];
