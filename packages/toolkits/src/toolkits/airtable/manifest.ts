import { defineToolkit, defineTool } from '../../core/define.js';
import { AIRTABLE_ICON } from './icon.js';
import { airtableTools } from './tools/index.js';

export default defineToolkit({
  id: 'airtable',
  displayName: 'Airtable',
  shortDescription: 'Bases, tables, records, comments, schema, and webhooks via the Airtable Web API.',
  category: 'Productivity & Project Management',
  icon: AIRTABLE_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'airtableAccessToken',
    provider: {
      connectDescription:
        'Connect Airtable with a personal access token. Create one at airtable.com/create/tokens with the scopes you need (data.records:read/write, data.recordComments:read/write, schema.bases:read/write, webhook:manage). All calls send it as Authorization: Bearer <token>.',
    },
  },
  allowedHosts: ['api.airtable.com'],
  tools: airtableTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://airtable.com',
    docsUrl: 'https://www.airtable.com/developers/web/api/introduction',
    apiDocsUrl: 'https://www.airtable.com/developers/web/api/introduction',
  },
});
