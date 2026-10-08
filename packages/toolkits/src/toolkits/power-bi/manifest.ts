import { defineToolkit, defineTool } from '../../core/define.js';
import { POWER_BI_ICON } from './icon.js';
import { powerBiTools } from './tools/index.js';

export default defineToolkit({
  id: 'power-bi',
  displayName: 'Power BI',
  shortDescription:
    'Workspaces, reports, datasets, dashboards, DAX queries, refresh, and export via the Power BI REST API.',
  category: 'Analytics & Data',
  icon: POWER_BI_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'powerBiCredentials',
    provider: {
      fields: ['tenantId', 'clientId', 'clientSecret', 'accessToken'],
      connectDescription:
        'Connect Power BI with JSON {"tenantId":"...","clientId":"...","clientSecret":"..."} for an Entra ID app (client credentials, scope https://analysis.windows.net/powerbi/api/.default, service principal enabled in Power BI admin). Or pass {"accessToken":"..."} from user-delegated OAuth. Assign the app to workspaces and grant Dataset.ReadWrite.All, Report.ReadWrite.All, Dashboard.Read.All, Workspace.ReadWrite.All as needed.',
    },
  },
  allowedHosts: ['api.powerbi.com', 'login.microsoftonline.com'],
  tools: powerBiTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.17',
    homepage: 'https://powerbi.microsoft.com',
    docsUrl: 'https://learn.microsoft.com/en-us/rest/api/power-bi/',
    apiDocsUrl: 'https://learn.microsoft.com/en-us/rest/api/power-bi/',
  },
});
