import { Request } from 'express';

export type UserRole = 'admin' | 'approver' | 'viewer';

export interface AuthContext {
  apiKeyId: string;
  role: UserRole;
  projectId: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthContext;
}
