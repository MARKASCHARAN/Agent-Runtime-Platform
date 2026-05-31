import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReplayService } from './replay.service';

@Controller('replay')
export class ReplayController {
  constructor(private readonly replayService: ReplayService) {}

  @Post('ingest')
  async ingestEvent(@Body() body: {
    replayCorrelationId: string;
    eventType: string;
    payload: any;
    actorId: string;
  }) {
    return this.replayService.ingestEvent(body);
  }

  @Get('timeline/:correlationId')
  async getTimeline(@Param('correlationId') correlationId: string) {
    return this.replayService.getTimeline(correlationId);
  }

  @Get('export/:correlationId')
  async exportEvidence(@Param('correlationId') correlationId: string) {
    return this.replayService.exportEvidence(correlationId);
  }
}
