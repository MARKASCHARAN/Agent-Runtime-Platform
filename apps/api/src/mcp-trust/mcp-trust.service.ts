import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class McpTrustService {
  constructor(private prisma: PrismaService) {}

  async registerTool(data: {
    toolIdentity: string;
    publisher: string;
    schemaHash: string;
    projectId: string;
  }) {
    return this.prisma.toolTrustProfile.upsert({
      where: {
        toolIdentity_projectId: {
          toolIdentity: data.toolIdentity,
          projectId: data.projectId,
        },
      },
      update: { publisher: data.publisher, schemaHash: data.schemaHash },
      create: {
        toolIdentity: data.toolIdentity,
        publisher: data.publisher,
        schemaHash: data.schemaHash,
        trustStatus: 'UNVERIFIED',
        projectId: data.projectId,
      },
    });
  }

  async verifyTool(
    toolIdentity: string,
    schemaHash: string,
    projectId: string,
  ) {
    const profile = await this.prisma.toolTrustProfile.findUnique({
      where: {
        toolIdentity_projectId: {
          toolIdentity,
          projectId,
        },
      },
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

  async getTrustProfiles(projectId: string) {
    return this.prisma.toolTrustProfile.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
