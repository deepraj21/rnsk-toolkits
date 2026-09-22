import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GUMROARD_ICON } from './icon.js';
import { gumroadTools } from './tools/index.js';

export default defineToolkit({
  id: 'gumroad',
  displayName: 'Gumroad',
  shortDescription: 'Manage sales, products, licenses, and event webhooks.',
  category: 'E-commerce',
  icon: GUMROARD_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'gumroadToken',
    provider: {
      slug: 'gumroad',
      env: { clientId: 'GUMROAD_CLIENT_ID', clientSecret: 'GUMROAD_CLIENT_SECRET' },
      authorizeUrl: 'https://gumroad.com/oauth/authorize',
      tokenUrl: 'https://gumroad.com/oauth/token',
      scopes: ['view_profile', 'view_sales'],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Gumroad via OAuth to manage sales, products, licenses, and webhooks. The access token is sent as Authorization: Bearer to api.gumroad.com/v2.',
      callbackPath: '/api/auth/gumroad/callback',
      stateCookie: 'gumroad_oauth_state',
    },
  },
  allowedHosts: ['api.gumroad.com'],
  tools: gumroadTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.10',
    homepage: 'https://gumroad.com',
    docsUrl: 'https://gumroad.com/api',
  },
});
