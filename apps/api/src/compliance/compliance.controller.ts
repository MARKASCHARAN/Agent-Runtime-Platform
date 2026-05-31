import { Controller, Get, Param, Req } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { AuthenticatedRequest } from '../auth/auth-context';
import { assertProjectScope } from '../common/project-scope';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('report/:projectId')
  async getReport(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    assertProjectScope(scopedProjectId, projectId);
    return this.complianceService.generateReport(projectId);
  }
}
