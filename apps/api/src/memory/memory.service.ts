import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MemoryService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async recordMutation(data: {
    agentId: string;
    mutationType: string;
    key: string;
    previousValue?: string;
    newValue?: string;
    sourceMetadata: Record<string, unknown>;
    projectId: string;
  }) {
    let anomalyScore = 0.0;
    if (data.mutationType === 'OVERWRITE' && data.previousValue && data.newValue) {
      if (Math.abs(data.newValue.length - data.previousValue.length) > 1000) {
        anomalyScore = 0.8;
      }
    }

    const mutation = await this.prisma.memoryMutation.create({
      data: {
        agentId: data.agentId,
        mutationType: data.mutationType,
        key: data.key,
        previousValue: data.previousValue,
        newValue: data.newValue,
        sourceMetadata: data.sourceMetadata,
        anomalyScore,
        projectId: data.projectId,
      },
    });

    if (anomalyScore > 0.5) {
      this.eventsGateway.emitMemoryAnomaly(mutation);
    }

    return mutation;
  }

  async getMutations(agentId: string, projectId: string) {
    return this.prisma.memoryMutation.findMany({
      where: { agentId, projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
