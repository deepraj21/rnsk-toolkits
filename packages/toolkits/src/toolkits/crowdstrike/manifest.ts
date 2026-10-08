import { defineToolkit, defineTool } from '../../core/define.js';
import { CROWDSTRIKE_ICON } from './icon.js';
import { crowdstrikeTools } from './tools/index.js';

export default defineToolkit({
  id: 'crowdstrike',
  displayName: 'CrowdStrike Falcon',
  shortDescription:
    'Falcon hosts, alerts, incidents, containment, and online state via the CrowdStrike API.',
  category: 'Developer Tools & DevOps',
  icon: CROWDSTRIKE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'crowdstrikeCredentials',
    provider: {
      fields: ['clientId', 'clientSecret', 'baseUrl'],
      connectDescription:
        'Connect CrowdStrike with an API client from Support > API Clients and Keys. JSON: {"clientId":"...","clientSecret":"...","baseUrl":"https://api.crowdstrike.com"} (use your region host if not US-1, e.g. api.us-2.crowdstrike.com). OAuth2 client credentials fetch a 30-minute Bearer token per request. Assign least-privilege scopes (Hosts, Alerts, Incidents).',
    },
  },
  allowedHosts: [
    'api.crowdstrike.com',
    'api.us-2.crowdstrike.com',
    'api.eu-1.crowdstrike.com',
    'api.laggar.gcw.crowdstrike.com',
  ],
  tools: crowdstrikeTools.map((entry) =>
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
    since: '0.0.16',
    homepage: 'https://www.crowdstrike.com',
    docsUrl: 'https://developer.crowdstrike.com/docs/openapi/',
    apiDocsUrl: 'https://developer.crowdstrike.com/docs/openapi/',
  },
});
