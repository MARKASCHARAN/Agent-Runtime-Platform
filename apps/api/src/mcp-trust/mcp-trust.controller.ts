import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { McpTrustService } from './mcp-trust.service';
import { RegisterToolDto, VerifyToolDto } from './mcp-trust.dto';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth-context';

@Controller('mcp-trust')
export class McpTrustController {
  constructor(private readonly trustService: McpTrustService) {}

  @Post('register')
  @Roles('admin')
  async registerTool(
    @Body() body: RegisterToolDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const projectId = req.auth?.projectId ?? '';
    return this.trustService.registerTool({ ...body, projectId });
  }

  @Post('verify')
  async verifyTool(
    @Body() body: VerifyToolDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const projectId = req.auth?.projectId ?? '';
    return this.trustService.verifyTool(
      body.toolIdentity,
      body.schemaHash,
      projectId,
    );
  }

  @Get('profiles')
  async getTrustProfiles(@Req() req: AuthenticatedRequest) {
    const projectId = req.auth?.projectId ?? '';
    return this.trustService.getTrustProfiles(projectId);
  }
}
