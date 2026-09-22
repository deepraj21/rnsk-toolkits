import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { SERVICENOW_ICON } from './icon.js';
import { servicenowTools } from './tools/index.js';

export default defineToolkit({
  id: 'servicenow',
  displayName: 'ServiceNow',
  shortDescription: 'Incidents, changes, service catalog, CMDB, attachments, imports, and CICD.',
  category: 'Productivity & Project Management',
  icon: SERVICENOW_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'servicenowCredentials',
    provider: {
      fields: ['baseUrl', 'username', 'password', 'accessToken', 'apiKey'],
      connectDescription:
        'Connect your ServiceNow instance with its base URL (e.g. https://mycompany.service-now.com) and credentials. Provide username/password for Basic auth (a dedicated integration user is recommended), OR an OAuth access token (sent as Authorization: Bearer), OR an API key (sent as x-sn-apikey). Supply exactly the credentials your instance requires.',
    },
  },
  tools: servicenowTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.11',
    homepage: 'https://www.servicenow.com',
    docsUrl: 'https://www.servicenow.com/docs',
    apiDocsUrl: 'https://developer.servicenow.com/dev.do#!/reference',
  },
});
