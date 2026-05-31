import { Module } from '@nestjs/common';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
