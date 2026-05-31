import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class McpTrustService {
  constructor(private prisma: PrismaService) {}

  async registerTool(data: { toolIdentity: string; publisher: string; schemaHash: string }) {
    return this.prisma.toolTrustProfile.upsert({
      where: { toolIdentity: data.toolIdentity },
      update: { publisher: data.publisher, schemaHash: data.schemaHash },
      create: {
        toolIdentity: data.toolIdentity,
        publisher: data.publisher,
        schemaHash: data.schemaHash,
        trustStatus: 'UNVERIFIED',
      },
    });
  }

  async verifyTool(toolIdentity: string, schemaHash: string) {
    const profile = await this.prisma.toolTrustProfile.findUnique({
      where: { toolIdentity },
    });

    if (!profile) {
      return { allowed: false, reason: 'TOOL_UNKNOWN' };
    }

    if (profile.trustStatus === 'UNTRUSTED') {
      return { allowed: false, reason: 'TOOL_UNTRUSTED' };
    }

    if (profile.schemaHash !== schemaHash) {
      return { allowed: false, reason: 'SCHEMA_MISMATCH' };
    }

    return { allowed: true, reason: 'VERIFIED' };
  }

  async getTrustProfiles() {
    return this.prisma.toolTrustProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
