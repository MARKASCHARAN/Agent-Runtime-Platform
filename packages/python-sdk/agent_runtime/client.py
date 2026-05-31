from __future__ import annotations

import time
from typing import Any, Dict, Optional

import httpx
from pydantic import BaseModel


class AgentRuntimeConfig(BaseModel):
    api_key: str
    project_id: str
    endpoint: str = "http://localhost:3000"
    timeout_seconds: float = 5.0
    retry_count: int = 2


class ActionIntentPayload(BaseModel):
    action_intent: str
    context: Dict[str, Any]


class RuntimeEnvelope(BaseModel):
    actor_id: str
    correlation_id: Optional[str] = None
    idempotency_key: Optional[str] = None
    schema_version: Optional[str] = "v1"


class AgentRuntimeClient:
    def __init__(self, config: AgentRuntimeConfig):
        self.config = config
        self.headers = {
            "x-api-key": self.config.api_key,
            "x-project-id": self.config.project_id,
        }

    def _post(self, path: str, json_data: dict) -> dict:
        url = f"{self.config.endpoint.rstrip('/')}/{path.lstrip('/')}"
        last_error: Optional[Exception] = None

        for attempt in range(self.config.retry_count + 1):
            try:
                response = httpx.post(
                    url,
                    json=json_data,
                    headers=self.headers,
                    timeout=self.config.timeout_seconds,
                )
                response.raise_for_status()
                return response.json()
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

    def evaluate_action(
        self,
        policy_set_id: str,
        action: ActionIntentPayload,
        envelope: RuntimeEnvelope,
        simulate: bool = False,
    ) -> dict:
        payload = {
            "policySetId": policy_set_id,
            "actionIntent": action.action_intent,
            "context": action.context,
            "executionEventId": envelope.correlation_id,
            "traceId": envelope.idempotency_key,
            "simulate": simulate,
        }
        return self._post("policy/evaluate", payload)

    def record_event(self, event_type: str, payload: dict, envelope: RuntimeEnvelope) -> None:
        if not envelope.correlation_id:
            return

        data = {
            "replayCorrelationId": envelope.correlation_id,
            "eventType": event_type,
            "payload": payload,
            "actorId": envelope.actor_id,
            "projectId": self.config.project_id,
            "traceId": envelope.idempotency_key,
        }
        self._post("replay/ingest", data)

    def verify_tool(self, tool_identity: str, schema_hash: str) -> dict:
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
