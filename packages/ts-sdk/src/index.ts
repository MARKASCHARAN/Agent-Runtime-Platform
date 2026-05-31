import axios, { AxiosError, AxiosInstance } from 'axios';

export interface AgentRuntimeConfig {
  apiKey: string;
  projectId: string;
  endpoint?: string;
  requestTimeoutMs?: number;
  retryCount?: number;
}

export interface ActionIntentPayload {
  actionIntent: string;
  context: Record<string, unknown>;
}

export interface RuntimeEnvelope {
  correlationId?: string;
  actorId: string;
  idempotencyKey?: string;
  schemaVersion?: string;
}

export class AgentRuntimeClient {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly retryCount: number;
  private readonly httpClient: AxiosInstance;

  constructor(config: AgentRuntimeConfig) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.endpoint = config.endpoint || 'http://localhost:3000';
    this.retryCount = config.retryCount ?? 2;
    this.httpClient = axios.create({
      baseURL: this.endpoint,
      timeout: config.requestTimeoutMs ?? 5000,
      headers: {
        'x-api-key': this.apiKey,
        'x-project-id': this.projectId,
      },
    });
  }

  async evaluateAction(
    policySetId: string,
    action: ActionIntentPayload,
    envelope: RuntimeEnvelope,
    options?: { simulate?: boolean },
  ): Promise<{ outcome: string }> {
    const res = await this.postWithRetry<{ outcome: string }>('/policy/evaluate', {
      policySetId,
      actionIntent: action.actionIntent,
      context: action.context,
      executionEventId: envelope.correlationId,
      traceId: envelope.idempotencyKey,
      simulate: options?.simulate,
    });
    return res;
  }

  async recordEvent(
    eventType: 'PROMPT' | 'TOOL_CALL' | 'MEMORY_MUTATION' | 'ACTION',
    payload: Record<string, unknown>,
    envelope: RuntimeEnvelope,
  ): Promise<void> {
    if (!envelope.correlationId) return;

    await this.postWithRetry('/replay/ingest', {
      replayCorrelationId: envelope.correlationId,
      eventType,
      payload,
      actorId: envelope.actorId,
      projectId: this.projectId,
      traceId: envelope.idempotencyKey,
    });
  }

  async verifyTool(toolIdentity: string, schemaHash: string): Promise<{ allowed: boolean; reason: string }> {
    return this.postWithRetry('/mcp-trust/verify', { toolIdentity, schemaHash });
  }

  async recordMemoryMutation(
    mutation: {
      mutationType: string;
      key: string;
      previousValue?: string;
      newValue?: string;
      sourceMetadata: Record<string, unknown>;
    },
    envelope: RuntimeEnvelope,
  ): Promise<void> {
    await this.postWithRetry('/memory/mutate', {
      ...mutation,
      projectId: this.projectId,
      agentId: envelope.actorId,
    });
  }

  private async postWithRetry<T = unknown>(path: string, payload: Record<string, unknown>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retryCount; attempt += 1) {
      try {
        const response = await this.httpClient.post<T>(path, payload);
        return response.data;
      } catch (error) {
        lastError = error;
        const isRetryable =
          error instanceof AxiosError &&
          (error.response?.status === undefined || error.response.status >= 500 || error.code === 'ECONNABORTED');

        if (!isRetryable || attempt === this.retryCount) {
          throw error;
        }
      }
    }

    throw lastError;
  }
}
