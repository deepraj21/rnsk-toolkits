import { defineToolkit, defineTool } from '../../core/define.js';
import { DOCKER_HUB_ICON } from './icon.js';
import { dockerHubTools } from './tools/index.js';

export default defineToolkit({
  id: 'docker-hub',
  displayName: 'Docker Hub',
  shortDescription:
    'Manage Docker Hub repositories, organizations, teams, tags, and images.',
  category: 'Developer Tools & DevOps',
  icon: DOCKER_HUB_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'dockerHubCredentials',
    provider: {
      fields: ['username', 'personalAccessToken'],
      connectDescription:
        'Connect Docker Hub with your username and a personal access token (PAT). The toolkit exchanges the PAT for short-lived bearer tokens when calling the Hub API.',
    },
  },
  allowedHosts: ['hub.docker.com'],
  tools: dockerHubTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.7',
    homepage: 'https://hub.docker.com',
    docsUrl: 'https://docs.docker.com/reference/api/hub/latest/',
  },
});
