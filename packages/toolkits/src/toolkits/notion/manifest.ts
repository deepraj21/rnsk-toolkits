import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { NOTION_ICON } from './icon.js';
import { notionTools } from './tools/index.js';

export default defineToolkit({
  id: 'notion',
  displayName: 'Notion',
  shortDescription: 'Search, databases, pages, and blocks.',
  category: 'Collaboration & Communication',
  icon: NOTION_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'notionToken',
    provider: {
      slug: 'notion',
      env: { clientId: 'NOTION_CLIENT_ID', clientSecret: 'NOTION_CLIENT_SECRET' },
      authorizeUrl: 'https://api.notion.com/v1/oauth/authorize',
      tokenUrl: 'https://api.notion.com/v1/oauth/token',
      scopes: [],
      exchangeStyle: 'basic',
      extraAuthParams: { owner: 'user' },
      connectDescription: 'Integrate Notion to sync workspaces, databases, and pages.',
      callbackPath: '/api/auth/notion/callback',
      stateCookie: 'notion_oauth_state',
    },
  },
  allowedHosts: ['api.notion.com'],
  tools: notionTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.2' },
});
