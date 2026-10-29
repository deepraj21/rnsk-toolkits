import { defineToolkit, defineTool } from '../../core/define.js';
import { GREENHOUSE_ICON } from './icon.js';
import { greenhouseTools } from './tools/index.js';

export default defineToolkit({
  id: 'greenhouse',
  displayName: 'Greenhouse',
  shortDescription:
    'Manage Greenhouse Recruiting via the Harvest v3 API: jobs and requisitions, candidates, applications, and candidate notes.',
  category: 'HR & Recruiting',
  icon: GREENHOUSE_ICON,
  auth: {
    type: 'basic_auth',
    tokenField: 'greenhouseCredentials',
    provider: {
      connectDescription:
        'Connect Greenhouse with a Harvest API client. In Greenhouse: Settings > Developer Center > API Credential Management > Create new API credential (Harvest API), then copy the Client ID and Client Secret and paste them here as "clientId:clientSecret". The toolkit exchanges them for a short-lived Harvest v3 access token (OAuth 2.0 Client Credentials) on every call. Required API scopes: Jobs (list/create/update), Candidates (list/create/update), Applications (list/create), and Notes (create).',
    },
  },
  allowedHosts: ['harvest.greenhouse.io', 'auth.greenhouse.io'],
  tools: greenhouseTools.map((entry) =>
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
    homepage: 'https://www.greenhouse.io',
    docsUrl: 'https://harvestdocs.greenhouse.io',
  },
});
