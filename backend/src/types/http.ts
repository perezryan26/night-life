export type Role =
  | 'customer'
  | 'club_admin'
  | 'manager'
  | 'host'
  | 'analyst'
  | 'super_admin';

export interface AuthContext {
  userId: string;
  clubId?: string;
  roles: Role[];
}

export interface RequestLike {
  headers: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
  body?: unknown;
  auth?: AuthContext;
  tenantId?: string;
}
