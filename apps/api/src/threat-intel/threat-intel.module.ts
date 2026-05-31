import { Module, Global } from '@nestjs/common';
import { ThreatIntelService } from './threat-intel.service';
import { ThreatIntelController } from './threat-intel.controller';

@Global()
@Module({
  controllers: [ThreatIntelController],
  providers: [ThreatIntelService],
  exports: [ThreatIntelService],
})
export class ThreatIntelModule {}
