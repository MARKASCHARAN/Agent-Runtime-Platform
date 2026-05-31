import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReplayService {
  constructor(private prisma: PrismaService) {}

  async ingestEvent(data: {
    replayCorrelationId: string;
    eventType: string;
    payload: Record<string, unknown>;
    actorId: string;
    projectId: string;
  }) {
    return this.prisma.executionEvent.create({
      data: {
        replayCorrelationId: data.replayCorrelationId,
        eventType: data.eventType,
        payload: data.payload,
        actorId: data.actorId,
        projectId: data.projectId,
      },
    });
  }

  async getTimeline(replayCorrelationId: string, projectId: string) {
    return this.prisma.executionEvent.findMany({
      where: { replayCorrelationId, projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async exportEvidence(replayCorrelationId: string, projectId: string) {
    const events = await this.getTimeline(replayCorrelationId, projectId);

    return {
      correlationId: replayCorrelationId,
      projectId,
      exportedAt: new Date().toISOString(),
      eventCount: events.length,
      events,
    };
  }
}
