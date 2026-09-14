// Run a single tool directly: pick it, edit JSON args (pre-filled from its schema), execute.

import { useEffect, useMemo, useState } from 'react';

import { api, type ToolDetail, type ToolkitSummary, type ToolRunResponse } from '../api';

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  description?: string;
  enum?: unknown[];
  default?: unknown;
  items?: JsonSchema;
  $ref?: string;
  definitions?: Record<string, JsonSchema>;
  $defs?: Record<string, JsonSchema>;
  anyOf?: JsonSchema[];
};

/** zod-to-json-schema may wrap the root in a $ref to definitions. */
function resolveRoot(schema: JsonSchema): JsonSchema {
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop()!;
    return schema.definitions?.[name] ?? schema.$defs?.[name] ?? schema;
  }
  return schema;
}

function typeLabel(schema: JsonSchema): string {
  if (schema.enum) return schema.enum.map((v) => JSON.stringify(v)).join(' | ');
  if (schema.anyOf) return schema.anyOf.map(typeLabel).join(' | ');
  const t = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type ?? 'any';
  return t === 'array' && schema.items ? `${typeLabel(schema.items)}[]` : t;
}

function exampleValue(schema: JsonSchema): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];
  const t = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (t) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

function skeleton(root: JsonSchema): string {
  const out: Record<string, unknown> = {};
  for (const name of root.required ?? []) {
    const prop = root.properties?.[name];
    if (prop) out[name] = exampleValue(prop);
  }
  return JSON.stringify(out, null, 2);
}

export function ToolRunner({
  toolkits,
  scope,
  toolName,
  onToolChange,
  onOpenCredentials,
}: {
  toolkits: ToolkitSummary[];
  scope: string[];
  toolName: string | null;
  onToolChange: (name: string | null) => void;
  onOpenCredentials: (toolkitId: string) => void;
}) {
  const groups = useMemo(
    () => (scope.length > 0 ? toolkits.filter((t) => scope.includes(t.id)) : toolkits),
    [toolkits, scope],
  );
  const [detail, setDetail] = useState<ToolDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [argsText, setArgsText] = useState('{}');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ToolRunResponse | null>(null);

  useEffect(() => {
    setResult(null);
    setDetail(null);
    setDetailError(null);
    if (!toolName) return;
    let cancelled = false;
    api
      .tool(toolName)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setArgsText(skeleton(resolveRoot(d.input as JsonSchema)));
      })
      .catch((e) => !cancelled && setDetailError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [toolName]);

  const root = detail ? resolveRoot(detail.input as JsonSchema) : null;
  let parsedArgs: Record<string, unknown> | null = null;
  let argsError: string | null = null;
  try {
    const value: unknown = JSON.parse(argsText || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) parsedArgs = value as Record<string, unknown>;
    else argsError = 'Arguments must be a JSON object';
  } catch (e) {
    argsError = e instanceof Error ? e.message : 'Invalid JSON';
  }

  const run = async () => {
    if (!toolName || !parsedArgs) return;
    setRunning(true);
    try {
      setResult(await api.execute(toolName, parsedArgs));
    } catch (e) {
      setResult({ error: 'Request failed', message: e instanceof Error ? e.message : String(e) });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="pad runner">
      <label className="field">
        <span>Tool</span>
        <select
          className="input"
          value={toolName ?? ''}
          onChange={(e) => onToolChange(e.target.value || null)}
        >
          <option value="">Select a tool…</option>
          {groups.map((t) => (
            <optgroup key={t.id} label={t.displayName}>
              {t.tools.map((tool) => (
                <option key={tool.name} value={tool.name}>
                  {tool.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {detailError ? <p className="error">{detailError}</p> : null}

      {detail && root ? (
        <>
          <p>{detail.description}</p>
          {detail.requiredAuth ? (
            <p className="muted small">
              Needs <code>{detail.requiredAuth}</code>. The sandbox injects it from Credentials.{' '}
              <button className="link small" onClick={() => onOpenCredentials(detail.toolkitId)}>
                Open credentials
              </button>
            </p>
          ) : null}

          {root.properties && Object.keys(root.properties).length > 0 ? (
            <div className="table-wrap">
              <table className="params">
                <thead>
                  <tr>
                    <th>Param</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(root.properties).map(([name, prop]) => (
                    <tr key={name}>
                      <td>
                        <code>{name}</code>
                        {root.required?.includes(name) ? <span className="req">*</span> : null}
                      </td>
                      <td>
                        <code className="small">{typeLabel(prop)}</code>
                      </td>
                      <td className="small">{prop.description ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted small">This tool takes no arguments.</p>
          )}

          <label className="field">
            <span>
              Arguments (JSON) <span className="muted small">⌘/Ctrl + Enter to run</span>
            </span>
            <textarea
              className="input code-input"
              rows={Math.min(16, Math.max(5, argsText.split('\n').length + 1))}
              value={argsText}
              spellCheck={false}
              onChange={(e) => setArgsText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void run();
                }
              }}
            />
          </label>
          {argsError ? <p className="error small">{argsError}</p> : null}

          <div className="row">
            <button className="btn" disabled={running || !parsedArgs} onClick={() => void run()}>
              {running ? 'Running…' : 'Run tool'}
            </button>
            <button className="btn btn--ghost" onClick={() => setArgsText(skeleton(root))}>
              Reset args
            </button>
          </div>
        </>
      ) : null}

      {result ? (
        <section className="result">
          <div className="row">
            <span className={result.error ? 'pill pill--error' : 'pill pill--ok'}>
              {result.error ? result.error : 'success'}
            </span>
            {typeof result.durationMs === 'number' ? (
              <span className="muted small">{result.durationMs} ms</span>
            ) : null}
            {result.requiredAuth && typeof result.toolkitId === 'string' ? (
              <button className="link small" onClick={() => onOpenCredentials(result.toolkitId as string)}>
                Add {String(result.requiredAuth)}
              </button>
            ) : null}
            <button
              className="link small"
              onClick={() => void navigator.clipboard?.writeText(JSON.stringify(result, null, 2))}
            >
              Copy
            </button>
          </div>
          {result.message ? <p className="error small">{result.message}</p> : null}
          <pre className="code">{JSON.stringify(result.error ? result : result.result, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  );
}
