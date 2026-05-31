import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PolicyModule } from './policy/policy.module';
import { ReplayModule } from './replay/replay.module';
import { McpTrustModule } from './mcp-trust/mcp-trust.module';
import { MemoryModule } from './memory/memory.module';
import { ComplianceModule } from './compliance/compliance.module';
import { EventsModule } from './events/events.module';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    PolicyModule,
    ReplayModule,
    McpTrustModule,
    MemoryModule,
    ComplianceModule,
    EventsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
