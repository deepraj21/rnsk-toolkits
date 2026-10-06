import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { PAGERDUTY_ICON } from './icon.js';
import { pagerdutyTools } from './tools/index.js';

export default defineToolkit({
  id: 'pagerduty',
  displayName: 'PagerDuty',
  shortDescription:
    'Incidents, on-call schedules, services, escalations, event orchestration, workflows, automation, analytics, and status pages.',
  category: 'Developer Tools & DevOps',
  icon: PAGERDUTY_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'pagerdutyApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Token',
      connectDescription:
        'Connect PagerDuty with a REST API token. Create one from Integrations > API Access Keys (read-only for reads, full access for writes). Calls send Authorization: Token token=<key> to api.pagerduty.com; some write calls also need the acting user email (From header), passed per-tool as fromEmail.',
    },
  },
  allowedHosts: ['api.pagerduty.com'],
  tools: pagerdutyTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.14',
    homepage: 'https://www.pagerduty.com',
    docsUrl: 'https://developer.pagerduty.com/docs/',
    apiDocsUrl: 'https://docs.pagerduty.com/developer/api/reference/rest',
  },
});
