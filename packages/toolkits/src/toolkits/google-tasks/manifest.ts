import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GTASKS_ICON } from './icon.js';
import { googleTasksTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-tasks',
  displayName: 'Google Tasks',
  shortDescription: 'List, create, update, and organize Google Tasks lists and to-dos.',
  category: 'Productivity & Project Management',
  icon: GTASKS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleTasksToken',
    provider: {
      slug: 'google-tasks',
      env: { clientId: 'GOOGLE_TASKS_CLIENT_ID', clientSecret: 'GOOGLE_TASKS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/tasks',
        'https://www.googleapis.com/auth/tasks.readonly',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Tasks to view lists, manage to-dos, and track due dates.',
      callbackPath: '/api/auth/google-tasks/callback',
      stateCookie: 'google_tasks_oauth_state',
    },
  },
  allowedHosts: ['tasks.googleapis.com', 'www.googleapis.com'],
  tools: googleTasksTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.7' },
});
