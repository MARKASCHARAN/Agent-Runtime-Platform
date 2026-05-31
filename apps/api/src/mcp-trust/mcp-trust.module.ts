import { Module } from '@nestjs/common';
import { McpTrustController } from './mcp-trust.controller';
import { McpTrustService } from './mcp-trust.service';

@Module({
  controllers: [McpTrustController],
  providers: [McpTrustService],
  exports: [McpTrustService],
})
export class McpTrustModule {}
