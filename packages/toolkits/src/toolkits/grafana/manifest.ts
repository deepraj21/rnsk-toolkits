import { defineToolkit, defineTool } from '../../core/define.js';
import { GRAFANA_ICON } from './icon.js';
import { grafanaTools } from './tools/index.js';

export default defineToolkit({
  id: 'grafana',
  displayName: 'Grafana',
  shortDescription:
    'Monitor Grafana health, query public dashboards, ingest OTLP logs, and inspect Mimir/Loki ring status.',
  category: 'Developer Tools & DevOps',
  icon: GRAFANA_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'grafanaCredentials',
    provider: {
      fields: ['baseUrl', 'apiToken'],
      connectDescription:
        'Connect your Grafana instance with its base URL (e.g. https://grafana.example.com) and an optional service account API token.',
    },
  },
  tools: grafanaTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.6',
    homepage: 'https://grafana.com',
    docsUrl: 'https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/',
  },
});
