import { Controller, Get, Post, Body } from '@nestjs/common';
import { McpTrustService } from './mcp-trust.service';

@Controller('mcp-trust')
export class McpTrustController {
  constructor(private readonly trustService: McpTrustService) {}

  @Post('register')
  async registerTool(@Body() body: { toolIdentity: string; publisher: string; schemaHash: string }) {
    return this.trustService.registerTool(body);
  }

  @Post('verify')
  async verifyTool(@Body() body: { toolIdentity: string; schemaHash: string }) {
    return this.trustService.verifyTool(body.toolIdentity, body.schemaHash);
  }

  @Get('profiles')
  async getTrustProfiles() {
    return this.trustService.getTrustProfiles();
  }
}
