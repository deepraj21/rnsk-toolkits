import { defineToolkit, defineTool } from '../../core/define.js';
import { WORKDAY_ICON } from './icon.js';
import { workdayTools } from './tools/index.js';

export default defineToolkit({
  id: 'workday',
  displayName: 'Workday',
  shortDescription:
    'Workers, organizations, staffing, recruiting, time off, WQL, and custom reports via the Workday REST and RaaS APIs.',
  category: 'HR & Recruiting',
  icon: WORKDAY_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'workdayCredentials',
    provider: {
      fields: [
        'baseUrl',
        'tenant',
        'clientId',
        'clientSecret',
        'refreshToken',
        'username',
        'password',
      ],
      connectDescription:
        'Connect Workday with your tenant host and tenant name plus OAuth (API client clientId/clientSecret with a non-expiring refreshToken, or a ready accessToken) for REST, and/or ISU username/password Basic auth for RaaS reports. REST calls exchange the refresh token at https://{host}/ccx/oauth2/{tenant}/token; reports call customreport2 with Basic or Bearer.',
    },
  },
  tools: workdayTools.map((entry) =>
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
    homepage: 'https://workday.com',
    docsUrl: 'https://developer.workday.com/documentation',
    apiDocsUrl: 'https://github.com/api-evangelist/workday-integration',
  },
});
