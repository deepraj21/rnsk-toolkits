import { defineToolkit, defineTool } from '../../core/define.js';
import { MONGODB_ICON } from './icon.js';
import { mongodbTools } from './tools/index.js';

export default defineToolkit({
  id: 'mongodb',
  displayName: 'MongoDB',
  shortDescription: 'Query and manage MongoDB databases, collections, documents, aggregations and indexes.',
  category: 'Data & Analytics',
  icon: MONGODB_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'mongodbCredentials',
    provider: {
      fields: ['connectionString', 'defaultDatabase'],
      connectDescription:
        'Connect any MongoDB deployment (Atlas, self-hosted, DocumentDB-compatible) with a connection string, e.g. mongodb+srv://user:password@cluster.mongodb.net. Set defaultDatabase to skip passing it on every call. Clients are reused across calls via the official Node.js driver.',
    },
  },
  tools: mongodbTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://www.mongodb.com',
    docsUrl: 'https://www.mongodb.com/docs/drivers/node/current/',
  },
});
