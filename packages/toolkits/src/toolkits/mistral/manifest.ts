import { defineToolkit, defineTool } from '../../core/define.js';
import { MISTRAL_ICON } from './icon.js';
import { mistralTools } from './tools/index.js';

export default defineToolkit({
  id: 'mistral',
  displayName: 'Mistral',
  shortDescription:
    'Run Mistral models — chat and code completions, embeddings, OCR, transcription, moderation, file and batch jobs, custom agents, and stateful conversations.',
  category: 'AI & Machine Learning',
  icon: MISTRAL_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'mistralToken',
    provider: {
      connectDescription:
        'Connect Mistral with an API key. In the Mistral Console (https://console.mistral.ai) go to API keys, create a key, and paste it here. The key is sent as an Authorization: Bearer header on every api.mistral.ai request. Keep it private — it can use your account’s models, files, agents, and conversations.',
    },
  },
  allowedHosts: ['api.mistral.ai'],
  tools: mistralTools.map((entry) =>
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
    since: '0.0.19',
    homepage: 'https://mistral.ai',
    docsUrl: 'https://docs.mistral.ai',
  },
});
