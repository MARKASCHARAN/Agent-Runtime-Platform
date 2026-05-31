from typing import Any, Dict
from ..client import AgentRuntimeClient, ActionIntentPayload, RuntimeEnvelope

class ToolSecurityNode:
    """
    A LangGraph node wrapper that performs a pre-execution security check and MCP trust verification.
    """
    def __init__(self, tool_func, runtime_client: AgentRuntimeClient, policy_set_id: str, tool_identity: str, schema_hash: str):
        self.tool_func = tool_func
        self.runtime = runtime_client
        self.policy_set_id = policy_set_id
        self.tool_identity = tool_identity
        self.schema_hash = schema_hash

    def __call__(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Verify Tool Trust (MCP)
        trust_res = self.runtime.verify_tool(self.tool_identity, self.schema_hash)
        if not trust_res.get("allowed", False):
            raise SecurityError(f"Tool {self.tool_identity} failed trust verification: {trust_res.get('reason')}")

        # 2. Evaluate Policy
        # Assuming state contains the tool arguments as 'tool_args' for this demo
        envelope = RuntimeEnvelope(actor_id=state.get("actor_id", "langgraph-agent"))
        action = ActionIntentPayload(action_intent=self.tool_identity, context={"args": state.get("tool_args", {})})
        
        decision = self.runtime.evaluate_action(self.policy_set_id, action, envelope)
        if decision.get("outcome") == "DENY":
            raise PermissionError(f"Tool {self.tool_identity} execution blocked by policy.")

        # 3. Execute underlying tool
        result = self.tool_func(state)

        # 4. Record Execution Event
        self.runtime.record_event("ACTION", {
            "tool": self.tool_identity,
            "result": result
        }, envelope)

        return result

class SecurityError(Exception):
    pass
