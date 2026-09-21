import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { CONVEX_ICON } from './icon.js';
import { convexTools } from './tools/index.js';

export default defineToolkit({
  id: 'convex',
  displayName: 'Convex',
  shortDescription: 'Projects, deployments, functions, and logs.',
  category: 'Developer Tools & DevOps',
  icon: CONVEX_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'convexToken',
    provider: {
      connectDescription:
        'Connect Convex with a team access token. Create one from the Convex dashboard under Team Settings > Access Tokens. The same token works for management (api.convex.dev) and deployment-scoped calls (*.convex.cloud, sent with the Convex auth prefix).',
    },
  },
  allowedHosts: ['api.convex.dev', 'convex.cloud'],
  tools: convexTools.map((entry) =>
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
    homepage: 'https://www.convex.dev',
    docsUrl: 'https://docs.convex.dev/management-api/overview',
    apiDocsUrl: 'https://api.convex.dev/v1/openapi.json',
  },
});
