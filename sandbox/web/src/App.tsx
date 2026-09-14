import { RunstackBot, type RunstackBotProps, type ToolkitIndexEntry } from '@rnsk/bot';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { api, type ToolkitSummary } from './api';
import { ChatGuide } from './components/ChatGuide';
import { SourceBadge } from './components/SourceBadge';
import { ToolkitDetail } from './components/ToolkitDetail';
import { ToolkitScopePicker } from './components/ToolkitScopePicker';
import { ToolRunner } from './components/ToolRunner';
import { useHealth, useUrlState } from './hooks';

type Tab = 'chat' | 'runner';

export function App() {
  const [params, update] = useUrlState();
  const { health, offline } = useHealth();
  const [toolkits, setToolkits] = useState<ToolkitSummary[]>([]);
  const [toolkitIndex, setToolkitIndex] = useState<ToolkitIndexEntry[]>();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chatNonce, setChatNonce] = useState(0);

  const scopeParam = params.get('scope') ?? '';
  const scope = useMemo(() => scopeParam.split(',').filter(Boolean), [scopeParam]);
  const tab: Tab = params.get('tab') === 'runner' ? 'runner' : 'chat';
  const selectedId = params.get('toolkit');
  const connectRequested = params.get('connect') === '1';
  const selectedTool = params.get('tool');

  const reload = useCallback(async () => {
    try {
      const [nextToolkits, nextIndex] = await Promise.all([api.toolkits(), api.toolkitIndex()]);
      setToolkits(nextToolkits);
      setToolkitIndex(nextIndex);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  // Reload on first connect and after every server restart (toolkit edit).
  useEffect(() => {
    if (health?.bootId) void reload();
  }, [health?.bootId, reload]);

  const selected = toolkits.find((t) => t.id === selectedId) ?? null;
  const setScope = (ids: string[]) => update({ scope: ids.join(',') || null });

  const scopeKey = scope.length > 0 ? [...scope].sort().join(',') : 'all';
  const botToolkits = useMemo(() => (scope.length > 0 ? scope : undefined), [scope]);
  const clearChat = () => {
    try {
      window.localStorage.removeItem(`rnsk-bot-chat:sandbox:${scopeKey}`);
    } catch {
      // storage unavailable — remounting still starts a fresh session
    }
    setChatNonce((n) => n + 1);
  };

  const botProps: RunstackBotProps = {
    apiKey: `sandbox:${scopeKey}`, // chat history is stored per apiKey → one history per scope
    apiBase: window.location.origin,
    toolkits: botToolkits,
    toolkitIndex,
    placeholder: scope.length > 0 ? `Ask using ${scope.join(', ')}…` : 'Ask anything…',
    theme: 'system',
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">⚒</span>
          <div>
            <h1>Toolkit Sandbox</h1>
            <p>Test @rnsk/toolkits through the real @rnsk/bot</p>
          </div>
        </div>
        <SourceBadge health={health} offline={offline} />
      </header>

      {health && health.toolkits.manifestErrors.length > 0 ? (
        <div className="banner banner--warn">
          <strong>Manifest problems</strong>
          <ul>
            {health.toolkits.manifestErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {loadError ? (
        <div className="banner banner--error">Could not load toolkits: {loadError}</div>
      ) : null}

      <div className="layout">
        <ToolkitScopePicker
          toolkits={toolkits}
          scope={scope}
          selectedId={selectedId}
          onScopeChange={setScope}
          onSelect={(id) => update({ toolkit: id, connect: null })}
        />

        <main className="panel main-panel">
          <nav className="tabs">
            <button
              className={tab === 'chat' ? 'tab tab--active' : 'tab'}
              onClick={() => update({ tab: null })}
            >
              Chat (bot)
            </button>
            <button
              className={tab === 'runner' ? 'tab tab--active' : 'tab'}
              onClick={() => update({ tab: 'runner' })}
            >
              Tool runner
            </button>
          </nav>
          {tab === 'chat' ? (
            <ChatGuide health={health} toolkits={toolkits} scope={scope} onClearChat={clearChat} />
          ) : (
            <ToolRunner
              toolkits={toolkits}
              scope={scope}
              toolName={selectedTool}
              onToolChange={(name) => update({ tool: name })}
              onOpenCredentials={(toolkitId) => update({ toolkit: toolkitId, connect: '1' })}
            />
          )}
        </main>

        <ToolkitDetail
          toolkit={selected}
          connectRequested={connectRequested}
          inScope={selected ? scope.length === 0 || scope.includes(selected.id) : false}
          onCredentialsChanged={() => void reload()}
          onScopeOnly={(id) => setScope([id])}
          onRunTool={(name) => update({ tab: 'runner', tool: name })}
        />
      </div>

      {health?.llm.ok ? <RunstackBot key={`${scopeKey}:${chatNonce}`} {...botProps} /> : null}
    </div>
  );
}
