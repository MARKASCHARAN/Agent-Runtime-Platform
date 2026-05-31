from ..client import AgentRuntimeClient, ActionIntentPayload, RuntimeEnvelope

class OpenAISecureWrapper:
    """
    Wraps an OpenAI client to intercept and evaluate tool calls before they are sent back
    to the user's execution loop.
    """
    def __init__(self, openai_client, runtime_client: AgentRuntimeClient, policy_set_id: str, envelope: RuntimeEnvelope):
        self._client = openai_client
        self.runtime = runtime_client
        self.policy_set_id = policy_set_id
        self.envelope = envelope

    @property
    def chat(self):
        class ChatWrapper:
            def __init__(self, chat, outer):
                self._chat = chat
                self.outer = outer

            @property
            def completions(self):
                class CompletionsWrapper:
                    def __init__(self, completions, outer):
                        self._completions = completions
                        self.outer = outer

                    def create(self, *args, **kwargs):
                        # 1. Call OpenAI
                        response = self._completions.create(*args, **kwargs)
                        
                        # 2. Intercept tool calls
                        if response.choices and response.choices[0].message.tool_calls:
                            for tool_call in response.choices[0].message.tool_calls:
                                # Pre-execution security check
                                action = ActionIntentPayload(
                                    action_intent=tool_call.function.name,
                                    context={"arguments": tool_call.function.arguments}
                                )
                                decision = self.outer.runtime.evaluate_action(self.outer.policy_set_id, action, self.outer.envelope)
                                
                                if decision.get("outcome") == "DENY":
                                    raise PermissionError(f"Action {tool_call.function.name} blocked by runtime policy.")
                                elif decision.get("outcome") == "REQUIRE_APPROVAL":
                                    print(f"WARN: Action {tool_call.function.name} requires approval. Proceeding cautiously or pausing...")
                                
                                # Log event
                                self.outer.runtime.record_event("TOOL_CALL", {
                                    "tool": tool_call.function.name,
                                    "args": tool_call.function.arguments,
                                    "decision": decision
                                }, self.outer.envelope)

                        return response

                return CompletionsWrapper(self._chat.completions, self.outer)
        
        return ChatWrapper(self._client.chat, self)
