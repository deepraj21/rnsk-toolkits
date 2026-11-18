import { defineToolkit, defineTool } from '../../core/define.js';
import { DEEPSEEK_ICON } from './icon.js';
import { deepseekTools } from './tools/index.js';

export default defineToolkit({
  id: 'deepseek',
  displayName: 'DeepSeek',
  shortDescription:
    'DeepSeek LLM API — chat completions (OpenAI and Anthropic formats), FIM code completion, web search/fetch, files, ASR/TTS, OCR, and account balance.',
  category: 'AI & Machine Learning',
  icon: DEEPSEEK_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'deepseekToken',
    provider: {
      connectDescription:
        "Connect DeepSeek with an API key from platform.deepseek.com/api_keys (create a key and copy it). The key is sent as an Authorization: Bearer header on every api.deepseek.com request. Keep it private — it can spend on your account's model, search, ASR/TTS, and OCR calls.",
    },
  },
  allowedHosts: ['api.deepseek.com'],
  tools: deepseekTools.map((entry) =>
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
    homepage: 'https://www.deepseek.com',
    docsUrl: 'https://api-docs.deepseek.com/api/create-chat-completion',
  },
});
