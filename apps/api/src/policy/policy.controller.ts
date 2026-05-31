import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import {
  CreatePolicySetDto,
  EvaluateActionDto,
  ResolveApprovalDto,
} from './policy.dto';
import { AuthenticatedRequest } from '../auth/auth-context';
import { assertProjectScope } from '../common/project-scope';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('policy')
export class PolicyController {
  constructor(
    private readonly policyService: PolicyService,
    private readonly auditService: AuditService,
  ) {}

  @Post('sets')
  @Roles('admin')
  async createPolicySet(
    @Body() body: CreatePolicySetDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    assertProjectScope(scopedProjectId, body.projectId);

    const policy = await this.policyService.createPolicySet(body);
    this.auditService.logSensitiveEvent('policy.set.created', {
      policySetId: policy.id,
      projectId: body.projectId,
      actorRole: req.auth?.role,
    });

    return policy;
  }

  @Get('sets')
  async getPolicySets(
    @Query('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    assertProjectScope(scopedProjectId, projectId);
    return this.policyService.getPolicySets(projectId);
  }

  @Get('sets/:id')
  async getPolicySet(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const scopedProjectId = req.auth?.projectId ?? '';
    return this.policyService.getPolicySet(id, scopedProjectId);
  }

  @Post('evaluate')
  async evaluateAction(
    @Body() body: EvaluateActionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    const decision = await this.policyService.evaluateAction(body, scopedProjectId);

    this.auditService.logSensitiveEvent('policy.action.evaluated', {
      policySetId: body.policySetId,
      actionIntent: body.actionIntent,
      outcome: 'outcome' in decision ? decision.outcome : undefined,
      simulated: body.simulate ?? false,
      projectId: scopedProjectId,
    });

    return decision;
  }

  @Get('sets/:id/decisions')
  async getDecisions(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const scopedProjectId = req.auth?.projectId ?? '';
    return this.policyService.getDecisions(id, scopedProjectId);
  }

  @Get('sets/:id/approvals')
  @Roles('admin', 'approver')
  async getPendingApprovals(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const scopedProjectId = req.auth?.projectId ?? '';
    return this.policyService.getPendingApprovals(id, scopedProjectId);
  }

  @Post('decisions/:id/resolve')
  @Roles('admin', 'approver')
  async resolveApproval(
    @Param('id') id: string,
    @Body() body: ResolveApprovalDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const scopedProjectId = req.auth?.projectId ?? '';
    const decision = await this.policyService.resolveApproval(
      id,
      body.resolution,
      req.auth?.apiKeyId ?? 'unknown',
      scopedProjectId,
    );

    this.auditService.logSensitiveEvent('policy.approval.resolved', {
      decisionId: id,
      resolution: body.resolution,
      projectId: scopedProjectId,
      actorRole: req.auth?.role,
    });

    return decision;
  }
}
