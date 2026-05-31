import { Controller, Post, Body, Req } from '@nestjs/common';
import { IdentityService } from './identity.service';
import type { AuthenticatedRequest } from '../auth/auth-context';

/**
 * Identity API Controller.
 * Exposes endpoints for agent registration and Just-In-Time (JIT) credentials.
 */
@Controller('identity')
export class IdentityController {
  constructor(private identityService: IdentityService) {}

  /**
   * Endpoint for agents to request ephemeral access to a specific tool and scope.
   * Typically called automatically by the Agent SDKs before executing sensitive actions.
   * 
   * @param body The access request details.
   * @param req The authenticated request containing the project scope.
   */
  @Post('access')
  async requestAccess(
    @Body() body: { tool: string; scope: string; actorId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    return this.identityService.issueJitToken({
      agentId: body.actorId,
      tool: body.tool,
      scope: body.scope,
      projectId: scopedProjectId,
    });
  }

  /**
   * Endpoint to register a new Autonomous Agent Identity within a project.
   * 
   * @param body The registration details including name and optional role.
   * @param req The authenticated request containing the project scope.
   */
  @Post('register')
  async registerIdentity(
    @Body() body: { name: string; description?: string; roleId?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    return this.identityService.registerIdentity({
      name: body.name,
      description: body.description,
      roleId: body.roleId,
      projectId: scopedProjectId,
    });
  }
}
