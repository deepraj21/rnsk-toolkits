import { defineToolkit, defineTool } from '../../core/define.js';
import { STACK_OVERFLOW_ICON } from './icon.js';
import { stackOverflowTools } from './tools/index.js';

export default defineToolkit({
  id: 'stack-overflow',
  displayName: 'Stack Overflow',
  shortDescription:
    'Search questions, answers, users, tags, and badges across the Stack Exchange network.',
  category: 'Developer Tools & DevOps',
  icon: STACK_OVERFLOW_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'stackOverflowApiKey',
    provider: {
      in: 'query',
      name: 'key',
      connectDescription:
        'Connect Stack Overflow with a Stack Apps API key to raise the quota from 300 to 10,000 requests/day. Register an app at stackapps.com/apps/oauth to get a key. All reads also work without a key at the lower quota.',
    },
  },
  allowedHosts: ['api.stackexchange.com'],
  tools: stackOverflowTools.map((entry) =>
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
    since: '0.0.12',
    homepage: 'https://stackoverflow.com',
    docsUrl: 'https://api.stackexchange.com/docs',
    apiDocsUrl: 'https://api.stackexchange.com/docs',
  },
});
