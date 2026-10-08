import { defineToolkit, defineTool } from '../../core/define.js';
import { LAUNCHDARKLY_ICON } from './icon.js';
import { launchdarklyTools } from './tools/index.js';

export default defineToolkit({
  id: 'launchdarkly',
  displayName: 'LaunchDarkly',
  shortDescription:
    'Feature flags, environments, projects, and account members via the LaunchDarkly REST API.',
  category: 'Developer Tools & DevOps',
  icon: LAUNCHDARKLY_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'launchdarklyApiToken',
    provider: {
      connectDescription:
        'Connect LaunchDarkly with an API access token from Account settings > Authorization (personal or service token with least privilege). Calls send Authorization: <token> to app.launchdarkly.com/api/v2.',
    },
  },
  allowedHosts: ['app.launchdarkly.com'],
  tools: launchdarklyTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.16',
    homepage: 'https://launchdarkly.com',
    docsUrl: 'https://launchdarkly.com/docs/api',
    apiDocsUrl: 'https://launchdarkly.com/docs/api',
  },
});
