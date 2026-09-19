import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { NEON_ICON } from './icon.js';
import { neonTools } from './tools/index.js';

export default defineToolkit({
  id: 'neon',
  displayName: 'Neon',
  shortDescription: 'Serverless Postgres projects, branches, databases, endpoints, auth, and orgs.',
  category: 'Data & Analytics',
  icon: NEON_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'neonApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect Neon with an API key. Create one in the Neon Console under Account Settings > API keys. All calls send it as Authorization: Bearer <key> to console.neon.tech/api/v2.',
    },
  },
  allowedHosts: ['console.neon.tech'],
  tools: neonTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://neon.com',
    docsUrl: 'https://neon.com/docs/reference/api',
    apiDocsUrl: 'https://api-docs.neon.tech/reference/getting-started-with-neon-api',
  },
});
