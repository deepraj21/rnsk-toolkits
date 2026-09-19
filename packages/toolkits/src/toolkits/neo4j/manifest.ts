import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { NEO4J_ICON } from './icon.js';
import { neo4jTools } from './tools/index.js';

export default defineToolkit({
  id: 'neo4j',
  displayName: 'Neo4j',
  shortDescription: 'Aura instances, snapshots, projects, users, IP filters, agents, and GDS sessions.',
  category: 'Data & Analytics',
  icon: NEO4J_ICON,
  auth: {
    type: 'basic_auth',
    tokenField: 'neo4jCredentials',
    provider: {
      connectDescription:
        'Connect Neo4j with Aura API client credentials. Create them in the Aura Console under Account Settings > Client credentials (Aura API). Paste as "clientId:clientSecret". Tools exchange them for a short-lived bearer token automatically.',
    },
  },
  allowedHosts: ['api.neo4j.io'],
  tools: neo4jTools.map((entry) =>
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
    homepage: 'https://neo4j.com',
    docsUrl: 'https://neo4j.com/docs/aura/api/authentication/',
    apiDocsUrl: 'https://neo4j.com/docs/aura/platform/api/specification/',
  },
});
