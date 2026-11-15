import { defineToolkit, defineTool } from '../../core/define.js';
import { TRELLO_ICON } from './icon.js';
import { trelloTools } from './tools/index.js';

export default defineToolkit({
  id: 'trello',
  displayName: 'Trello',
  shortDescription:
    'Manage Trello boards, lists, cards, checklists, labels, members, comments, workspaces, and search across boards.',
  category: 'Productivity & Project Management',
  icon: TRELLO_ICON,
  auth: {
    type: 'basic_auth',
    tokenField: 'trelloCredentials',
    provider: {
      connectDescription:
        'Connect Trello with an API key and token. At https://trello.com/power-ups/admin create an API key, then generate a token from that key’s page (authorize the app), and paste them joined by a colon as "key:token". Both are sent as key and token query parameters on every api.trello.com/1 request. Keep them private — they can read and change every board the account can see. A token can be revoked from the same power-ups admin page.',
    },
  },
  allowedHosts: ['api.trello.com'],
  tools: trelloTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.19',
    homepage: 'https://trello.com',
    docsUrl: 'https://developer.atlassian.com/cloud/trello/rest/',
  },
});
