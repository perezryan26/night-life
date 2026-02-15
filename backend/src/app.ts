import { analyticsRestEndpoints } from './modules/analytics';
import { authRestEndpoints } from './modules/auth';
import { bookingsRestEndpoints } from './modules/bookings';
import { clubsRestEndpoints } from './modules/clubs';
import { authenticate } from './middleware/authenticate';
import { graphqlOperations, graphqlSchemaSDL } from './graphql/schema';
import { RequestLike } from './types/http';
import { RestEndpoint } from './types/routing';

export const restEndpoints: RestEndpoint[] = [
  ...authRestEndpoints,
  ...clubsRestEndpoints,
  ...bookingsRestEndpoints,
  ...analyticsRestEndpoints,
];

export function dispatchRest(method: RestEndpoint['method'], path: string, req: RequestLike) {
  const endpoint = restEndpoints.find((candidate) => candidate.method === method && candidate.path === path);
  if (!endpoint) {
    throw new Error('Not Found');
  }

  if (endpoint.protected) {
    authenticate(req);
  }

  return endpoint.handler(req);
}

export function dispatchGraphQL(
  type: 'Query' | 'Mutation',
  field: string,
  req: RequestLike,
  args: Record<string, unknown> = {},
) {
  const operation = graphqlOperations.find((candidate) => candidate.type === type && candidate.field === field);
  if (!operation) {
    throw new Error('Unknown GraphQL operation');
  }

  if (operation.protected) {
    authenticate(req);
  }

  return operation.resolve(req, args);
}

export const apiVersions = {
  rest: '/api/v1',
  graphql: '/api/v1/graphql',
  graphqlSchemaSDL,
};
