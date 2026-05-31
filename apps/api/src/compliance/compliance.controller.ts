import { Controller, Get, Param } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('report/:projectId')
  async getReport(@Param('projectId') projectId: string) {
    return this.complianceService.generateReport(projectId);
  }
}
