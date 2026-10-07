import { defineToolkit, defineTool } from '../../core/define.js';
import { KAFKA_ICON } from './icon.js';
import { kafkaTools } from './tools/index.js';

export default defineToolkit({
  id: 'kafka',
  displayName: 'Kafka',
  shortDescription:
    'Produce to and administer Apache Kafka on Confluent Cloud: topics, consumer lag, ACLs, clusters, API keys, schemas, and compatibility.',
  category: 'Data & Analytics',
  icon: KAFKA_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'kafkaCredentials',
    provider: {
      fields: [
        'clusterRestUrl',
        'clusterId',
        'apiKey',
        'apiSecret',
        'cloudApiKey',
        'cloudApiSecret',
        'schemaRegistryUrl',
        'schemaRegistryApiKey',
        'schemaRegistryApiSecret',
      ],
      connectDescription:
        'Connect Kafka (Confluent Cloud) with Basic-auth API keys. Data plane: clusterRestUrl (e.g. https://pkc-xxx.<region>.<provider>.confluent.cloud:443) + clusterId (lkc-xxx) + Kafka apiKey/apiSecret for topics, produce, lag, and ACLs. Management: cloudApiKey/cloudApiSecret (Cloud API key) for environments, clusters, API keys, service accounts via api.confluent.cloud. Schemas: schemaRegistryUrl + schemaRegistryApiKey/schemaRegistryApiSecret. Fill only the groups you use.',
    },
  },
  tools: kafkaTools.map((entry) =>
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
    homepage: 'https://www.confluent.io',
    docsUrl: 'https://docs.confluent.io/cloud/current/kafka-rest/kafka-rest-cc.html',
    apiDocsUrl: 'https://docs.confluent.io/cloud/current/api-docs/index.html',
  },
});
