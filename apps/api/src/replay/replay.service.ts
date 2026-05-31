import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReplayService {
  constructor(private prisma: PrismaService) {}

  async ingestEvent(data: {
    replayCorrelationId: string;
    eventType: string;
    payload: any;
    actorId: string;
  }) {
    return this.prisma.executionEvent.create({
      data: {
        replayCorrelationId: data.replayCorrelationId,
        eventType: data.eventType,
        payload: data.payload,
        actorId: data.actorId,
      },
    });
  }

  async getTimeline(replayCorrelationId: string) {
    return this.prisma.executionEvent.findMany({
      where: { replayCorrelationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async exportEvidence(replayCorrelationId: string) {
    const events = await this.getTimeline(replayCorrelationId);
    
    // In a real application, you might cryptographically sign this payload
    const exportBundle = {
      correlationId: replayCorrelationId,
      exportedAt: new Date().toISOString(),
      eventCount: events.length,
      events,
    };

    return exportBundle;
  }
}
