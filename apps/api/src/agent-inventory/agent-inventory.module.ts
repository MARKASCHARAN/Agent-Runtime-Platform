import { Module, Global } from '@nestjs/common';
import { AgentInventoryService } from './agent-inventory.service';
import { AgentInventoryController } from './agent-inventory.controller';

@Global()
@Module({
  controllers: [AgentInventoryController],
  providers: [AgentInventoryService],
  exports: [AgentInventoryService],
})
export class AgentInventoryModule {}
