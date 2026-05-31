import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertProjectScope } from '../common/project-scope';

@Injectable()
export class AgentInventoryService {
  constructor(private prisma: PrismaService) {}

  async listAgents(projectId: string) {
    return this.prisma.agentRecord.findMany({
      where: { projectId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAgent(projectId: string, data: { name: string; description?: string; roleId?: string; agentIdentityId?: string }) {
    if (data.roleId) {
      const role = await this.prisma.agentRole.findUnique({ where: { id: data.roleId } });
      if (!role) throw new NotFoundException('Role not found');
      assertProjectScope(projectId, role.projectId);
    }
    if (data.agentIdentityId) {
      const identity = await this.prisma.agentIdentity.findUnique({ where: { id: data.agentIdentityId } });
      if (!identity) throw new NotFoundException('Identity not found');
      assertProjectScope(projectId, identity.projectId);
    }

    return this.prisma.agentRecord.create({
      data: {
        name: data.name,
        description: data.description,
        roleId: data.roleId,
        agentIdentityId: data.agentIdentityId,
        projectId,
      },
      include: { role: true },
    });
  }

  async getAgent(id: string, projectId: string) {
    const agent = await this.prisma.agentRecord.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    assertProjectScope(projectId, agent.projectId);
    return agent;
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'RETIRED', projectId: string) {
    const agent = await this.getAgent(id, projectId);
    return this.prisma.agentRecord.update({
      where: { id: agent.id },
      data: { status },
      include: { role: true },
    });
  }

  async listRoles(projectId: string) {
    return this.prisma.agentRole.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }
}
