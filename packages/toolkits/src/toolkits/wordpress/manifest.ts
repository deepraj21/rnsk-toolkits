import { defineToolkit, defineTool } from '../../core/define.js';
import { WORDPRESS_ICON } from './icon.js';
import { wordpressTools } from './tools/index.js';

export default defineToolkit({
  id: 'wordpress',
  displayName: 'WordPress.com',
  shortDescription: 'Manage WordPress.com sites, posts, pages, media and settings.',
  category: 'Marketing & Social Media',
  icon: WORDPRESS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'wordpressToken',
    provider: {
      slug: 'wordpress',
      env: { clientId: 'WORDPRESS_CLIENT_ID', clientSecret: 'WORDPRESS_CLIENT_SECRET' },
      authorizeUrl: 'https://public-api.wordpress.com/oauth2/authorize',
      tokenUrl: 'https://public-api.wordpress.com/oauth2/token',
      scopes: ['global'],
      exchangeStyle: 'form',
      extraAuthParams: { response_type: 'code' },
      connectDescription: 'Connect WordPress.com to manage sites, draft posts, content and media. Requires a WordPress.com account with site access.',
      callbackPath: '/api/auth/wordpress/callback',
      stateCookie: 'wordpress_oauth_state',
    },
  },
  allowedHosts: ['public-api.wordpress.com'],
  tools: wordpressTools.map((entry) =>
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
