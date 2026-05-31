import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class McpTrustService {
  private readonly logger = new Logger(McpTrustService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Verifies if a tool and its schema hash are approved in the enterprise registry.
   */
  async verifyTool(name: string, schemaHash: string, projectId: string): Promise<boolean> {
    const registryEntry = await this.prisma.mcpRegistry.findFirst({
      where: {
        name,
        projectId,
        status: 'APPROVED',
      },
    });

    if (!registryEntry) {
      this.logger.warn(`MCP Verification Failed: Tool '${name}' is not in the approved registry.`);
      return false;
    }

    if (registryEntry.schemaHash !== schemaHash) {
      this.logger.error(`MCP Verification Failed: Tool '${name}' hash mismatch! Expected ${registryEntry.schemaHash}, got ${schemaHash}. Possible supply chain attack.`);
      return false;
    }

    return true;
  }

  async getRegistry(projectId: string) {
    return this.prisma.mcpRegistry.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addTool(data: { name: string; publisher: string; schemaHash: string }, projectId: string) {
    return this.prisma.mcpRegistry.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async revokeTool(id: string, projectId: string) {
    return this.prisma.mcpRegistry.update({
      where: { id },
      data: { status: 'REVOKED' },
    });
  }
}
