import { defineToolkit, defineTool } from '../../core/define.js';
import { VERCEL_ICON } from './icon.js';
import { vercelTools } from './tools/index.js';

export default defineToolkit({
  id: 'vercel',
  displayName: 'Vercel',
  shortDescription: 'Projects, deployments, domains, env vars, edge config and teams.',
  category: 'Developer Tools & DevOps',
  icon: VERCEL_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'vercelToken',
    provider: {
      slug: 'vercel',
      env: { clientId: 'VERCEL_CLIENT_ID', clientSecret: 'VERCEL_CLIENT_SECRET' },
      authorizeUrl: 'https://vercel.com/oauth/authorize',
      tokenUrl: 'https://api.vercel.com/v2/oauth/access_token',
      scopes: [],
      exchangeStyle: 'json',
      connectDescription: 'Connect Vercel to manage deployments, projects, domains and environment variables.',
      callbackPath: '/api/auth/vercel/callback',
      stateCookie: 'vercel_oauth_state',
    },
  },
  allowedHosts: ['api.vercel.com'],
  tools: vercelTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: { since: '0.0.10' },
});
