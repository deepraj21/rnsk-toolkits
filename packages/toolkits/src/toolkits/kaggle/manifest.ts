import { defineToolkit, defineTool } from '../../core/define.js';
import { KAGGLE_ICON } from './icon.js';
import { kaggleTools } from './tools/index.js';

export default defineToolkit({
  id: 'kaggle',
  displayName: 'Kaggle',
  shortDescription: 'Kaggle competitions, datasets, models, and kernels.',
  category: 'Data & Analytics',
  icon: KAGGLE_ICON,
  auth: {
    type: 'basic_auth',
    tokenField: 'kaggleCredentials',
    provider: {
      connectDescription:
        'Connect Kaggle with your username and API key as "username:key" (create a key at https://www.kaggle.com/account). Calls are sent with HTTP Basic auth to www.kaggle.com/api/v1.',
    },
  },
  allowedHosts: ['www.kaggle.com'],
  tools: kaggleTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope,
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://www.kaggle.com',
    docsUrl: 'https://www.kaggle.com/docs/api',
    apiDocsUrl: 'https://www.kaggle.com/docs/api/v1',
  },
});
