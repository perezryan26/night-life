import { enforceTenantIsolation } from '../../middleware/tenant-isolation';
import { requireRole } from '../../middleware/require-role';
import { GraphQLOperation, RestEndpoint } from '../../types/routing';

export const clubsRestEndpoints: RestEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/clubs/:clubId',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'host']);
      return { id: req.tenantId, name: 'Club profile' };
    },
  },
  {
    method: 'POST',
    path: '/api/v1/clubs/:clubId/employees',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager']);
      return { status: 'employee-membership-created' };
    },
  },
];

export const clubsGraphQLOperations: GraphQLOperation[] = [
  {
    type: 'Query',
    field: 'club',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'host']);
      return { id: req.tenantId, name: 'Club profile' };
    },
  },
  {
    type: 'Mutation',
    field: 'addEmployeeMembership',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager']);
      return true;
    },
  },
];
