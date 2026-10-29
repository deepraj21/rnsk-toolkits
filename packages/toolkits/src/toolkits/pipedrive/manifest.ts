import { defineToolkit, defineTool } from '../../core/define.js';
import { PIPEDRIVE_ICON } from './icon.js';
import { pipedriveTools } from './tools/index.js';

export default defineToolkit({
  id: 'pipedrive',
  displayName: 'Pipedrive',
  shortDescription:
    'Manage the Pipedrive CRM: deals, persons, organizations, activities, notes, and leads, plus pipelines, stages, and the current user.',
  category: 'CRM',
  icon: PIPEDRIVE_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'pipedriveApiToken',
    provider: {
      in: 'header',
      name: 'x-api-token',
      connectDescription:
        'Connect Pipedrive with a personal API token. In Pipedrive: account name (top right) > Company settings > Personal preferences > API (or open app.pipedrive.com/settings/api) and copy the token. The token is tied to your user and one company and grants access to all of that user’s data — keep it private. Note: a user has a different token per company, and only one token is active at a time.',
    },
  },
  allowedHosts: ['api.pipedrive.com'],
  tools: pipedriveTools.map((entry) =>
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
    homepage: 'https://www.pipedrive.com',
    docsUrl: 'https://developers.pipedrive.com/docs/api/v1',
  },
});
