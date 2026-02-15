import { GraphQLOperation, RestEndpoint } from '../../types/routing';

export const authRestEndpoints: RestEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    protected: false,
    handler: () => ({ accessToken: 'jwt-token', refreshToken: 'refresh-token' }),
  },
  {
    method: 'POST',
    path: '/api/v1/auth/refresh',
    protected: false,
    handler: () => ({ accessToken: 'new-jwt-token' }),
  },
  {
    method: 'POST',
    path: '/api/v1/auth/password-reset/request',
    protected: false,
    handler: () => ({ status: 'password-reset-email-queued' }),
  },
  {
    method: 'POST',
    path: '/api/v1/auth/password-reset/confirm',
    protected: false,
    handler: () => ({ status: 'password-updated' }),
  },
  {
    method: 'POST',
    path: '/api/v1/auth/sso/club/initiate',
    protected: false,
    handler: () => ({ redirectUrl: 'https://club-sso.example.com/start' }),
  },
];

export const authGraphQLOperations: GraphQLOperation[] = [
  {
    type: 'Mutation',
    field: 'login',
    protected: false,
    resolve: () => ({ accessToken: 'jwt-token', refreshToken: 'refresh-token' }),
  },
  {
    type: 'Mutation',
    field: 'refreshSession',
    protected: false,
    resolve: () => ({ accessToken: 'new-jwt-token' }),
  },
  {
    type: 'Mutation',
    field: 'requestPasswordReset',
    protected: false,
    resolve: () => true,
  },
];
