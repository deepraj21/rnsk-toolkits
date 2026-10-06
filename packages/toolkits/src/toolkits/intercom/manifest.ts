import { defineToolkit, defineTool } from '../../core/define.js';
import { INTERCOM_ICON } from './icon.js';
import { intercomTools } from './tools/index.js';

export default defineToolkit({
  id: 'intercom',
  displayName: 'Intercom',
  shortDescription:
    'Manage contacts, companies, conversations, tickets, articles, and events via the Intercom API v2.',
  category: 'Sales & Customer Support',
  icon: INTERCOM_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'intercomCredentials',
    provider: {
      fields: ['accessToken', 'baseUrl'],
      connectDescription:
        'Connect Intercom with an access token from the Intercom Developer Hub (App > Configure > Authentication). All calls send it as Authorization: Bearer <token> with Intercom-Version: 2.16 to https://api.intercom.io. EU workspaces can set baseUrl to https://api.eu.intercom.io.',
    },
  },
  allowedHosts: ['api.intercom.io', 'api.eu.intercom.io', 'api.au.intercom.io'],
  tools: intercomTools.map((entry) =>
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
    since: '0.0.14',
    homepage: 'https://intercom.com',
    docsUrl: 'https://developers.intercom.com/docs/references/rest-api/api.intercom.io',
    apiDocsUrl:
      'https://github.com/intercom/Intercom-OpenAPI/blob/main/descriptions/2.16/api.intercom.io.yaml',
  },
});
