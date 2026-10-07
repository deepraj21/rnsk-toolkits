import { defineToolkit, defineTool } from '../../core/define.js';
import { REDIS_ICON } from './icon.js';
import { redisTools } from './tools/index.js';

export default defineToolkit({
  id: 'redis',
  displayName: 'Redis',
  shortDescription:
    'Manage Redis Cloud: Pro and Essentials subscriptions and databases, backups, VPC networking, ACLs, users, and billing.',
  category: 'Data & Analytics',
  icon: REDIS_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'redisCredentials',
    provider: {
      fields: ['accountKey', 'secretKey'],
      connectDescription:
        'Connect Redis Cloud with an account key (x-api-key) and user secret key (x-api-secret-key) from Access Management > API Keys. The API must be enabled on the account. Calls go to https://api.redislabs.com/v1 (400 req/min limit).',
    },
  },
  allowedHosts: ['api.redislabs.com'],
  tools: redisTools.map((entry) =>
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
    homepage: 'https://redis.io',
    docsUrl: 'https://redis.io/docs/latest/operate/rc/api/get-started/',
    apiDocsUrl: 'https://redis.io/docs/latest/operate/rc/api/api-reference/',
  },
});
