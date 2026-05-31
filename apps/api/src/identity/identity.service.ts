import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

/**
 * Service responsible for managing Agent Identities and Just-In-Time (JIT) credentials.
 * Handles the creation of ephemeral tokens for secure, scoped access to external tools.
 */
@Injectable()
export class IdentityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Issues a short-lived Just-In-Time (JIT) token for an agent to access a specific tool.
   * Enforces RBAC checks to ensure the agent is authorized for the requested scope.
   * 
   * @param data The access request details including agentId, tool, and scope.
   * @returns An ephemeral token string and its expiration timestamp.
   * @throws ForbiddenException if the agent is inactive or lacks the necessary role permissions.
   */
  async issueJitToken(data: {
    agentId: string;
    tool: string;
    scope: string;
    projectId: string;
  }) {
    // 1. Verify agent exists and is active
    const agent = await this.prisma.agentRecord.findUnique({
      where: { id: data.agentId },
      include: { role: true },
    });

    if (!agent || agent.status !== 'ACTIVE' || agent.projectId !== data.projectId) {
      throw new ForbiddenException('Agent is not active or unauthorized');
    }

    // 2. In a real system, we'd check PolicyService to see if the agent's role 
    // is allowed to access this specific tool and scope.
    if (agent.role && agent.role.allowedIntents !== '*') {
      const allowedIntents = agent.role.allowedIntents.split(',').map(i => i.trim());
      if (!allowedIntents.includes(data.tool) && !allowedIntents.includes(`${data.tool}:${data.scope}`)) {
        throw new ForbiddenException(`Role ${agent.role.name} is not authorized for tool ${data.tool}`);
      }
    }

    // 3. Generate an ephemeral token valid for 5 minutes
    const tokenStr = `ephemeral_${data.tool}_${randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // 4. Save to database
    const jitToken = await this.prisma.agentJitToken.create({
      data: {
        agentId: data.agentId,
        tool: data.tool,
        scope: data.scope,
        token: tokenStr,
        expiresAt,
        projectId: data.projectId,
      },
    });

    return {
      token: jitToken.token,
      expiresAt: jitToken.expiresAt,
    };
  }

  /**
   * Registers a new Autonomous Agent Identity within the platform.
   * 
   * @param data The registration payload including name, description, and role.
   * @returns The newly created AgentRecord.
   */
  async registerIdentity(data: {
    name: string;
    description?: string;
    roleId?: string;
    projectId: string;
  }) {
    return this.prisma.agentRecord.create({
      data: {
        name: data.name,
        description: data.description,
        roleId: data.roleId,
        projectId: data.projectId,
        status: 'ACTIVE',
      },
    });
  }
}
