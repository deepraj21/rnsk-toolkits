import { defineToolkit, defineTool } from '../../core/define.js';
import { WISE_ICON } from './icon.js';
import { wiseTools } from './tools/index.js';

export default defineToolkit({
  id: 'wise',
  displayName: 'Wise',
  shortDescription: 'Quotes, transfers, balances, recipients and exchange rates.',
  category: 'Finance & Accounting',
  icon: WISE_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'wiseApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect Wise with an API token. Create one at https://api.transferwise.com/oauth/applications (or sandbox https://api.sandbox.transferwise.tech) with at least transfer permissions. The token is sent as Authorization: Bearer <token>.',
    },
  },
  allowedHosts: ['api.transferwise.com', 'api.wise.com', 'api.sandbox.transferwise.tech'],
  tools: wiseTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: { since: '0.0.1' },
});
