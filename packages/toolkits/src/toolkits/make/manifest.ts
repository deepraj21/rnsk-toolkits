import { defineToolkit, defineTool } from '../../core/define.js';
import { MAKE_ICON } from './icon.js';
import { makeTools } from './tools/index.js';

export default defineToolkit({
  id: 'make',
  displayName: 'Make',
  shortDescription:
    'Build and run visual automations: scenarios, webhooks, connections, teams, usage, templates, and reference enums via the Make API v2.',
  category: 'Workflow Automation',
  icon: MAKE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'makeCredentials',
    provider: {
      fields: ['baseUrl', 'apiToken'],
      connectDescription:
        'Connect Make with your zone base URL (e.g. https://eu1.make.com — eu1, eu2, us1, or us2) and an API token from Profile > API tokens with the scopes you need (scenarios:read/write, hooks:read/write, organizations:read, teams, connections:read, templates:read, user:read). Calls send Authorization: Token <api-token> to {zone}/api/v2. Most endpoints require a paid plan.',
    },
  },
  allowedHosts: [
    'eu1.make.com',
    'eu2.make.com',
    'us1.make.com',
    'us2.make.com',
    'eu1.make.celonis.com',
    'us1.make.celonis.com',
  ],
  tools: makeTools.map((entry) =>
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
    homepage: 'https://www.make.com',
    docsUrl: 'https://developers.make.com/api-documentation',
    apiDocsUrl: 'https://developers.make.com/api-documentation/api-reference',
  },
});
