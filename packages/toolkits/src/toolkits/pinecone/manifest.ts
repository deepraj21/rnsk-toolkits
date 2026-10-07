import { defineToolkit, defineTool } from '../../core/define.js';
import { PINECONE_ICON } from './icon.js';
import { pineconeTools } from './tools/index.js';

export default defineToolkit({
  id: 'pinecone',
  displayName: 'Pinecone',
  shortDescription:
    'Vector search with Pinecone: indexes, vectors, namespaces, integrated records, inference, backups, and admin.',
  category: 'AI & Machine Learning',
  icon: PINECONE_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'pineconeApiKey',
    provider: {
      in: 'header',
      name: 'Api-Key',
      connectDescription:
        'Connect Pinecone with an API key from the Pinecone console. Calls send it as the Api-Key header with X-Pinecone-Api-Version. Data-plane tools also need the index host (from Describe Index).',
    },
  },
  tools: pineconeTools.map((entry) =>
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
    homepage: 'https://www.pinecone.io',
    docsUrl: 'https://docs.pinecone.io/guides/get-started/overview',
    apiDocsUrl: 'https://docs.pinecone.io/reference/api/introduction',
  },
});
