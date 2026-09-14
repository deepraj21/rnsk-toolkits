# Toolkit Sandbox

Test your toolkit changes through the **real `@rnsk/bot` chat widget**, or run tools one at a time, without a Runstack account, an OAuth app, or a build step.

```bash
# from the repo root
npm install
npm run sandbox          # → http://localhost:5173
```

That's it. Edit anything in `packages/toolkits/src` and the sandbox restarts; the UI refreshes itself.

## What you get

| Area | What it does |
| --- | --- |
| **Toolkit list** (left) | Every toolkit, with a green/amber dot for whether its credentials are set. Tick toolkits to **scope** the bot and the Tool runner; `only` scopes to a single toolkit. |
| **Chat (bot)** | The real `<RunstackBot>` in the bottom-right corner, pointed at this sandbox instead of Runstack. It runs the same flow as production: `searchTool → checkAuthentication → initiateConnection → executeTool`. Each scope has its own chat history. |
| **Tool runner** | Pick a tool, edit JSON args (pre-filled from its schema), run. No LLM involved, so it's the fastest way to debug a tool. |
| **Toolkit detail** (right) | Tools, scopes (read/write/delete), and a **Credentials** panel to paste tokens / API keys. |

## Setup (optional)

```bash
cp sandbox/.env.example sandbox/.env.local
```

### Chat LLM: free models only

Set **one** key. The sandbox uses whichever it finds:

| Key | Get one | Models |
| --- | --- | --- |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey | `gemini-2.5-flash` (default), `gemini-2.5-flash-lite`, `gemini-flash-latest`, `gemini-flash-lite-latest` |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys | Any `:free` model with tool support. Picked automatically at startup unless you set `SANDBOX_MODEL`. |

- If both keys are set, Gemini wins. Use `SANDBOX_LLM_PROVIDER=openrouter` to switch.
- Keys are checked at startup. A rejected key (e.g. OpenRouter's `401 User not found`) turns the Chat tab off with a hint, or falls back to your other key if you set both.
- Saving `sandbox/.env.local` restarts the server, so a new key applies right away.
- Paid models are rejected at startup, with a message explaining why.
- Without any key, the sandbox still runs. The Chat tab explains what to add, and the Tool runner works.

> Free models are weaker at multi-step tool calling than Runstack's production model. If the chat does something odd, check the tool in the **Tool runner** first.

### Toolkit credentials

- **Service env** toolkits (e.g. Firecrawl): set `FIRECRAWL_API_KEY=` in `.env.local` or paste it in the UI.
- **OAuth** toolkits: there's no OAuth flow in the sandbox. Paste an access token (e.g. a GitHub personal access token) in the Credentials panel. You can also set it by field name in `.env.local`, e.g. `githubToken=ghp_...`.
- When the bot needs a connection, its **Connect** button opens the Credentials panel for that toolkit. Paste the token and tell the bot "connected".

Pasted values live in server memory only and are cleared on restart.

## Local vs published toolkits (feature flag)

| Command | Toolkits used |
| --- | --- |
| `npm run sandbox` | **Local** `packages/toolkits/src`, loaded as TypeScript. No build step needed. |
| `npm run sandbox:npm` | **Published** `@rnsk/toolkits@0.0.5` (what `@rnsk/bot` and Runstack ship with) |

The header badge shows which one is running. `TOOLKITS_SOURCE=local|npm` does the same thing as an env var.

## Testing unpublished `@rnsk/bot` changes

By default, the UI uses `@rnsk/bot` from npm. To run a local checkout of the bot instead:

```bash
cd /path/to/Runstack/@rnsk/bot && npm install        # once
RNSK_BOT_SOURCE=/path/to/Runstack/@rnsk/bot/src npm run sandbox
```

The sandbox passes `@rnsk/bot`'s `toolkitIndex` prop, built from the running toolkit source, so logos and names of brand-new toolkits show up in the chat.

## How it works

```
web (Vite :5173) ──/api──▶ server (Express :3100)
  <RunstackBot apiBase=origin toolkits=[scope] toolkitIndex=…>
                              ├─ /api/bot/config, /api/bot/chat   same contract as Runstack
                              ├─ /api/toolkits, /api/toolkit-index, /api/tools/*
                              ├─ /api/credentials                 in-memory tokens / env
                              └─ toolkits-source.ts               local source ⟷ npm package
```

| File | Role |
| --- | --- |
| `server/toolkits-source.ts` | Feature flag: loads manifests and core helpers from local source or npm |
| `server/meta-tools.ts` | The four meta-tools the bot's LLM calls, mirroring Runstack's |
| `server/run-tool.ts` | Validate → inject credentials → execute, shared by the bot and the Tool runner |
| `server/model.ts` | Free-LLM selection (Gemini / OpenRouter) and friendly error messages |
| `server/routes/*.ts` | HTTP routes |
| `server/contract.test.ts` | Keeps the sandbox ⟷ `@rnsk/bot` contract honest (`npm run sandbox:test`) |
| `web/src/*` | The UI |

Not replicated from Runstack: Studio agents (`agentIds` are ignored), guardrails, and result sanitizing.

## HTTP API (for scripts)

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Toolkit source/version, counts, LLM status, manifest errors |
| `/api/toolkits` | GET | Toolkits with tools, credential fields, and status |
| `/api/toolkit-index` | GET | Display index for `<RunstackBot toolkitIndex>` |
| `/api/tools` | GET | Flat tool list (`?toolkit=<id>` to filter) |
| `/api/tools/:toolName` | GET | Tool metadata and input JSON schema |
| `/api/tools/execute` | POST | `{ "toolName": "...", "args": {} }` |
| `/api/credentials` | POST / DELETE | `{ "kind": "token" \| "env", "name": "...", "value": "..." }` |
| `/api/bot/config`, `/api/bot/chat` | GET / POST | Runstack bot API (used by `@rnsk/bot`) |
| `/api/dev-token` | POST | Legacy: `{ tokenField, token }` / `{ envName, envValue }` |

```bash
curl -X POST http://localhost:3100/api/tools/execute \
  -H 'Content-Type: application/json' \
  -d '{"toolName":"calculateSum","args":{"a":2,"b":3}}'
```

The server binds to `127.0.0.1` and only accepts browser requests from localhost pages.
