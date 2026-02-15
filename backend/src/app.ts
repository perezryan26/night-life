import { analyticsRestEndpoints } from './modules/analytics';
import { authRestEndpoints } from './modules/auth';
import { bookingsRestEndpoints } from './modules/bookings';
import { clubsRestEndpoints } from './modules/clubs';
import { authenticate } from './middleware/authenticate';
import { graphqlOperations, graphqlSchemaSDL } from './graphql/schema';
import { RequestLike } from './types/http';
import { RestEndpoint, RestMatch } from './types/routing';

export const restEndpoints: RestEndpoint[] = [
  ...authRestEndpoints,
  ...clubsRestEndpoints,
  ...bookingsRestEndpoints,
  ...analyticsRestEndpoints,
];

function matchPath(template: string, actualPath: string): Record<string, string> | null {
  const templateParts = template.split('/').filter(Boolean);
  const actualParts = actualPath.split('/').filter(Boolean);

  if (templateParts.length !== actualParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < templateParts.length; index += 1) {
    const expected = templateParts[index];
    const actual = actualParts[index];

    if (expected.startsWith(':')) {
      params[expected.slice(1)] = actual;
      continue;
    }

    if (expected !== actual) {
      return null;
    }
  }

  return params;
}

function findRestEndpoint(method: RestEndpoint['method'], path: string): RestMatch | null {
  for (const endpoint of restEndpoints) {
    if (endpoint.method !== method) {
      continue;
    }

    const params = matchPath(endpoint.path, path);
    if (params) {
      return { endpoint, params };
    }
  }

  return null;
}

export function dispatchRest(method: RestEndpoint['method'], path: string, req: RequestLike) {
  const matched = findRestEndpoint(method, path);
  if (!matched) {
    throw new Error('Not Found');
  }

  req.params = {
    ...matched.params,
    ...req.params,
  };

  if (matched.endpoint.protected) {
    authenticate(req);
  }

  return matched.endpoint.handler(req);
}

export function dispatchGraphQL(
  type: 'Query' | 'Mutation' | 'Subscription',
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

  if (args.clubId && typeof args.clubId === 'string') {
    req.params.clubId = args.clubId;
    req.query.club_id = args.clubId;
  }

  return operation.resolve(req, args);
}

export const apiVersions = {
  rest: '/api/v1',
  graphql: '/api/v1/graphql',
  graphqlSchemaSDL,
};
