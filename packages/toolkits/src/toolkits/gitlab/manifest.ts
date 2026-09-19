import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GITLAB_ICON } from './icon.js';
import { gitlabTools } from './tools/index.js';

export default defineToolkit({
  id: 'gitlab',
  displayName: 'GitLab',
  shortDescription: 'Projects, issues, merge requests, pipelines, and repositories.',
  category: 'Developer Tools & DevOps',
  icon: GITLAB_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'gitlabToken',
    provider: {
      slug: 'gitlab',
      env: { clientId: 'GITLAB_CLIENT_ID', clientSecret: 'GITLAB_CLIENT_SECRET' },
      authorizeUrl: 'https://gitlab.com/oauth/authorize',
      tokenUrl: 'https://gitlab.com/oauth/token',
      scopes: ['api', 'read_user'],
      exchangeStyle: 'form',
      connectDescription:
        'Connect GitLab to manage projects, issues, merge requests, pipelines, and repositories.',
      callbackPath: '/api/auth/gitlab/callback',
      stateCookie: 'gitlab_oauth_state',
    },
  },
  allowedHosts: ['gitlab.com'],
  tools: gitlabTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.9' },
});
