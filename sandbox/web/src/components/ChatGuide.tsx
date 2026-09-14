import type { Health, ToolkitSummary } from '../api';

export function ChatGuide({
  health,
  toolkits,
  scope,
  onClearChat,
}: {
  health: Health | null;
  toolkits: ToolkitSummary[];
  scope: string[];
  onClearChat: () => void;
}) {
  if (!health) return <p className="muted pad">Waiting for the sandbox server…</p>;

  if (!health.llm.ok) {
    return (
      <div className="pad">
        <div className="banner banner--warn">
          <strong>{health.llm.message}</strong>
          <p>{health.llm.hint}</p>
        </div>
        <pre className="code">{`# sandbox/.env.local  (then restart: npm run sandbox)
GEMINI_API_KEY=...        # or
OPENROUTER_API_KEY=...`}</pre>
        <p className="muted">
          You can still test tools directly in the <strong>Tool runner</strong> tab. It doesn't use an LLM.
        </p>
      </div>
    );
  }

  const scoped = scope.length > 0 ? toolkits.filter((t) => scope.includes(t.id)) : toolkits;
  const suggestions = scoped
    .flatMap((t) => t.tools.slice(0, 2).map((tool) => ({ toolkit: t.displayName, text: tool.description })))
    .filter((s) => s.text)
    .slice(0, 6);

  return (
    <div className="pad chat-guide">
      <p>
        The chat bubble in the <strong>bottom-right</strong> is the real <code>@rnsk/bot</code>, talking to
        this sandbox instead of Runstack. It uses{' '}
        <strong>
          {health.llm.provider} / {health.llm.modelId}
        </strong>
        .
      </p>
      <p>
        Scope:{' '}
        {scope.length > 0 ? (
          scope.map((id) => (
            <code key={id} className="chip">
              {id}
            </code>
          ))
        ) : (
          <span className="muted">all toolkits</span>
        )}{' '}
        <button className="link small" onClick={onClearChat}>
          Clear chat
        </button>
      </p>

      {suggestions.length > 0 ? (
        <>
          <h3>Things to try</h3>
          <ul className="suggestions">
            {suggestions.map((s) => (
              <li key={`${s.toolkit}:${s.text}`}>
                <span className="muted small">{s.toolkit}</span> {s.text}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3>Debugging tips</h3>
      <ul className="muted small">
        <li>Free models are weaker at multi-step tool calling. If the chat misbehaves, run the tool in the Tool runner first.</li>
        <li>The bot runs searchTool → checkAuthentication → executeTool. Missing tokens show a Connect button that opens the Credentials panel.</li>
        <li>Saving a file in packages/toolkits restarts the server. The UI picks up the change on its own.</li>
      </ul>
    </div>
  );
}
