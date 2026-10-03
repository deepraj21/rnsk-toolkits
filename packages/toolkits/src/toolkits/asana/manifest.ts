import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { ASANA_ICON } from './icon.js';
import { asanaTools } from './tools/index.js';

export default defineToolkit({
  id: 'asana',
  displayName: 'Asana',
  shortDescription: 'Tasks, projects, portfolios, goals, teams, and work management.',
  category: 'Productivity & Project Management',
  icon: ASANA_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'asanaToken',
    provider: {
      slug: 'asana',
      env: { clientId: 'ASANA_CLIENT_ID', clientSecret: 'ASANA_CLIENT_SECRET' },
      authorizeUrl: 'https://app.asana.com/-/oauth_authorize',
      tokenUrl: 'https://app.asana.com/-/oauth_token',
      scopes: ['default'],
      exchangeStyle: 'form',
      connectDescription:
        'Connect Asana to manage tasks, projects, portfolios, goals, and teams. Create an app in the Asana developer console to get a client ID and secret. The default scope grants full API access; tokens are sent as Authorization: Bearer to app.asana.com (API v1.0).',
      callbackPath: '/api/auth/asana/callback',
      stateCookie: 'asana_oauth_state',
    },
  },
  allowedHosts: ['app.asana.com'],
  tools: asanaTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope ?? inferToolScope(entry.name),
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.14',
    homepage: 'https://asana.com',
    docsUrl: 'https://developers.asana.com/docs',
    apiDocsUrl: 'https://developers.asana.com/reference/rest-api-reference',
  },
});
