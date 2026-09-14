import { useEffect, useRef, useState } from 'react';

import { api, type CredentialField, type ToolkitSummary } from '../api';

function CredentialRow({
  field,
  onChanged,
}: {
  field: CredentialField;
  onChanged: () => void;
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setValue('');
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="cred-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) void run(() => api.setCredential(field.kind, field.name, value));
      }}
    >
      <label className="cred-label">
        <code>{field.name}</code>
        {field.source === 'env' ? <span className="pill pill--ok">from .env.local</span> : null}
        {field.source === 'session' ? <span className="pill pill--ok">pasted</span> : null}
        {!field.source ? <span className="pill pill--warn">missing</span> : null}
      </label>
      {field.description ? <p className="muted small">{field.description}</p> : null}
      <div className="cred-inputs">
        <input
          className="input"
          type="password"
          autoComplete="off"
          placeholder={field.source ? 'Replace value…' : 'Paste value…'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="btn" disabled={busy || !value.trim()} type="submit">
          Save
        </button>
        {field.source === 'session' ? (
          <button
            className="btn btn--ghost"
            type="button"
            disabled={busy}
            onClick={() => void run(() => api.clearCredential(field.kind, field.name))}
          >
            Clear
          </button>
        ) : null}
      </div>
      {error ? <p className="error small">{error}</p> : null}
    </form>
  );
}

export function ToolkitDetail({
  toolkit,
  connectRequested,
  inScope,
  onCredentialsChanged,
  onScopeOnly,
  onRunTool,
}: {
  toolkit: ToolkitSummary | null;
  connectRequested: boolean;
  inScope: boolean;
  onCredentialsChanged: () => void;
  onScopeOnly: (id: string) => void;
  onRunTool: (toolName: string) => void;
}) {
  const [query, setQuery] = useState('');
  const credsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (connectRequested) credsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [connectRequested, toolkit?.id]);

  if (!toolkit) {
    return (
      <aside className="panel detail">
        <p className="muted pad">Select a toolkit to see its tools and credentials.</p>
      </aside>
    );
  }

  const q = query.trim().toLowerCase();
  const tools = toolkit.tools.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
  );

  return (
    <aside className="panel detail">
      <div className="detail-head">
        <img src={toolkit.icon.dataUri} alt="" className="toolkit-icon toolkit-icon--lg" />
        <div>
          <h2>{toolkit.displayName}</h2>
          <p className="muted small">
            <code>{toolkit.id}</code> · {toolkit.category} · auth: {toolkit.authType}
          </p>
        </div>
      </div>
      <p>{toolkit.shortDescription}</p>
      {!inScope ? (
        <p className="banner banner--info small">
          Not in the current scope.{' '}
          <button className="link" onClick={() => onScopeOnly(toolkit.id)}>
            Scope to {toolkit.displayName}
          </button>
        </p>
      ) : null}

      {toolkit.credentials.length > 0 ? (
        <section
          ref={credsRef}
          className={connectRequested ? 'creds creds--highlight' : 'creds'}
        >
          <h3>Credentials</h3>
          {connectRequested ? (
            <p className="banner banner--info small">
              The bot asked to connect {toolkit.displayName}. Paste a token below, then tell the bot
              “connected” to continue.
            </p>
          ) : null}
          {toolkit.credentials.map((field) => (
            <CredentialRow key={`${field.kind}:${field.name}`} field={field} onChanged={onCredentialsChanged} />
          ))}
          <p className="muted small">Kept in server memory only. Restarting the server clears pasted values.</p>
        </section>
      ) : (
        <p className="muted small">No credentials needed.</p>
      )}

      <section>
        <h3>
          Tools <span className="muted small">({toolkit.tools.length})</span>
        </h3>
        {toolkit.tools.length > 8 ? (
          <input
            className="input"
            placeholder="Filter tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        ) : null}
        <ul className="tool-list">
          {tools.map((tool) => (
            <li key={tool.name} className="tool-row">
              <div>
                <code>{tool.name}</code> <span className={`scope scope--${tool.scope}`}>{tool.scope}</span>
                {tool.requiredAuth ? <span title={`needs ${tool.requiredAuth}`}> 🔒</span> : null}
                <p className="muted small">{tool.description}</p>
              </div>
              <button className="btn btn--ghost small" onClick={() => onRunTool(tool.name)}>
                Run
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
