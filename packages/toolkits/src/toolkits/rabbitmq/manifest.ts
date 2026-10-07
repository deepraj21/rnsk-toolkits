import { defineToolkit, defineTool } from '../../core/define.js';
import { RABBITMQ_ICON } from './icon.js';
import { rabbitmqTools } from './tools/index.js';

export default defineToolkit({
  id: 'rabbitmq',
  displayName: 'RabbitMQ',
  shortDescription:
    'Operate RabbitMQ over the Management HTTP API: publish and fetch messages, queues, exchanges, bindings, vhosts, users, policies, and health.',
  category: 'Data & Analytics',
  icon: RABBITMQ_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'rabbitmqCredentials',
    provider: {
      fields: ['baseUrl', 'username', 'password'],
      connectDescription:
        'Connect RabbitMQ with the management plugin URL (e.g. http://host:15672, default port 15672) plus a username and password. Calls use HTTP Basic auth against {url}/api. Needs the management plugin enabled and a user with the right tags (monitoring for reads, administrator for writes).',
    },
  },
  tools: rabbitmqTools.map((entry) =>
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
    homepage: 'https://www.rabbitmq.com',
    docsUrl: 'https://www.rabbitmq.com/docs/management',
    apiDocsUrl: 'https://www.rabbitmq.com/docs/management-cli',
  },
});
