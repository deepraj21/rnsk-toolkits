import { defineToolkit, defineTool } from '../../core/define.js';
import { CIRCLE_CI_ICON } from './icon.js';
import { circleCiTools } from './tools/index.js';

export default defineToolkit({
  id: 'circle-ci',
  displayName: 'CircleCI',
  shortDescription:
    'CircleCI pipelines, workflows, jobs, artifacts, and project settings via API v2.',
  category: 'Developer Tools & DevOps',
  icon: CIRCLE_CI_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'circleCiCredentials',
    provider: {
      fields: ['apiToken', 'baseUrl'],
      connectDescription:
        'Connect CircleCI with JSON {"apiToken":"CCIPAT_..."} from User Settings > Personal API Tokens. Optional "baseUrl" for CircleCI Server (default https://circleci.com). Requests send the Circle-Token header to /api/v2.',
    },
  },
  allowedHosts: ['circleci.com'],
  tools: circleCiTools.map((entry) =>
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
    homepage: 'https://circleci.com',
    docsUrl: 'https://circleci.com/docs/api/',
    apiDocsUrl: 'https://circleci.com/docs/api/',
  },
});
