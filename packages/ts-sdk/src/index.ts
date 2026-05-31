import axios from 'axios';

export interface AgentRuntimeConfig {
  apiKey: string;
  projectId: string;
  endpoint?: string;
}

export interface ActionIntentPayload {
  actionIntent: string;
  context: any;
}

export interface RuntimeEnvelope {
  correlationId?: string;
  actorId: string;
}

export class AgentRuntimeClient {
  private endpoint: string;
  private apiKey: string;
  private projectId: string;

  constructor(config: AgentRuntimeConfig) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.endpoint = config.endpoint || 'http://localhost:3000';
  }

  /**
   * Evaluate an action intent against the runtime policy before executing it.
   */
  async evaluateAction(
    policySetId: string,
    action: ActionIntentPayload,
    envelope: RuntimeEnvelope
  ): Promise<{ outcome: string }> {
    const res = await axios.post(
      `${this.endpoint}/policy/evaluate`,
      {
        policySetId,
        actionIntent: action.actionIntent,
        context: action.context,
        executionEventId: envelope.correlationId,
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    return res.data;
  }

  /**
   * Ingest an execution event for the Attack Replay Engine.
   */
  async recordEvent(
    eventType: 'PROMPT' | 'TOOL_CALL' | 'MEMORY_MUTATION' | 'ACTION',
    payload: any,
    envelope: RuntimeEnvelope
  ): Promise<void> {
    if (!envelope.correlationId) return;

    await axios.post(
      `${this.endpoint}/replay/ingest`,
      {
        replayCorrelationId: envelope.correlationId,
        eventType,
        payload,
        actorId: envelope.actorId,
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
  }

  /**
   * Verify an MCP tool's trust status and schema hash before execution.
   */
  async verifyTool(toolIdentity: string, schemaHash: string): Promise<{ allowed: boolean; reason: string }> {
    const res = await axios.post(
      `${this.endpoint}/mcp-trust/verify`,
      { toolIdentity, schemaHash },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    return res.data;
  }

  /**
   * Record a memory mutation to the integrity ledger.
   */
  async recordMemoryMutation(mutation: {
    mutationType: string;
    key: string;
    previousValue?: string;
    newValue?: string;
    sourceMetadata: any;
  }, envelope: RuntimeEnvelope): Promise<void> {
    await axios.post(
      `${this.endpoint}/memory/mutate`,
      {
        ...mutation,
        agentId: envelope.actorId,
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
  }
}
