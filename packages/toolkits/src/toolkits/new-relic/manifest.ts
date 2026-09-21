import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { NEW_RELIC_ICON } from './icon.js';
import { newRelicTools } from './tools/index.js';

export default defineToolkit({
  id: 'new-relic',
  displayName: 'New Relic',
  shortDescription: 'Monitor with NRQL, manage alerts, dashboards, synthetics, entities, and ingest events.',
  category: 'Developer Tools & DevOps',
  icon: NEW_RELIC_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'newRelicApiKey',
    provider: {
      in: 'header',
      name: 'Api-Key',
      connectDescription:
        'Connect New Relic with a User API key (starts with NRAK-). Create one at one.newrelic.com > API keys. The key is sent as the Api-Key header to NerdGraph, REST v2, Infrastructure, Synthetics, and Lookups APIs (Synthetics v3 uses X-Api-Key). Event and Trace ingest need separate insert/license keys passed per call. US endpoints are used.',
    },
  },
  allowedHosts: [
    'api.newrelic.com',
    'infra-api.newrelic.com',
    'synthetics.newrelic.com',
    'nrql-lookup.service.newrelic.com',
    'insights-collector.newrelic.com',
    'trace-api.newrelic.com',
  ],
  tools: newRelicTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.8',
    homepage: 'https://newrelic.com',
    docsUrl: 'https://docs.newrelic.com/docs/apis/nerdgraph/get-started/introduction-new-relic-nerdgraph/',
  },
});
