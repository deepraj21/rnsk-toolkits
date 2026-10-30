import { defineToolkit, defineTool } from '../../core/define.js';
import { NETLIFY_ICON } from './icon.js';
import { netlifyTools } from './tools/index.js';

export default defineToolkit({
  id: 'netlify',
  displayName: 'Netlify',
  shortDescription:
    'Manage Netlify sites and deploys, roll back releases, trigger builds, read form submissions, manage environment variables, and purge the CDN cache.',
  category: 'Developer Tools & DevOps',
  icon: NETLIFY_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'netlifyToken',
    provider: {
      connectDescription:
        'Connect Netlify with a personal access token. In Netlify: click your avatar > User settings > Applications > Personal access tokens > New access token, then copy it here. The token acts as your user — pick the team-scoped token if you work in a team. Keep it private; it can deploy and delete sites.',
    },
  },
  allowedHosts: ['api.netlify.com'],
  tools: netlifyTools.map((entry) =>
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
    homepage: 'https://www.netlify.com',
    docsUrl: 'https://open-api.netlify.com',
  },
});
