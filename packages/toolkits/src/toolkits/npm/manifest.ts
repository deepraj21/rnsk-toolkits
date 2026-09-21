import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { NPM_ICON } from './icon.js';
import { npmTools } from './tools/index.js';

export default defineToolkit({
  id: 'npm',
  displayName: 'npm',
  shortDescription: 'Search packages, check downloads and advisories, and manage registry tokens.',
  category: 'Developer Tools & DevOps',
  icon: NPM_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'npmApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect npm with an access token (classic or granular). Create one at npmjs.com > Access Tokens. Sent as Authorization: Bearer <token> to registry.npmjs.org. Download stats, search, metadata, advisories, and ping are public and work without a key; whoami and token deletion require it.',
    },
  },
  allowedHosts: ['registry.npmjs.org', 'api.npmjs.org', 'replicate.npmjs.com'],
  tools: npmTools.map((entry) =>
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
    homepage: 'https://www.npmjs.com',
    docsUrl: 'https://api-docs.npmjs.com',
  },
});
