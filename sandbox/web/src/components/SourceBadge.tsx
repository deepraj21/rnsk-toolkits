import type { Health } from '../api';

export function SourceBadge({ health, offline }: { health: Health | null; offline: boolean }) {
  if (offline) {
    return <span className="pill pill--warn">Server restarting… (or run `npm run sandbox`)</span>;
  }
  if (!health) return <span className="pill">Connecting…</span>;

  const { toolkits, llm } = health;
  return (
    <div className="badges">
      <span
        className={toolkits.source === 'local' ? 'pill pill--local' : 'pill pill--npm'}
        title={
          toolkits.source === 'local'
            ? 'Running packages/toolkits/src — edits restart the server'
            : 'Running the published npm package (npm run sandbox:npm)'
        }
      >
        {toolkits.source === 'local' ? 'LOCAL source' : 'NPM package'} · v{toolkits.version}
      </span>
      <span className="pill">
        {toolkits.count} toolkits · {toolkits.toolCount} tools
      </span>
      <span className={llm.ok ? 'pill' : 'pill pill--warn'} title={llm.ok ? llm.note : llm.hint}>
        {llm.ok ? `LLM ${llm.provider} / ${llm.modelId}` : 'LLM off'}
      </span>
    </div>
  );
}
