import { defineToolkit, defineTool } from '../../core/define.js';
import { LINEAR_ICON } from './icon.js';
import { linearSearchIssues } from './tools/search-issues.js';
import { linearCreateIssue } from './tools/create-issue.js';
import { linearListTeams } from './tools/list-teams.js';
import { linearGetIssue } from './tools/get-issue.js';
import { linearUpdateIssue } from './tools/update-issue.js';
import { linearListProjects } from './tools/list-projects.js';
import { linearListWorkflowStates } from './tools/list-workflow-states.js';
import { linearAddComment } from './tools/add-comment.js';

export default defineToolkit({
  id: 'linear',
  displayName: 'Linear',
  shortDescription: 'Issues, teams, and project tracking.',
  category: 'Productivity & Project Management',
  icon: LINEAR_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'linearToken',
    provider: {
      slug: 'linear',
      env: { clientId: 'LINEAR_CLIENT_ID', clientSecret: 'LINEAR_CLIENT_SECRET' },
      authorizeUrl: 'https://linear.app/oauth/authorize',
      tokenUrl: 'https://api.linear.app/oauth/token',
      scopes: ['read', 'write'],
      scopeSeparator: ',',
      exchangeStyle: 'form',
      connectDescription:
        'Integrate Linear to manage issues, projects, and cycles with AI-assisted prioritization.',
      callbackPath: '/api/auth/linear/callback',
      stateCookie: 'linear_oauth_state',
    },
  },
  allowedHosts: ['api.linear.app'],
  tools: [
    defineTool({
      name: 'linearSearchIssues',
      tool: linearSearchIssues,
      requiredAuth: 'linearToken',
      scope: 'read',
    }),
    defineTool({
      name: 'linearCreateIssue',
      tool: linearCreateIssue,
      requiredAuth: 'linearToken',
      scope: 'write',
    }),
    defineTool({
      name: 'linearListTeams',
      tool: linearListTeams,
      requiredAuth: 'linearToken',
      scope: 'read',
    }),
    defineTool({
      name: 'linearGetIssue',
      tool: linearGetIssue,
      requiredAuth: 'linearToken',
      scope: 'read',
    }),
    defineTool({
      name: 'linearUpdateIssue',
      tool: linearUpdateIssue,
      requiredAuth: 'linearToken',
      scope: 'write',
    }),
    defineTool({
      name: 'linearListProjects',
      tool: linearListProjects,
      requiredAuth: 'linearToken',
      scope: 'read',
    }),
    defineTool({
      name: 'linearListWorkflowStates',
      tool: linearListWorkflowStates,
      requiredAuth: 'linearToken',
      scope: 'read',
    }),
    defineTool({
      name: 'linearAddComment',
      tool: linearAddComment,
      requiredAuth: 'linearToken',
      scope: 'write',
    }),
  ],
  meta: { since: '0.0.1' },
});
