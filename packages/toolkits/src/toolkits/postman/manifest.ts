import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { POSTMAN_ICON } from './icon.js';
import { postmanTools } from './tools/index.js';

export default defineToolkit({
  id: 'postman',
  displayName: 'Postman',
  shortDescription: 'Collections, environments, workspaces, mocks, monitors, APIs, Spec Hub, comments, and pull requests.',
  category: 'Developer Tools & DevOps',
  icon: POSTMAN_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'postmanApiKey',
    provider: {
      in: 'header',
      name: 'x-api-key',
      connectDescription:
        'Connect Postman with an API key. Generate one from Postman Account Settings > API Keys. Every Postman API request sends it as the x-api-key header.',
    },
  },
  allowedHosts: ['api.postman.com'],
  tools: postmanTools.map((entry) =>
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
    homepage: 'https://www.postman.com',
    docsUrl: 'https://learning.postman.com/docs/getting-started/overview/',
    apiDocsUrl: 'https://learning.postman.com/api-docs/api-reference/overview/',
  },
});
