import { Controller, Post, Body } from '@nestjs/common';
import { AgentAuthService } from './agent-auth.service';

@Controller('oauth')
export class AgentAuthController {
  constructor(private authService: AgentAuthService) {}

  @Post('token')
  async token(@Body() body: { client_id: string; client_secret: string; grant_type: string }) {
    if (body.grant_type !== 'client_credentials') {
      return { error: 'unsupported_grant_type' };
    }
    return this.authService.authenticate(body.client_id, body.client_secret);
  }
}
