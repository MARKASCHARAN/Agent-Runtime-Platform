import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest, UserRole } from './auth-context';
import { AgentAuthService } from '../agent-auth/agent-auth.service';

const ALLOWED_ROLES: UserRole[] = ['admin', 'approver', 'viewer'];

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private agentAuth: AgentAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const bearer = request.headers.authorization
      ?.replace(/^Bearer\s+/i, '')
      .trim();
    const headerApiKey = request.headers['x-api-key'];
    const apiKey = (typeof headerApiKey === 'string' ? headerApiKey : undefined) ?? bearer;

    if (!apiKey) {
      throw new UnauthorizedException('Missing API credentials');
    }

    // Check if the credential is a valid Agent Token
    const agentData = await this.agentAuth.validateToken(apiKey);
    if (agentData) {
      request.auth = {
        apiKeyId: agentData.clientId,
        role: 'agent' as any, // Add agent role
        projectId: agentData.projectId,
      };
      return true;
    }

    // Fall back to standard API Key authentication
    const configuredKeys = (process.env.API_KEYS ?? 'dev-api-key')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (!configuredKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API credentials');
    }

    const rawProjectId = request.headers['x-project-id'];
    const projectId =
      typeof rawProjectId === 'string' && rawProjectId.trim().length > 0
        ? rawProjectId.trim()
        : undefined;

    if (!projectId) {
      throw new ForbiddenException('x-project-id header is required');
    }

    const rawRole = request.headers['x-user-role'];
    const normalizedRole =
      typeof rawRole === 'string'
        ? (rawRole.trim().toLowerCase() as UserRole)
        : 'viewer';

    request.auth = {
      apiKeyId: apiKey,
      role: ALLOWED_ROLES.includes(normalizedRole) ? normalizedRole : 'viewer',
      projectId,
    };

    return true;
  }
}
