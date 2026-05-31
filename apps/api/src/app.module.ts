import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PolicyModule } from './policy/policy.module';
import { ReplayModule } from './replay/replay.module';
import { McpTrustModule } from './mcp-trust/mcp-trust.module';
import { MemoryModule } from './memory/memory.module';
import { ComplianceModule } from './compliance/compliance.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    PrismaModule,
    PolicyModule,
    ReplayModule,
    McpTrustModule,
    MemoryModule,
    ComplianceModule,
    EventsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
