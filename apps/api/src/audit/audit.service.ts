import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditLog');

  logSensitiveEvent(event: string, details: Record<string, unknown>) {
    this.logger.log(
      JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...details,
      }),
    );
  }
}
