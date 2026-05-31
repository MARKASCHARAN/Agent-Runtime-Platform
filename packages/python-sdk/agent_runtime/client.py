from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

import httpx
from pydantic import BaseModel


class AgentRuntimeConfig(BaseModel):
    """
    Configuration for the Agent Runtime Client.

    Attributes:
        api_key (str): The API key for authentication.
        project_id (str): The ID of the project this agent belongs to.
        endpoint (str, optional): The base URL for the Agent Runtime API. Defaults to "http://localhost:3000".
        timeout_seconds (float, optional): The request timeout in seconds. Defaults to 5.0.
        retry_count (int, optional): The number of times to retry failed requests. Defaults to 2.
    """
    api_key: str
    project_id: str
    endpoint: str = "http://localhost:3000"
    timeout_seconds: float = 5.0
    retry_count: int = 2


class ActionIntentPayload(BaseModel):
    """
    Represents an action intent proposed by an autonomous agent.

    Attributes:
        action_intent (str): The name or identifier of the intended action (e.g., 'stripe:refunds').
        context (Dict[str, Any]): Additional context or parameters for the action.
    """
    action_intent: str
    context: Dict[str, Any]


class RuntimeEnvelope(BaseModel):
    """
    Metadata envelope for distributed tracing and context propagation.

    Attributes:
        actor_id (str): The unique identifier of the agent performing the action.
        correlation_id (Optional[str], optional): The trace ID for the entire execution flow.
        parent_trace_id (Optional[str], optional): The trace ID of the parent agent, if any.
        idempotency_key (Optional[str], optional): A unique key to prevent duplicate executions.
        schema_version (Optional[str], optional): The version of the envelope schema. Defaults to "v1".
    """
    actor_id: str
    correlation_id: Optional[str] = None
    parent_trace_id: Optional[str] = None
    idempotency_key: Optional[str] = None
    schema_version: Optional[str] = "v1"


