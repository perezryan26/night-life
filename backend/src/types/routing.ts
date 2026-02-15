import { RequestLike } from './http';

export interface RestEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  protected: boolean;
  handler: (req: RequestLike) => unknown;
}

export interface GraphQLOperation {
  type: 'Query' | 'Mutation';
  field: string;
  protected: boolean;
  resolve: (req: RequestLike, args: Record<string, unknown>) => unknown;
}
