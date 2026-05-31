import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ThreatIntelService } from './threat-intel.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('threat-intel')
@UseGuards(AuthGuard, RolesGuard)
export class ThreatIntelController {
  constructor(private threatIntel: ThreatIntelService) {}

  @Get('leaderboard')
  @Roles('admin', 'approver', 'viewer')
  async getLeaderboard(@Request() req: { auth: { projectId: string } }) {
    return this.threatIntel.getLeaderboard(req.auth.projectId);
  }

  @Get('graph')
  @Roles('admin', 'approver', 'viewer')
  async getTrustGraph(@Request() req: { auth: { projectId: string } }) {
    return this.threatIntel.getTrustGraph(req.auth.projectId);
  }

  @Post('verify-prompt')
  async verifyPrompt(
    @Request() req: { auth: { projectId: string }; body: { prompt: string } },
  ) {
    return this.threatIntel.verifyPrompt(req.body.prompt, req.auth.projectId);
  }
}
