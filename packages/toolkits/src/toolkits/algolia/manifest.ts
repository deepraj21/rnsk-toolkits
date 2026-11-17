import { defineToolkit, defineTool } from '../../core/define.js';
import { ALGOLIA_ICON } from './icon.js';
import { algoliaTools } from './tools/index.js';

export default defineToolkit({
  id: 'algolia',
  displayName: 'Algolia',
  shortDescription:
    'Hosted search API — full-text and faceted search, record indexing, index settings, query rules, synonyms, and API key management.',
  category: 'Analytics & Data',
  icon: ALGOLIA_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'algoliaCredentials',
    provider: {
      fields: ['applicationId', 'apiKey'],
      connectDescription:
        'Connect Algolia with your Application ID and an API key from the dashboard (dashboard.algolia.com → Settings → API keys). A search-only key can read; write and key-management tools need an admin key whose ACL includes the required permissions (addObject, editSettings, deleteIndex, listIndexes, browse, search, logs).',
    },
  },
  tools: algoliaTools.map((entry) =>
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
    since: '0.0.19',
    homepage: 'https://www.algolia.com',
    docsUrl: 'https://www.algolia.com/doc/rest-api/search/',
  },
});
