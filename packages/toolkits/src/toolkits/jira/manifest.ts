import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { JIRA_ICON } from './icon.js';
import { jiraTools } from './tools/index.js';

export default defineToolkit({
  id: 'jira',
  displayName: 'Jira',
  shortDescription: 'Issues, projects, boards, sprints, users, JQL search, and workflows.',
  category: 'Productivity & Project Management',
  icon: JIRA_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'jiraToken',
    provider: {
      slug: 'jira',
      env: { clientId: 'JIRA_CLIENT_ID', clientSecret: 'JIRA_CLIENT_SECRET' },
      authorizeUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: [
        'read:jira-user',
        'read:jira-work',
        'write:jira-work',
        'manage:jira-project',
        'manage:jira-configuration',
        'read:board-scope:jira-software',
        'write:board-scope:jira-software',
        'read:sprint:jira-software',
        'write:sprint:jira-software',
      ],
      scopeSeparator: ' ',
      exchangeStyle: 'json',
      extraAuthParams: { audience: 'api.atlassian.com', prompt: 'consent' },
      connectDescription:
        'Connect Jira to manage issues, projects, boards, sprints, users, and workflows. Your Cloud site is detected automatically.',
      callbackPath: '/api/auth/jira/callback',
      stateCookie: 'jira_oauth_state',
    },
  },
  allowedHosts: ['api.atlassian.com'],
  tools: jiraTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://www.atlassian.com/software/jira',
    docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/',
    apiDocsUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/',
  },
});
