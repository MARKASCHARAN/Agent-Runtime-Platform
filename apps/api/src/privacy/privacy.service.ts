import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);

  // Basic regex for common PII
  private readonly PII_PATTERNS = {
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    ssn: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phoneNumber: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  };

  /**
   * Recursively redacts PII from an object or string
   */
  redact(data: any): any {
    if (typeof data === 'string') {
      let redactedStr = data;
      for (const [type, regex] of Object.entries(this.PII_PATTERNS)) {
        redactedStr = redactedStr.replace(regex, `[REDACTED_${type.toUpperCase()}]`);
      }
      return redactedStr;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redact(item));
    }

    if (typeof data === 'object' && data !== null) {
      const redactedObj: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Option to mask specific keys entirely (e.g. 'password', 'secret')
        if (/secret|password|token|key/i.test(key) && typeof value === 'string') {
          redactedObj[key] = '[REDACTED_SECRET]';
        } else {
          redactedObj[key] = this.redact(value);
        }
      }
      return redactedObj;
    }

    return data;
  }
}
