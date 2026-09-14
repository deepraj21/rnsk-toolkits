import { useState } from 'react';

import type { ToolkitSummary } from '../api';

function StatusDot({ toolkit }: { toolkit: ToolkitSummary }) {
  if (toolkit.authType === 'none') return <span className="dot dot--ok" title="No auth needed" />;
  return toolkit.status.ready ? (
    <span className="dot dot--ok" title="Credentials set" />
  ) : (
    <span className="dot dot--warn" title={toolkit.status.hint} />
  );
}

export function ToolkitScopePicker({
  toolkits,
  scope,
  selectedId,
  onScopeChange,
  onSelect,
}: {
  toolkits: ToolkitSummary[];
  scope: string[];
  selectedId: string | null;
  onScopeChange: (ids: string[]) => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = toolkits.filter(
    (t) => !q || t.id.includes(q) || t.displayName.toLowerCase().includes(q),
  );

  const toggle = (id: string) =>
    onScopeChange(scope.includes(id) ? scope.filter((s) => s !== id) : [...scope, id]);

  return (
    <aside className="panel sidebar">
      <div className="sidebar-head">
        <h2>Toolkits</h2>
        <p className="muted">Tick toolkits to scope the bot and Tool runner.</p>
        <input
          className="input"
          placeholder="Filter toolkits…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <button
        className={scope.length === 0 ? 'scope-all scope-all--active' : 'scope-all'}
        onClick={() => onScopeChange([])}
      >
        {scope.length === 0 ? '✓ All toolkits in scope' : `Scope: ${scope.length} selected · reset to all`}
      </button>

      <ul className="toolkit-list">
        {visible.map((t) => (
          <li
            key={t.id}
            className={t.id === selectedId ? 'toolkit-row toolkit-row--selected' : 'toolkit-row'}
          >
            <input
              type="checkbox"
              aria-label={`Scope to ${t.displayName}`}
              checked={scope.includes(t.id)}
              onChange={() => toggle(t.id)}
            />
            <button className="toolkit-row-main" onClick={() => onSelect(t.id)}>
              <img src={t.icon.dataUri} alt="" className="toolkit-icon" />
              <span className="toolkit-name">{t.displayName}</span>
              <span className="muted small">{t.toolCount}</span>
              <StatusDot toolkit={t} />
            </button>
            <button
              className="link small"
              title="Scope to only this toolkit"
              onClick={() => {
                onScopeChange([t.id]);
                onSelect(t.id);
              }}
            >
              only
            </button>
          </li>
        ))}
        {visible.length === 0 ? <li className="muted small pad">No toolkits match.</li> : null}
      </ul>
    </aside>
  );
}
