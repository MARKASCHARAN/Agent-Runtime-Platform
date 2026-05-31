import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AgentAuthService {
  constructor(private prisma: PrismaService) {}

  async authenticate(clientId: string, clientSecret: string) {
    const identity = await this.prisma.agentIdentity.findUnique({
      where: { clientId },
    });

    if (!identity) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    const hashedSecret = crypto
      .createHash('sha256')
      .update(clientSecret)
      .digest('hex');
    if (hashedSecret !== identity.hashedSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Generate a simple token (in production, use signed JWT)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    await this.prisma.agentToken.create({
      data: {
        agentIdentityId: identity.id,
        token,
        expiresAt,
      },
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: identity.scopes,
      projectId: identity.projectId,
    };
  }

  async validateToken(token: string) {
    const agentToken = await this.prisma.agentToken.findUnique({
      where: { token },
      include: { agentIdentity: true },
    });

    if (!agentToken || agentToken.expiresAt < new Date()) {
      return null;
    }

    return {
      clientId: agentToken.agentIdentity.clientId,
      scopes: agentToken.agentIdentity.scopes.split(','),
      projectId: agentToken.agentIdentity.projectId,
    };
  }
}
