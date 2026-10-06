import { defineToolkit, defineTool } from '../../core/define.js';
import { OLLAMA_ICON } from './icon.js';
import { ollamaTools } from './tools/index.js';

export default defineToolkit({
  id: 'ollama',
  displayName: 'Ollama',
  shortDescription:
    'Run inference on local Ollama models via chat, generate, and OpenAI-compatible endpoints, plus model catalog.',
  category: 'AI & Machine Learning',
  icon: OLLAMA_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'ollamaCredentials',
    provider: {
      fields: ['baseUrl', 'apiKey'],
      connectDescription:
        'Connect your Ollama server with its base URL (e.g. http://localhost:11434 for local Ollama, or https://ollama.com for cloud models). Local servers need no key; for Ollama Cloud paste an API key from ollama.com/settings/keys as apiKey, sent as Authorization: Bearer <key>. Leave empty to use the local default.',
    },
  },
  tools: ollamaTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.14',
    homepage: 'https://ollama.com',
    docsUrl: 'https://docs.ollama.com/api/introduction',
    apiDocsUrl: 'https://github.com/ollama/ollama/blob/main/docs/openapi.yaml',
  },
});