class AgentRuntimeClient:
    """
    The official Python SDK for the Agent Runtime Platform.
    Provides Zero-Trust Security, Governance, and Threat Intelligence for autonomous AI systems.
    """

    def __init__(self, config: AgentRuntimeConfig):
        """
        Initializes the AgentRuntimeClient.

        Args:
            config (AgentRuntimeConfig): The configuration object for the client.
        """
        self.config = config
        self.headers = {
            "x-api-key": self.config.api_key,
            "x-project-id": self.config.project_id,
        }

    # ==========================================
    # INTERNAL HTTP HELPERS
    # ==========================================

    def _request(self, method: str, path: str, json_data: Optional[dict] = None) -> Any:
        url = f"{self.config.endpoint.rstrip('/')}/{path.lstrip('/')}"
        last_error: Optional[Exception] = None

        for attempt in range(self.config.retry_count + 1):
            try:
                response = httpx.request(
                    method=method,
                    url=url,
                    json=json_data,
                    headers=self.headers,
                    timeout=self.config.timeout_seconds,
                )
                response.raise_for_status()
                
                # Try to return JSON, fallback to raw text if not possible
                try:
                    return response.json()
                except Exception:
                    return response.text
            except httpx.HTTPError as error:
                last_error = error
                status_code = error.response.status_code if isinstance(error, httpx.HTTPStatusError) else None
                retryable = status_code is None or status_code >= 500
                if not retryable or attempt == self.config.retry_count:
                    raise
                time.sleep(0.25 * (attempt + 1))

        if last_error is not None:
            raise last_error
        raise RuntimeError("request failed")

    def _get(self, path: str) -> Any:
        return self._request("GET", path)

    def _post(self, path: str, json_data: Optional[dict] = None) -> Any:
        return self._request("POST", path, json_data)

    def _patch(self, path: str, json_data: Optional[dict] = None) -> Any:
        return self._request("PATCH", path, json_data)

    # ==========================================
    # CLIENT API (For Autonomous Agents)
    # ==========================================

    def evaluate_action(
        self,
        policy_set_id: str,
        action: ActionIntentPayload,
        envelope: RuntimeEnvelope,
        simulate: bool = False,
    ) -> dict:
        """
        Evaluates an action intent against a defined Policy Set before execution.

        Args:
            policy_set_id (str): The ID of the Policy Set to evaluate against.
            action (ActionIntentPayload): The action intent and context.
            envelope (RuntimeEnvelope): The runtime envelope containing actor and trace info.
            simulate (bool, optional): If True, evaluates the policy without recording an audit log. Defaults to False.

        Returns:
            dict: The evaluation outcome, trace, and decision ID.
        """
        payload = {
            "policySetId": policy_set_id,
            "actionIntent": action.action_intent,
            "context": action.context,
            "actorId": envelope.actor_id,
            "executionEventId": envelope.correlation_id,
            "traceId": envelope.idempotency_key,
            "simulate": simulate,
        }
        return self._post("policy/evaluate", payload)

    def record_event(self, event_type: str, payload: dict, envelope: RuntimeEnvelope) -> None:
        """
        Records an execution event for distributed tracing and replay forensics.

        Args:
            event_type (str): The type of event ('PROMPT', 'TOOL_CALL', 'MEMORY_MUTATION', 'ACTION').
            payload (dict): The payload or data associated with the event.
            envelope (RuntimeEnvelope): The runtime envelope.
        """
        if not envelope.correlation_id:
            return

        data = {
            "replayCorrelationId": envelope.correlation_id,
            "parentTraceId": envelope.parent_trace_id,
            "eventType": event_type,
            "payload": payload,
            "actorId": envelope.actor_id,
            "projectId": self.config.project_id,
            "traceId": envelope.idempotency_key,
        }
        self._post("replay/ingest", data)

    def start_distributed_trace(self, parent_agent_id: str, child_agent_id: str, correlation_id: str) -> RuntimeEnvelope:
        """
        Starts a distributed trace for a child agent spawned by a parent agent.

        Args:
            parent_agent_id (str): The actor ID of the parent agent.
            child_agent_id (str): The actor ID of the newly spawned child agent.
            correlation_id (str): The trace correlation ID.

        Returns:
            RuntimeEnvelope: A new envelope configured for the child agent.
        """
        return RuntimeEnvelope(
            actor_id=child_agent_id,
            correlation_id=correlation_id,
            parent_trace_id=parent_agent_id
        )

    def verify_tool(self, tool_identity: str, schema_hash: str) -> dict:
        """
        Cryptographically verifies an MCP tool against the enterprise Trust Registry.

        Args:
            tool_identity (str): The identifier of the tool.
            schema_hash (str): The hash of the tool's schema/source.

        Returns:
            dict: A dictionary containing 'allowed' (bool) and 'reason' (str).
        """
        payload = {
            "toolIdentity": tool_identity,
            "schemaHash": schema_hash,
        }
        return self._post("mcp-trust/verify", payload)

    def record_memory_mutation(
        self,
        mutation_type: str,
        key: str,
        source_metadata: dict,
        previous_value: Optional[str] = None,
        new_value: Optional[str] = None,
        envelope: Optional[RuntimeEnvelope] = None,
    ) -> None:
        """
        Records a state mutation in the agent's memory for observability and rollback capability.

        Args:
            mutation_type (str): The type of mutation (e.g., 'UPDATE', 'DELETE').
            key (str): The memory key being mutated.
            source_metadata (dict): Metadata about the source of the mutation.
            previous_value (str, optional): The value before mutation.
            new_value (str, optional): The value after mutation.
            envelope (RuntimeEnvelope, optional): The runtime envelope.
        """
        actor_id = envelope.actor_id if envelope else "unknown"
        payload = {
            "agentId": actor_id,
            "mutationType": mutation_type,
            "key": key,
            "previousValue": previous_value,
            "newValue": new_value,
            "sourceMetadata": source_metadata,
            "projectId": self.config.project_id,
        }
        self._post("memory/mutate", payload)

    # --- V3 Enterprise Resilience ---

    def verify_prompt(self, prompt: str) -> dict:
        """
        Scans a prompt for malicious intent, jailbreaks, or prompt injections.

        Args:
            prompt (str): The prompt text to verify.

        Returns:
            dict: A dictionary containing 'safe' (bool) and optionally 'reason' (str).
        """
        return self._post("threat-intel/verify-prompt", {"prompt": prompt})

    def create_checkpoint(self, state: dict, envelope: RuntimeEnvelope) -> dict:
        """
        Creates a rollback checkpoint of the agent's current memory state.

        Args:
            state (dict): The complete current state to checkpoint.
            envelope (RuntimeEnvelope): The runtime envelope.

        Returns:
            dict: An object containing the checkpoint 'id'.
        """
        return self._post("memory/checkpoint", {
            "agentId": envelope.actor_id,
            "state": state
        })

    def rollback(self, checkpoint_id: str) -> dict:
        """
        Rolls the agent's memory back to a specific checkpoint.

        Args:
            checkpoint_id (str): The ID of the checkpoint to restore.

        Returns:
            dict: The restored state.
        """
        return self._post(f"memory/rollback/{checkpoint_id}")

    def request_approval(self, policy_set_id: str, action_intent: str, context: dict, envelope: RuntimeEnvelope) -> dict:
        """
        Manually requests a Human-in-the-loop approval for a sensitive action.

        Args:
            policy_set_id (str): The relevant Policy Set ID.
            action_intent (str): The intent of the action.
            context (dict): The context of the action.
            envelope (RuntimeEnvelope): The runtime envelope.

        Returns:
            dict: The evaluation decision object indicating REQUIRE_APPROVAL.
        """
        return self._post("policy/decisions/request", {
            "policySetId": policy_set_id,
            "actionIntent": action_intent,
            "context": context,
            "actorId": envelope.actor_id
        })

    # --- V4 Identity & Access ---

    def request_access(self, tool: str, scope: str, envelope: RuntimeEnvelope) -> dict:
        """
        Requests an ephemeral Just-In-Time (JIT) credential for a specific tool and scope.

        Args:
            tool (str): The tool identifier (e.g., 'stripe').
            scope (str): The required scope (e.g., 'refunds').
            envelope (RuntimeEnvelope): The runtime envelope.

        Returns:
            dict: An object containing the ephemeral 'token' and 'expiresAt' timestamp.
        """
        return self._post("identity/access", {
            "tool": tool,
            "scope": scope,
            "actorId": envelope.actor_id
        })


    # ==========================================
    # ADMIN API (For Dashboard & CI/CD)
    # ==========================================

    def get_agents(self) -> List[dict]:
        """Fetches all registered agents for the current project."""
        return self._get("inventory/agents")

    def suspend_agent(self, agent_id: str) -> None:
        """Suspends an agent globally (Kill Switch)."""
        self._patch(f"inventory/agents/{agent_id}/suspend")

    def activate_agent(self, agent_id: str) -> None:
        """Activates a previously suspended agent."""
        self._patch(f"inventory/agents/{agent_id}/activate")

    def register_identity(self, name: str, description: Optional[str] = None, role_id: Optional[str] = None) -> dict:
        """Registers a new Agent Identity."""
        payload = {"name": name}
        if description: payload["description"] = description
        if role_id: payload["roleId"] = role_id
        return self._post("identity/register", payload)

    def get_policy_sets(self) -> List[dict]:
        """Fetches all Policy Sets for the current project."""
        return self._get("policy/sets")

    def get_pending_approvals(self, policy_set_id: str) -> List[dict]:
        """Fetches all pending Human-in-the-loop approvals for a given Policy Set."""
        return self._get(f"policy/sets/{policy_set_id}/approvals")

    def resolve_approval(self, decision_id: str, action: str) -> None:
        """
        Resolves a pending approval.
        
        Args:
            decision_id (str): The ID of the decision to resolve.
            action (str): Either 'APPROVE' or 'REJECT'.
        """
        self._post(f"policy/decisions/{decision_id}/resolve", {"action": action})

    def get_threat_leaderboard(self) -> List[dict]:
        """Fetches the threat intelligence leaderboard (most blocked agents)."""
        return self._get("threat-intel/leaderboard")

    def get_dlp_violations(self) -> List[dict]:
        """Fetches all recorded Data Loss Prevention (DLP) violations."""
        return self._get("privacy/dlp/violations")

    def get_mcp_registry(self) -> List[dict]:
        """Fetches all verified tools from the MCP Trust Registry."""
        return self._get("mcp/registry")

    def register_mcp_tool(self, name: str, publisher: str, schema_hash: str) -> None:
        """Registers a new tool hash in the MCP Trust Registry."""
        self._post("mcp/registry", {
            "name": name,
            "publisher": publisher,
            "schemaHash": schema_hash
        })

    def revoke_mcp_tool(self, registry_id: str) -> None:
        """Revokes trust for a previously verified MCP tool."""
        self._patch(f"mcp/registry/{registry_id}/revoke")
