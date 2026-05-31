import { Test, TestingModule } from '@nestjs/testing';
import { ThreatIntelService } from './threat-intel.service';
import { PrismaService } from '../prisma/prisma.service';
import { AgentInventoryService } from '../agent-inventory/agent-inventory.service';
import { EventsGateway } from '../events/events.gateway';

const mockPrisma = {
  threatEvent: {
    create: jest.fn(),
  },
  agentRecord: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  agentIdentity: {
    findUnique: jest.fn(),
  },
};

const mockInventory = {
  updateStatus: jest.fn(),
};

describe('ThreatIntelService', () => {
  let service: ThreatIntelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreatIntelService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AgentInventoryService, useValue: mockInventory },
        { provide: EventsGateway, useValue: { server: { emit: jest.fn() } } },
      ],
    }).compile();

    service = module.get<ThreatIntelService>(ThreatIntelService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordThreat', () => {
    it('should ignore threat if agent identity has no agents', async () => {
      mockPrisma.agentIdentity.findUnique.mockResolvedValueOnce({ agents: [] });
      mockPrisma.agentRecord.findMany.mockResolvedValueOnce([]);
      
      await service.recordThreat('client_1', 'POLICY_DENY', 'proj_1');
      
      expect(mockPrisma.threatEvent.create).not.toHaveBeenCalled();
    });

    it('should record threat and update score but NOT suspend if below threshold', async () => {
      mockPrisma.agentIdentity.findUnique.mockResolvedValueOnce({ agents: [{ id: 'agent_1', status: 'ACTIVE', currentRiskScore: 10, role: { maxRiskScore: 100 } }] });
      mockPrisma.agentRecord.findMany.mockResolvedValueOnce([
        { id: 'agent_1', status: 'ACTIVE', currentRiskScore: 10, role: { maxRiskScore: 100 } }
      ]);
      mockPrisma.threatEvent.create.mockResolvedValueOnce({});
      mockPrisma.agentRecord.update.mockResolvedValueOnce({});

      await service.recordThreat('client_1', 'POLICY_DENY', 'proj_1');

      expect(mockPrisma.threatEvent.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ agentRecordId: 'agent_1', reason: 'Triggered DENY on intent: POLICY_DENY' })
      }));
      
      // Score goes up by 20 for a default threat
      expect(mockPrisma.agentRecord.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'agent_1' },
        data: { currentRiskScore: 30 },
      }));

      // Should not be suspended
      expect(mockInventory.updateStatus).not.toHaveBeenCalled();
    });

    it('should record threat, update score, AND suspend if exceeding threshold', async () => {
      mockPrisma.agentIdentity.findUnique.mockResolvedValueOnce({ agents: [{ id: 'agent_1', status: 'ACTIVE', currentRiskScore: 90, role: { maxRiskScore: 100 } }] });
      mockPrisma.agentRecord.findMany.mockResolvedValueOnce([
        { id: 'agent_1', status: 'ACTIVE', currentRiskScore: 90, role: { maxRiskScore: 100 } }
      ]);
      mockPrisma.threatEvent.create.mockResolvedValueOnce({});
      mockPrisma.agentRecord.update.mockResolvedValueOnce({});

      await service.recordThreat('client_1', 'DLP_VIOLATION', 'proj_1');

      // 90 + 20 = 110 (> 100 threshold)
      expect(mockInventory.updateStatus).toHaveBeenCalledWith('agent_1', 'SUSPENDED', 'proj_1');
    });
  });
});
