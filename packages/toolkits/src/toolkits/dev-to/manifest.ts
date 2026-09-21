import { defineToolkit, defineTool } from '../../core/define.js';
import { DEV_TO_ICON } from './icon.js';
import { devToTools } from './tools/index.js';

export default defineToolkit({
  id: 'dev-to',
  displayName: 'DEV',
  shortDescription: 'Publish and browse DEV Community articles, comments, listings, and profiles.',
  category: 'Social Media',
  icon: DEV_TO_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'devToApiKey',
    provider: {
      in: 'header',
      name: 'api-key',
      connectDescription:
        'Connect DEV with an API key. Generate one from DEV Settings > Extensions > DEV Community API Keys. Public reads (articles, comments, users, tags, listings) also work without a key.',
    },
  },
  allowedHosts: ['dev.to'],
  tools: devToTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: (entry as { requiredAuth?: 'devToApiKey' }).requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://dev.to',
    docsUrl: 'https://developers.forem.com/api/v1',
    apiDocsUrl: 'https://developers.forem.com/api/v1',
  },
});
