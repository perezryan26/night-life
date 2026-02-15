import { enforceTenantIsolation } from '../../middleware/tenant-isolation';
import { requireRole } from '../../middleware/require-role';
import { GraphQLOperation, RestEndpoint } from '../../types/routing';

export const analyticsRestEndpoints: RestEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/clubs/:clubId/analytics/overview',
    protected: true,
    handler: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'analyst']);
      return {
        occupancyRate: 0.78,
        approvalRate: 0.83,
        revenue: 12500,
      };
    },
  },
];

export const analyticsGraphQLOperations: GraphQLOperation[] = [
  {
    type: 'Query',
    field: 'analyticsOverview',
    protected: true,
    resolve: (req) => {
      enforceTenantIsolation(req);
      requireRole(req, ['club_admin', 'manager', 'analyst']);
      return {
        occupancyRate: 0.78,
        approvalRate: 0.83,
        revenue: 12500,
      };
    },
  },
];
