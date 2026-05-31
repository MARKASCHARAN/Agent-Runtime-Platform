import { Test, TestingModule } from '@nestjs/testing';
import { AgentInventoryService } from './agent-inventory.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  agentRecord: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  agentRole: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  agentIdentity: {
    findUnique: jest.fn(),
  },
};

describe('AgentInventoryService', () => {
  let service: AgentInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentInventoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AgentInventoryService>(AgentInventoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAgent', () => {
    it('should throw NotFoundException if roleId does not exist', async () => {
      mockPrisma.agentRole.findUnique.mockResolvedValueOnce(null);
      
      await expect(service.createAgent('proj_1', { name: 'Agent X', roleId: 'role_invalid' }))
        .rejects
        .toThrow('Role not found');
    });

    it('should throw UnauthorizedException if role belongs to another project', async () => {
      mockPrisma.agentRole.findUnique.mockResolvedValueOnce({ projectId: 'proj_OTHER' });
      
      await expect(service.createAgent('proj_1', { name: 'Agent X', roleId: 'role_other' }))
        .rejects
        .toThrow('Project scope mismatch');
    });

    it('should create the agent when relationships and scopes are valid', async () => {
      mockPrisma.agentRole.findUnique.mockResolvedValueOnce({ projectId: 'proj_1' });
      mockPrisma.agentIdentity.findUnique.mockResolvedValueOnce({ projectId: 'proj_1' });
      mockPrisma.agentRecord.create.mockResolvedValueOnce({ id: 'agent_1', name: 'Agent X' });

      const result = await service.createAgent('proj_1', {
        name: 'Agent X',
        roleId: 'role_1',
        agentIdentityId: 'identity_1',
      });

      expect(result).toEqual({ id: 'agent_1', name: 'Agent X' });
      expect(mockPrisma.agentRecord.create).toHaveBeenCalledWith({
        data: {
          name: 'Agent X',
          description: undefined,
          roleId: 'role_1',
          agentIdentityId: 'identity_1',
          projectId: 'proj_1',
        },
        include: { role: true },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update the agent status (Kill Switch)', async () => {
      mockPrisma.agentRecord.findUnique.mockResolvedValueOnce({ id: 'agent_1', projectId: 'proj_1' });
      mockPrisma.agentRecord.update.mockResolvedValueOnce({ id: 'agent_1', status: 'SUSPENDED' });

      const result = await service.updateStatus('agent_1', 'SUSPENDED', 'proj_1');
      
      expect(result).toEqual({ id: 'agent_1', status: 'SUSPENDED' });
      expect(mockPrisma.agentRecord.update).toHaveBeenCalledWith({
        where: { id: 'agent_1' },
        data: { status: 'SUSPENDED' },
        include: { role: true },
      });
    });
  });
});
