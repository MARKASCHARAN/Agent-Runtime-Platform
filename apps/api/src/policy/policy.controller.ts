import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PolicyService } from './policy.service';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post('sets')
  async createPolicySet(@Body() body: { name: string; description?: string; projectId: string; rules: any }) {
    return this.policyService.createPolicySet(body);
  }

  @Get('sets')
  async getPolicySets(@Query('projectId') projectId: string) {
    if (!projectId) return [];
    return this.policyService.getPolicySets(projectId);
  }

  @Get('sets/:id')
  async getPolicySet(@Param('id') id: string) {
    return this.policyService.getPolicySet(id);
  }

  @Post('evaluate')
  async evaluateAction(@Body() body: { policySetId: string; actionIntent: string; context: any; executionEventId?: string }) {
    return this.policyService.evaluateAction(body);
  }

  @Get('sets/:id/decisions')
  async getDecisions(@Param('id') id: string) {
    return this.policyService.getDecisions(id);
  }

  @Get('sets/:id/approvals')
  async getPendingApprovals(@Param('id') id: string) {
    return this.policyService.getPendingApprovals(id);
  }

  @Post('decisions/:id/resolve')
  async resolveApproval(@Param('id') id: string, @Body() body: { resolution: 'ALLOW' | 'DENY' }) {
    return this.policyService.resolveApproval(id, body.resolution);
  }
}
