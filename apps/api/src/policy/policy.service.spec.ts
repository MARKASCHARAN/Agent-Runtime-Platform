import { PolicyService } from './policy.service';

const mockPrisma = {
  policySet: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  policyDecision: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockEvents = {
  emitApprovalRequired: jest.fn(),
  emitPolicyIntervention: jest.fn(),
};

describe('PolicyService', () => {
  let service: PolicyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PolicyService(mockPrisma as never, mockEvents as never);
  });

  it('evaluates dynamic deny rule and persists decision', async () => {
    mockPrisma.policySet.findUnique.mockResolvedValue({
      id: 'set-1',
      projectId: 'proj-1',
      rules: {
        combine: 'deny-overrides',
        defaultOutcome: 'ALLOW',
        rules: [
          {
            id: 'rule-1',
            effect: 'DENY',
            actionIntent: 'DB_WRITE',
            conditions: [
              {
                field: 'resource.classification',
                operator: 'eq',
                value: 'sensitive',
              },
            ],
          },
        ],
      },
    });

    mockPrisma.policyDecision.create.mockResolvedValue({
      id: 'decision-1',
      outcome: 'DENY',
    });

    const result = await service.evaluateAction(
      {
        policySetId: 'set-1',
        actionIntent: 'DB_WRITE',
        context: {
          resource: {
            classification: 'sensitive',
          },
        },
      },
      'proj-1',
    );

    expect(mockPrisma.policyDecision.create).toHaveBeenCalled();
    expect(result.outcome).toBe('DENY');
    expect(mockEvents.emitPolicyIntervention).toHaveBeenCalledWith(result);
  });

  it('supports simulation mode without persisting decision', async () => {
    mockPrisma.policySet.findUnique.mockResolvedValue({
      id: 'set-1',
      projectId: 'proj-1',
      rules: {
        combine: 'first-match',
        defaultOutcome: 'ALLOW',
        rules: [
          {
            id: 'rule-2',
            effect: 'REQUIRE_APPROVAL',
            actionIntent: 'PAYMENT',
            conditions: [{ field: 'amount', operator: 'gte', value: 1000 }],
          },
        ],
      },
    });

    const result = await service.evaluateAction(
      {
        policySetId: 'set-1',
        actionIntent: 'PAYMENT',
        context: { amount: 1500 },
        simulate: true,
      },
      'proj-1',
    );

    expect(result.simulated).toBe(true);
    expect(result.outcome).toBe('REQUIRE_APPROVAL');
    expect(mockPrisma.policyDecision.create).not.toHaveBeenCalled();
    expect(mockEvents.emitPolicyIntervention).not.toHaveBeenCalled();
  });
});
