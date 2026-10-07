import { defineToolkit, defineTool } from '../../core/define.js';
import { OPSGENIE_ICON } from './icon.js';
import { opsgenieTools } from './tools/index.js';

export default defineToolkit({
  id: 'opsgenie',
  displayName: 'Opsgenie',
  shortDescription:
    'Atlassian Opsgenie alerting and on-call: alerts, incidents, schedules, escalations, teams, heartbeats, and policies.',
  category: 'Developer Tools & DevOps',
  icon: OPSGENIE_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'opsgenieApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'GenieKey',
      connectDescription:
        'Connect Opsgenie with an API integration key (Teams > Integrations > API). Calls send Authorization: GenieKey <key> to api.opsgenie.com (US) or api.eu.opsgenie.com (EU) — pass region eu per tool for the EU instance.',
    },
  },
  allowedHosts: ['api.opsgenie.com', 'api.eu.opsgenie.com'],
  tools: opsgenieTools.map((entry) =>
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
    homepage: 'https://www.atlassian.com/software/opsgenie',
    docsUrl: 'https://docs.opsgenie.com/docs/api-overview',
    apiDocsUrl: 'https://docs.opsgenie.com/docs/alert-api',
  },
});
