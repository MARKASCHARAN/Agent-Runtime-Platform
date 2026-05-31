import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { AgentInventoryService } from '../agent-inventory/agent-inventory.service';

@Injectable()
export class ThreatIntelService {
  private readonly logger = new Logger(ThreatIntelService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private inventory: AgentInventoryService,
  ) {}

  /**
   * Evaluates if a DENY decision warrants a threat score increase.
   * Auto-Quarantines the agent if risk score exceeds the role threshold.
   */
  async recordThreat(actorId: string, actionIntent: string, projectId: string) {
    const identity = await this.prisma.agentIdentity.findUnique({
      where: { clientId: actorId },
      include: { agents: { include: { role: true } } },
    });

    if (!identity || identity.agents.length === 0) return;

    const agent = identity.agents[0];
    const riskDelta = 20; // Hardcoded +20 risk per DENY for now

    const threatEvent = await this.prisma.threatEvent.create({
      data: {
        agentRecordId: agent.id,
        reason: `Triggered DENY on intent: ${actionIntent}`,
        riskDelta,
        projectId,
      },
    });

    const newScore = agent.currentRiskScore + riskDelta;
    
    await this.prisma.agentRecord.update({
      where: { id: agent.id },
      data: { currentRiskScore: newScore },
    });

    this.logger.warn(`Agent ${agent.name} risk increased to ${newScore}`);

    // Auto-Quarantine Logic
    if (agent.role && newScore >= agent.role.maxRiskScore && agent.status === 'ACTIVE') {
      this.logger.error(`[AUTO-QUARANTINE] Agent ${agent.name} exceeded risk threshold ${agent.role.maxRiskScore}. Suspending...`);
      await this.inventory.updateStatus(agent.id, 'SUSPENDED', projectId);
      
      this.eventsGateway.server.emit('threat.quarantine', {
        agentId: agent.id,
        name: agent.name,
        score: newScore,
        threshold: agent.role.maxRiskScore,
        projectId,
      });
    }
  }

  async getLeaderboard(projectId: string) {
    return this.prisma.agentRecord.findMany({
      where: { projectId },
      orderBy: { currentRiskScore: 'desc' },
      take: 10,
      include: { role: true, threatEvents: { orderBy: { createdAt: 'desc' }, take: 3 } },
    });
  }

  async getTrustGraph(projectId: string) {
    // A primitive version of a Trust Graph.
    // In a real system, this would aggregate decisions from the DB into a node/edge JSON structure.
    
    const agents = await this.prisma.agentRecord.findMany({
      where: { projectId },
      select: { id: true, name: true, currentRiskScore: true, status: true },
    });

    const decisions = await this.prisma.policyDecision.groupBy({
      by: ['actionIntent', 'outcome'],
      where: { projectId },
      _count: true,
    });

    // Mock graph construction
    const nodes = agents.map(a => ({ id: a.id, label: a.name, type: 'agent', score: a.currentRiskScore, status: a.status }));
    
    const intentNodes = Array.from(new Set(decisions.map(d => d.actionIntent))).map(intent => ({
      id: intent,
      label: intent,
      type: 'tool',
    }));

    // In a real graph, we'd map which agent called which tool. For now, we mock edges from the aggregate.
    return {
      nodes: [...nodes, ...intentNodes],
      edges: decisions.map(d => ({
        source: nodes[0]?.id, // Mocking that the first agent did it
        target: d.actionIntent,
        outcome: d.outcome,
        count: d._count,
      })),
    };
  }
}
