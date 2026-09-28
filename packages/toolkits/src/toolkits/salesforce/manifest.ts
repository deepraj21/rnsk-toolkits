import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { SALESFORCE_ICON } from './icon.js';
import { salesforceTools } from './tools/index.js';

export default defineToolkit({
  id: 'salesforce',
  displayName: 'Salesforce',
  shortDescription:
    'CRM records, SOQL/SOSL search, campaigns, Bulk API, reports, UI API and Chatter.',
  category: 'CRM',
  icon: SALESFORCE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'salesforceCredentials',
    provider: {
      fields: ['instanceUrl', 'accessToken'],
      connectDescription:
        'Connect Salesforce with your org instance URL (e.g. https://mydomain.my.salesforce.com, found in Setup > Company Information) and an access token sent as Authorization: Bearer. Get a token via a Connected App OAuth flow (scopes api and refresh_token, plus chatter_api for files and wave_api for CRM Analytics), or use a valid session ID. All REST calls target {instanceUrl}/services/data/v62.0.',
    },
  },
  tools: salesforceTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as { scope?: 'read' | 'write' | 'delete' }).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://www.salesforce.com',
    docsUrl: 'https://developer.salesforce.com/docs/platform/api-rest/guide/extra-resources.html',
    apiDocsUrl:
      'https://developer.salesforce.com/docs/platform/api-rest/guide/extra-resources.html',
  },
});
