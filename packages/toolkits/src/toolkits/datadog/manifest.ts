import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { DATADOG_ICON } from './icon.js';
import { datadogTools } from './tools/index.js';

export default defineToolkit({
  id: 'datadog',
  displayName: 'Datadog',
  shortDescription: 'Logs, metrics, monitors, dashboards, APM, and on-call.',
  category: 'Analytics & Data',
  icon: DATADOG_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'datadogCredentials',
    provider: {
      fields: ['apiKey', 'appKey', 'site'],
      connectDescription:
        'Connect Datadog with an API key and an Application key (Organization Settings > API Keys / Application Keys), plus the API host for your site, e.g. api.datadoghq.com (US1), api.datadoghq.eu (EU), api.us3.datadoghq.com, api.us5.datadoghq.com, api.ap1.datadoghq.com, or api.ap2.datadoghq.com. Short site codes (us1, eu, ap1, ...) are also accepted.',
    },
  },
  allowedHosts: [
    'api.datadoghq.com',
    'api.us3.datadoghq.com',
    'api.us5.datadoghq.com',
    'api.datadoghq.eu',
    'api.ap1.datadoghq.com',
    'api.ap2.datadoghq.com',
    'api.ddog-gov.com',
    'api.us2.ddog-gov.com',
    'api.uk1.datadoghq.com',
  ],
  tools: datadogTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.10',
    homepage: 'https://www.datadoghq.com',
    docsUrl: 'https://docs.datadoghq.com/api/latest/',
    apiDocsUrl: 'https://docs.datadoghq.com/api/latest/',
  },
});
