import { defineToolkit, defineTool } from '../../core/define.js';
import { OPENAI_ICON } from './icon.js';
import { openaiTools } from './tools/index.js';

export default defineToolkit({
  id: 'openai',
  displayName: 'OpenAI',
  shortDescription:
    'OpenAI models for text, images, audio, embeddings, and retrieval: run responses, transcribe speech, generate media, manage files, batches, fine-tuning, and vector stores.',
  category: 'AI & Machine Learning',
  icon: OPENAI_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'openaiApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect OpenAI with an API key from Platform > API keys (sk-...). Requests send it as Authorization: Bearer against https://api.openai.com/v1. The usage and cost tools additionally need an Organization Admin API key.',
    },
  },
  allowedHosts: ['api.openai.com'],
  tools: openaiTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.19',
    homepage: 'https://openai.com',
    docsUrl: 'https://developers.openai.com/api/docs',
    apiDocsUrl: 'https://developers.openai.com/api/reference',
  },
});
