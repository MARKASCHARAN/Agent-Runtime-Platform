import { AgentRuntimeClient, ActionIntentPayload, RuntimeEnvelope } from './index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.create.mockReturnValue(mockedAxios as any);

describe('AgentRuntimeClient', () => {
  let client: AgentRuntimeClient;
  const mockConfig = {
    projectId: 'proj_123',
    apiKey: 'secret_key',
    baseUrl: 'http://localhost:3000',
  };

  beforeEach(() => {
    client = new AgentRuntimeClient(mockConfig);
    jest.clearAllMocks();
  });

  it('should initialize with correct configuration', () => {
    expect(client).toBeInstanceOf(AgentRuntimeClient);
  });

  describe('evaluateAction', () => {
    it('should call the evaluate endpoint with correct payload', async () => {
      const mockResponse = { data: { outcome: 'ALLOW' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const action: ActionIntentPayload = {
        actionIntent: 'transfer_funds',
        context: { toolHash: 'abc123hash' },
      };
      const envelope: RuntimeEnvelope = {
        actorId: 'agent_01',
      };

      const result = await client.evaluateAction('policy_1', action, envelope);

      expect(result).toEqual({ outcome: 'ALLOW' });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/policy/evaluate',
        {
          policySetId: 'policy_1',
          actionIntent: 'transfer_funds',
          context: { toolHash: 'abc123hash' },
          actorId: 'agent_01',
          executionEventId: undefined,
          simulate: undefined,
          traceId: undefined,
        }
      );
    });

    it('should propagate errors from the API', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      await expect(client.evaluateAction('test', { actionIntent: 'test', context: {} }, { actorId: '1' }))
        .rejects
        .toThrow('Network error');
    });
  });


});

