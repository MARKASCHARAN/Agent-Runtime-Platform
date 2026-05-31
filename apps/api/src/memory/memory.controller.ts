import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MemoryService } from './memory.service';

@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post('mutate')
  async recordMutation(@Body() body: {
    agentId: string;
    mutationType: string;
    key: string;
    previousValue?: string;
    newValue?: string;
    sourceMetadata: any;
  }) {
    return this.memoryService.recordMutation(body);
  }

  @Get(':agentId/mutations')
  async getMutations(@Param('agentId') agentId: string) {
    return this.memoryService.getMutations(agentId);
  }
}
