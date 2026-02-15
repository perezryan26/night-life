import { RequestLike } from './http';

export interface RestEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  protected: boolean;
  handler: (req: RequestLike) => unknown;
}

export interface RestMatch {
  endpoint: RestEndpoint;
  params: Record<string, string>;
}

export interface GraphQLOperation {
  type: 'Query' | 'Mutation' | 'Subscription';
  field: string;
  protected: boolean;
  resolve: (req: RequestLike, args: Record<string, unknown>) => unknown;
}
