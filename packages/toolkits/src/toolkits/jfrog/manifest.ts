import { defineToolkit, defineTool } from '../../core/define.js';
import { JFROG_ICON } from './icon.js';
import { jfrogTools } from './tools/index.js';

export default defineToolkit({
  id: 'jfrog',
  displayName: 'JFrog',
  shortDescription:
    'Manage the JFrog Platform: repositories, artifacts, search, builds, Docker, security, tokens, projects, and webhooks.',
  category: 'Developer Tools & DevOps',
  icon: JFROG_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'jfrogCredentials',
    provider: {
      fields: ['baseUrl', 'accessToken', 'apiKey', 'username', 'password'],
      connectDescription:
        'Connect JFrog with your Platform URL (e.g. https://mycompany.jfrog.io) plus an access token (Authorization: Bearer, preferred), an API key (X-JFrog-Art-Api header), or username+password (Basic). Artifactory calls go to {url}/artifactory/api, Access tokens and projects to {url}/access/api, webhooks to {url}/event/api.',
    },
  },
  tools: jfrogTools.map((entry) =>
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
    homepage: 'https://jfrog.com',
    docsUrl: 'https://docs.jfrog.com',
    apiDocsUrl: 'https://docs.jfrog.com/integrations/docs/jfrog-api',
  },
});
