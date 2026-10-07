import { defineToolkit, defineTool } from '../../core/define.js';
import { ELASTIC_ICON } from './icon.js';
import { elasticTools } from './tools/index.js';

export default defineToolkit({
  id: 'elastic',
  displayName: 'Elastic',
  shortDescription:
    'Elasticsearch: search and analytics, indices and documents, snapshots, ingest pipelines, and security.',
  category: 'Data & Analytics',
  icon: ELASTIC_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'elasticCredentials',
    provider: {
      fields: ['baseUrl', 'apiKey', 'username', 'password'],
      connectDescription:
        'Connect Elasticsearch with the cluster URL (e.g. http://localhost:9200 or an Elastic Cloud endpoint) plus an API key (Stack Management > API Keys, sent as ApiKey), username+password (Basic), or a service token (Bearer).',
    },
  },
  tools: elasticTools.map((entry) =>
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
    homepage: 'https://www.elastic.co',
    docsUrl: 'https://www.elastic.co/docs/reference/elasticsearch/rest-apis',
    apiDocsUrl: 'https://www.elastic.co/docs/api/doc/elasticsearch',
  },
});
