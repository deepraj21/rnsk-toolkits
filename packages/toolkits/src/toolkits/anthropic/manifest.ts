import { defineToolkit, defineTool } from '../../core/define.js';
import { ANTHROPIC_ICON } from './icon.js';
import { anthropicTools } from './tools/index.js';

export default defineToolkit({
  id: 'anthropic',
  displayName: 'Anthropic',
  shortDescription:
    'Send messages to Claude models, count tokens, run discounted async batches, upload files, create Skills, and read organization usage, cost, and API key data.',
  category: 'AI & Machine Learning',
  icon: ANTHROPIC_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'anthropicApiKey',
    provider: {
      in: 'header',
      name: 'x-api-key',
      connectDescription:
        'Connect Anthropic with an API key. In the Claude Console: Settings > API keys (platform.claude.com/settings/requests), then create and copy a key (sk-ant-api...). It is sent as the x-api-key header with anthropic-version 2026-10-21. Keep it private — it can spend on your account. The organization, workspace, usage, cost, and API key tools additionally need a personal key that is not scoped to a workspace, or an sk-ant-admin... key.',
    },
  },
  allowedHosts: ['api.anthropic.com'],
  tools: anthropicTools.map((entry) =>
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
    homepage: 'https://www.anthropic.com',
    docsUrl: 'https://platform.claude.com/docs/en/api/overview',
  },
});
