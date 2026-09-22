import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { PROMETHEUS_ICON } from './icon.js';
import { prometheusTools } from './tools/index.js';

export default defineToolkit({
  id: 'prometheus',
  displayName: 'Prometheus',
  shortDescription: 'Query metrics with PromQL, explore targets and rules, and manage TSDB.',
  category: 'Developer Tools & DevOps',
  icon: PROMETHEUS_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'prometheusCredentials',
    provider: {
      fields: ['baseUrl', 'username', 'password', 'bearerToken'],
      connectDescription:
        'Connect your Prometheus server with its base URL (e.g. http://localhost:9090). Prometheus has no built-in auth: if your server sits behind a reverse proxy or uses web.config basic_auth_users, also supply username/password (sent as Basic auth); hosted offerings (e.g. Grafana Cloud) use a bearerToken (sent as Authorization: Bearer). Leave auth fields empty for open servers.',
    },
  },
  tools: prometheusTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.11',
    homepage: 'https://prometheus.io',
    docsUrl: 'https://prometheus.io/docs/prometheus/latest/querying/api/',
  },
});
