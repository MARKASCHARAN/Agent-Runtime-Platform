from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import httpx

class AgentRuntimeConfig(BaseModel):
    api_key: str
    project_id: str
    endpoint: str = "http://localhost:3000"

class ActionIntentPayload(BaseModel):
    action_intent: str
    context: Dict[str, Any]

class RuntimeEnvelope(BaseModel):
    actor_id: str
    correlation_id: Optional[str] = None

class AgentRuntimeClient:
    def __init__(self, config: AgentRuntimeConfig):
        self.config = config
        self.headers = {"Authorization": f"Bearer {self.config.api_key}"}
        
    def _post(self, path: str, json_data: dict) -> dict:
        url = f"{self.config.endpoint.rstrip('/')}/{path.lstrip('/')}"
        response = httpx.post(url, json=json_data, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def evaluate_action(self, policy_set_id: str, action: ActionIntentPayload, envelope: RuntimeEnvelope) -> dict:
        """Evaluate an action intent against the runtime policy before executing it."""
        payload = {
            "policySetId": policy_set_id,
            "actionIntent": action.action_intent,
            "context": action.context,
            "executionEventId": envelope.correlation_id,
        }
        return self._post("policy/evaluate", payload)

    def record_event(self, event_type: str, payload: dict, envelope: RuntimeEnvelope) -> None:
        """Ingest an execution event for the Attack Replay Engine."""
        if not envelope.correlation_id:
            return
        data = {
            "replayCorrelationId": envelope.correlation_id,
            "eventType": event_type,
            "payload": payload,
            "actorId": envelope.actor_id,
        }
        self._post("replay/ingest", data)

    def verify_tool(self, tool_identity: str, schema_hash: str) -> dict:
        """Verify an MCP tool's trust status and schema hash before execution."""
        payload = {
            "toolIdentity": tool_identity,
            "schemaHash": schema_hash,
        }
        return self._post("mcp-trust/verify", payload)

    def record_memory_mutation(self, mutation_type: str, key: str, source_metadata: dict, 
                               previous_value: Optional[str] = None, new_value: Optional[str] = None, 
                               envelope: Optional[RuntimeEnvelope] = None) -> None:
        """Record a memory mutation to the integrity ledger."""
        actor_id = envelope.actor_id if envelope else "unknown"
        payload = {
            "agentId": actor_id,
            "mutationType": mutation_type,
            "key": key,
            "previousValue": previous_value,
            "newValue": new_value,
            "sourceMetadata": source_metadata,
        }
        self._post("memory/mutate", payload)
