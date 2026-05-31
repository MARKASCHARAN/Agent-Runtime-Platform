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
  parentTraceId?: string;
  actorId: string;
  idempotencyKey?: string;
  schemaVersion?: string;
}

import { ContextManager } from './context';
export { ContextManager };

/**
 * The official TypeScript SDK for the Agent Runtime Platform.
 * Provides Zero-Trust Security, Governance, and Threat Intelligence for autonomous AI systems.
 */
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

  // ==========================================
  // CLIENT API (For Autonomous Agents)
  // ==========================================

  /**
   * Evaluates an action intent against a defined Policy Set before execution.
   * 
   * @param policySetId The ID of the Policy Set to evaluate against.
   * @param action The action intent and context.
   * @param envelope The runtime envelope containing actor and trace info.
   * @param options Optional settings, e.g., simulating the evaluation.
   * @returns The evaluation outcome and decision ID.
   */
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
      actorId: envelope.actorId,
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

    // Apply trace compression to prevent crashing the backend DB with huge logs
    const compressedPayload = ContextManager.compress(payload);

    await this.postWithRetry('/replay/ingest', {
      replayCorrelationId: envelope.correlationId,
      parentTraceId: envelope.parentTraceId,
      eventType,
      payload: compressedPayload,
      actorId: envelope.actorId,
      projectId: this.projectId,
      traceId: envelope.idempotencyKey,
    });
  }

  startDistributedTrace(parentAgentId: string, childAgentId: string, correlationId: string): RuntimeEnvelope {
    // Generates a new envelope for the child agent linked to the parent's trace
    return {
      actorId: childAgentId,
      correlationId: correlationId,
      parentTraceId: parentAgentId, 
    };
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

  // --- V3 Enterprise Resilience ---

  async verifyPrompt(prompt: string): Promise<{ safe: boolean; reason?: string }> {
    return this.postWithRetry('/threat-intel/verify-prompt', { prompt });
  }

  async createCheckpoint(state: Record<string, unknown>, envelope: RuntimeEnvelope): Promise<{ id: string }> {
    return this.postWithRetry('/memory/checkpoint', {
      agentId: envelope.actorId,
      state
    });
  }

  async rollback(checkpointId: string): Promise<Record<string, unknown>> {
    return this.postWithRetry(`/memory/rollback/${checkpointId}`);
  }

  async requestApproval(
    policySetId: string,
    actionIntent: string,
    context: Record<string, unknown>,
    envelope: RuntimeEnvelope
  ): Promise<{ outcome: string }> {
    return this.postWithRetry('/policy/decisions/request', {
      policySetId,
      actionIntent,
      context,
      actorId: envelope.actorId
    });
  }

  // --- V4 Identity & Access ---
  
  /**
   * Requests an ephemeral Just-In-Time (JIT) credential for a specific tool and scope.
   * 
   * @param tool The tool identifier (e.g., 'stripe').
   * @param scope The required scope (e.g., 'refunds').
   * @param envelope The runtime envelope.
   * @returns An ephemeral token string and its expiration timestamp.
   */
  async requestAccess(tool: string, scope: string, envelope: RuntimeEnvelope): Promise<{ token: string, expiresAt: string }> {
    return this.postWithRetry('/identity/access', {
      tool,
      scope,
      actorId: envelope.actorId,
    });
  }

  // ==========================================
  // ADMIN API (For Dashboard & CI/CD)
  // ==========================================

  // --- Agent Inventory ---
  async getAgents<T = unknown>(): Promise<T[]> {
    return this.getWithRetry<T[]>('/inventory/agents');
  }

  async suspendAgent(agentId: string): Promise<void> {
    await this.patchWithRetry(`/inventory/agents/${agentId}/suspend`);
  }

  async activateAgent(agentId: string): Promise<void> {
    await this.patchWithRetry(`/inventory/agents/${agentId}/activate`);
  }

  async registerIdentity(data: { name: string; description?: string; roleId?: string }): Promise<{ id: string }> {
    return this.postWithRetry('/identity/register', data);
  }

  // --- Policy & Approvals ---
  async getPolicySets<T = unknown>(): Promise<T[]> {
    return this.getWithRetry<T[]>('/policy/sets');
  }

  async getPendingApprovals<T = unknown>(policySetId: string): Promise<T[]> {
    return this.getWithRetry<T[]>(`/policy/sets/${policySetId}/approvals`);
  }

  async resolveApproval(decisionId: string, action: 'APPROVE' | 'REJECT'): Promise<void> {
    await this.postWithRetry(`/policy/decisions/${decisionId}/resolve`, { action });
  }

  // --- Threat Intel & DLP ---
  async getThreatLeaderboard<T = unknown>(): Promise<T[]> {
    return this.getWithRetry<T[]>('/threat-intel/leaderboard');
  }

  async getDlpViolations<T = unknown>(): Promise<T[]> {
    return this.getWithRetry<T[]>('/privacy/dlp/violations');
  }

  // --- MCP Trust Registry ---
  async getMcpRegistry<T = unknown>(): Promise<T[]> {
    return this.getWithRetry<T[]>('/mcp/registry');
  }

  async registerMcpTool(data: { name: string; publisher: string; schemaHash: string }): Promise<void> {
    await this.postWithRetry('/mcp/registry', data);
  }

  async revokeMcpTool(registryId: string): Promise<void> {
    await this.patchWithRetry(`/mcp/registry/${registryId}/revoke`);
  }

  // ==========================================
  // INTERNAL HTTP HELPERS
  // ==========================================

  private async getWithRetry<T = unknown>(path: string): Promise<T> {
    return this.requestWithRetry<T>('get', path);
  }

  private async postWithRetry<T = unknown>(path: string, payload?: Record<string, unknown>): Promise<T> {
    return this.requestWithRetry<T>('post', path, payload);
  }

  private async patchWithRetry<T = unknown>(path: string, payload?: Record<string, unknown>): Promise<T> {
    return this.requestWithRetry<T>('patch', path, payload);
  }

  private async requestWithRetry<T>(
    method: 'get' | 'post' | 'patch',
    path: string,
    payload?: Record<string, unknown>
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retryCount; attempt += 1) {
      try {
        const response = await this.httpClient.request<T>({
          method,
          url: path,
          data: payload,
        });
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
