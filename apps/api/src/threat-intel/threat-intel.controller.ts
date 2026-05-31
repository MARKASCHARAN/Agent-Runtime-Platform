import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
  async getLeaderboard(@Request() req: any) {
    return this.threatIntel.getLeaderboard(req.auth.projectId);
  }

  @Get('graph')
  @Roles('admin', 'approver', 'viewer')
  async getTrustGraph(@Request() req: any) {
    return this.threatIntel.getTrustGraph(req.auth.projectId);
  }
}
