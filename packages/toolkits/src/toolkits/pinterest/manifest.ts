import { defineToolkit, defineTool } from '../../core/define.js';
import { PINTEREST_ICON } from './icon.js';
import { pinterestTools } from './tools/index.js';

export default defineToolkit({
  id: 'pinterest',
  displayName: 'Pinterest',
  shortDescription:
    'Boards, Pins, analytics, trends, media, and profile via the Pinterest REST API v5.',
  category: 'Social Media',
  icon: PINTEREST_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'pinterestToken',
    provider: {
      slug: 'pinterest',
      env: { clientId: 'PINTEREST_CLIENT_ID', clientSecret: 'PINTEREST_CLIENT_SECRET' },
      authorizeUrl: 'https://www.pinterest.com/oauth/',
      tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
      scopes: [
        'boards:read',
        'boards:read_secret',
        'boards:write',
        'boards:write_secret',
        'pins:read',
        'pins:read_secret',
        'pins:write',
        'pins:write_secret',
        'user_accounts:read',
      ],
      exchangeStyle: 'basic',
      connectDescription:
        'Connect Pinterest to manage boards, Pins, analytics, and trends. All calls send the OAuth access token as Authorization: Bearer <token>. Pin creation needs an app with Standard access (Trial apps can only use the API sandbox).',
      callbackPath: '/api/auth/pinterest/callback',
      stateCookie: 'pinterest_oauth_state',
    },
  },
  allowedHosts: ['api.pinterest.com', 'api-sandbox.pinterest.com'],
  tools: pinterestTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.13',
    homepage: 'https://pinterest.com',
    docsUrl: 'https://developers.pinterest.com/docs/api/v5/',
    apiDocsUrl: 'https://developers.pinterest.com/docs/api/v5/',
  },
});
