import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async generateReport(projectId: string) {
    const policySets = await this.prisma.policySet.findMany({
      where: { projectId },
      include: { decisions: true },
    });

    const totalDecisions = policySets.reduce((acc, set) => acc + set.decisions.length, 0);
    const deniedActions = policySets.reduce((acc, set) => acc + set.decisions.filter(d => d.outcome === 'DENY').length, 0);
    const pendingApprovals = policySets.reduce((acc, set) => acc + set.decisions.filter(d => d.outcome === 'REQUIRE_APPROVAL').length, 0);

    const memoryAnomalies = await this.prisma.memoryMutation.count({
      where: { anomalyScore: { gt: 0.5 } },
    });

    return {
      generatedAt: new Date().toISOString(),
      projectId,
      summary: {
        totalDecisions,
        deniedActions,
        pendingApprovals,
        highRiskMemoryAnomalies: memoryAnomalies,
      },
      status: pendingApprovals > 0 ? 'NEEDS_ATTENTION' : 'COMPLIANT',
    };
  }
}
