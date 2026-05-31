import { Module, Global } from '@nestjs/common';
import { AgentAuthService } from './agent-auth.service';
import { AgentAuthController } from './agent-auth.controller';

@Global()
@Module({
  controllers: [AgentAuthController],
  providers: [AgentAuthService],
  exports: [AgentAuthService],
})
export class AgentAuthModule {}
