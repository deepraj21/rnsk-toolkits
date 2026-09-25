import { defineToolkit, defineTool } from '../../core/define.js';
import { DYNATRACE_ICON } from './icon.js';
import { dynatraceTools } from './tools/index.js';

export default defineToolkit({
  id: 'dynatrace',
  displayName: 'Dynatrace',
  shortDescription: 'Problems, metrics, entities, logs, DQL, events, SLOs, settings, security, synthetic and tokens via the Dynatrace Environment API.',
  category: 'Developer Tools & DevOps',
  icon: DYNATRACE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'dynatraceCredentials',
    provider: {
      fields: ['baseUrl', 'apiToken', 'platformBaseUrl'],
      connectDescription:
        'Connect your Dynatrace environment with its base URL (SaaS: https://ENV-ID.live.dynatrace.com; Managed: https://HOST/e/ENV-ID) and an API token (Settings > Integration > Dynatrace API > Generate token) sent as Authorization: Api-Token. Grant the scopes you need (problems.read/write, metrics.read/ingest, entities.read/write, events.read/ingest, logs.read/ingest, slo.read/write, settings.read/write, auditLogs.read, apiTokens.read/write, securityProblems.read, extensions.read/write). DQL queries use the platform host ({env}.apps.dynatrace.com on SaaS, derived automatically) — override via optional platformBaseUrl for Managed.',
    },
  },
  tools: dynatraceTools.map((entry) =>
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
    homepage: 'https://www.dynatrace.com',
    docsUrl: 'https://docs.dynatrace.com/docs/dynatrace-api/environment-api',
    apiDocsUrl: 'https://docs.dynatrace.com/docs/dynatrace-api/environment-api',
  },
});
