import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { CLICKUP_ICON } from './icon.js';
import { clickupTools } from './tools/index.js';

export default defineToolkit({
  id: 'clickup',
  displayName: 'ClickUp',
  shortDescription: 'Tasks, lists, docs, chat, goals, time tracking, webhooks and teams.',
  category: 'Productivity & Project Management',
  icon: CLICKUP_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'clickupToken',
    provider: {
      slug: 'clickup',
      env: { clientId: 'CLICKUP_CLIENT_ID', clientSecret: 'CLICKUP_CLIENT_SECRET' },
      authorizeUrl: 'https://app.clickup.com/api',
      tokenUrl: 'https://api.clickup.com/api/v2/oauth/token',
      scopes: [],
      exchangeStyle: 'form',
      connectDescription:
        'Connect ClickUp to manage tasks, lists, docs, chat, goals and time tracking. Create an app at ClickUp Settings > Apps > Create an app to get a client ID and secret. The token is sent as a raw Authorization header (no Bearer prefix) to api.clickup.com (v2 and v3).',
      callbackPath: '/api/auth/clickup/callback',
      stateCookie: 'clickup_oauth_state',
    },
  },
  allowedHosts: ['api.clickup.com', 'app.clickup.com'],
  tools: clickupTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: (entry as { requiredAuth?: 'clickupToken' }).requiredAuth,
      scope: (entry as { scope?: 'read' | 'write' | 'delete' }).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.13',
    homepage: 'https://clickup.com',
    docsUrl: 'https://developer.clickup.com/docs',
    apiDocsUrl: 'https://developer.clickup.com/reference',
  },
});
