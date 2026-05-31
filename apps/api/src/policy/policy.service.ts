import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PolicyService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async createPolicySet(data: { name: string; description?: string; projectId: string; rules: any }) {
    return this.prisma.policySet.create({
      data: {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        rules: data.rules,
      },
    });
  }

  async getPolicySets(projectId: string) {
    return this.prisma.policySet.findMany({
      where: { projectId },
    });
  }

  async getPolicySet(id: string) {
    const policy = await this.prisma.policySet.findUnique({
      where: { id },
    });
    if (!policy) throw new NotFoundException('PolicySet not found');
    return policy;
  }

  async evaluateAction(data: { policySetId: string; actionIntent: string; context: any; executionEventId?: string }) {
    let outcome = 'ALLOW';
    if (data.actionIntent === 'DANGEROUS_DB_DROP') {
      outcome = 'DENY';
    } else if (data.actionIntent === 'SENSITIVE_API_CALL') {
      outcome = 'REQUIRE_APPROVAL';
    }

    const decision = await this.prisma.policyDecision.create({
      data: {
        policySetId: data.policySetId,
        actionIntent: data.actionIntent,
        context: data.context,
        outcome,
        executionEventId: data.executionEventId,
      },
    });

    if (outcome === 'REQUIRE_APPROVAL') {
      this.eventsGateway.emitApprovalRequired(decision);
    }
    
    this.eventsGateway.emitPolicyIntervention(decision);

    return decision;
  }

  async getDecisions(policySetId: string) {
    return this.prisma.policyDecision.findMany({
      where: { policySetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingApprovals(policySetId: string) {
    return this.prisma.policyDecision.findMany({
      where: { policySetId, outcome: 'REQUIRE_APPROVAL' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveApproval(decisionId: string, resolution: 'ALLOW' | 'DENY') {
    return this.prisma.policyDecision.update({
      where: { id: decisionId },
      data: { outcome: resolution },
    });
  }
}
