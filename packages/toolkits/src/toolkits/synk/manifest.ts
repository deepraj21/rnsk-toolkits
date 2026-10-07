import { defineToolkit, defineTool } from '../../core/define.js';
import { SYNK_ICON } from './icon.js';
import { synkTools } from './tools/index.js';

export default defineToolkit({
  id: 'synk',
  displayName: 'Snyk',
  shortDescription:
    'Scan and fix with Snyk: projects, issues, SBOMs, ignores, integrations, members, and webhooks via the REST and V1 APIs.',
  category: 'Developer Tools & DevOps',
  icon: SYNK_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'synkCredentials',
    provider: {
      fields: ['baseUrl', 'apiKey'],
      connectDescription:
        'Connect Snyk with an API token (Account Settings > API Token) and optional region base URL (default https://api.snyk.io; US-02 https://api.us.snyk.io, EU https://api.eu.snyk.io, AU https://api.au.snyk.io). Calls send Authorization: token <key> to /rest (with ?version=) and /api/v1. Most APIs need an Enterprise plan.',
    },
  },
  allowedHosts: ['api.snyk.io', 'api.us.snyk.io', 'api.eu.snyk.io', 'api.au.snyk.io'],
  tools: synkTools.map((entry) =>
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
    since: '0.0.15',
    homepage: 'https://snyk.io',
    docsUrl: 'https://docs.snyk.io/developer-tools/snyk-api/rest-api',
    apiDocsUrl: 'https://docs.snyk.io/developer-tools/snyk-api/api-endpoints-index-and-tips',
  },
});
