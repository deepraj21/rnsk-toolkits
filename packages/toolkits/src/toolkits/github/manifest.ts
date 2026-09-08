import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GITHUB_ICON } from './icon.js';
import { githubTools } from './tools/index.js';

export default defineToolkit({
  id: 'github',
  displayName: 'GitHub',
  shortDescription: 'Repositories, issues, pull requests, actions, and more.',
  category: 'Developer Tools & DevOps',
  icon: GITHUB_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'githubToken',
    provider: {
      slug: 'github',
      env: { clientId: 'GITHUB_CLIENT_ID', clientSecret: 'GITHUB_CLIENT_SECRET' },
      authorizeUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      scopes: ['repo', 'read:user'],
      exchangeStyle: 'json',
      connectDescription:
        'Connect GitHub to access repositories, issues, pull requests, and actions.',
      callbackPath: '/api/auth/github/callback',
      stateCookie: 'github_oauth_state',
    },
  },
  allowedHosts: ['api.github.com'],
  tools: githubTools.map((entry) =>
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
