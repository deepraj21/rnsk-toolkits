import { defineToolkit, defineTool } from '../../core/define.js';
import { AZURE_ICON } from './icon.js';
import { azureTools } from './tools/index.js';

export default defineToolkit({
  id: 'azure',
  displayName: 'Azure',
  shortDescription: 'Manage VMs, disks, networking, storage, web apps, databases, containers, costs and governance via ARM.',
  category: 'Developer Tools & DevOps',
  icon: AZURE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'azureCredentials',
    provider: {
      fields: ['tenantId', 'clientId', 'clientSecret', 'subscriptionId'],
      connectDescription:
        'Connect an Azure service principal (tenant ID + client ID + client secret + subscription ID) with Reader (and, for start/stop/restart, Contributor) access. The toolkit exchanges the secret for an Entra ID token against login.microsoftonline.com and calls management.azure.com.',
    },
  },
  allowedHosts: ['management.azure.com', 'login.microsoftonline.com'],
  tools: azureTools.map((entry) =>
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
    homepage: 'https://azure.microsoft.com',
    docsUrl: 'https://learn.microsoft.com/en-us/rest/api/azure/',
  },
});
