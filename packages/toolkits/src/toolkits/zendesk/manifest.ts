import { defineToolkit, defineTool } from '../../core/define.js';
import { ZENDESK_ICON } from './icon.js';
import { zendeskTools } from './tools/index.js';

export default defineToolkit({
  id: 'zendesk',
  displayName: 'Zendesk',
  shortDescription:
    'Zendesk Support: tickets, users, organizations, views, macros, triggers, automations, satisfaction, and webhooks.',
  category: 'Sales & Customer Support',
  icon: ZENDESK_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'zendeskCredentials',
    provider: {
      fields: ['subdomain', 'email', 'apiToken', 'accessToken'],
      connectDescription:
        'Connect Zendesk with your subdomain (from mycompany.zendesk.com) plus an API token (Admin Center > Apps and integrations > API: {"subdomain":"...","email":"...","apiToken":"..."}, sent as email/token Basic auth) or an OAuth accessToken (Bearer). Calls go to {subdomain}.zendesk.com/api/v2.',
    },
  },
  tools: zendeskTools.map((entry) =>
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
    since: '0.0.15',
    homepage: 'https://www.zendesk.com',
    docsUrl: 'https://developer.zendesk.com/documentation/ticketing/',
    apiDocsUrl: 'https://developer.zendesk.com/api-reference/',
  },
});
