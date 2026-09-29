import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { DRIBBBLE_ICON } from './icon.js';
import { dribbbleTools } from './tools/index.js';

export default defineToolkit({
  id: 'dribbble',
  displayName: 'Dribbble',
  shortDescription: 'Shots, attachments, projects and user profile for designers.',
  category: 'Design & Creative Tools',
  icon: DRIBBBLE_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'dribbbleToken',
    provider: {
      slug: 'dribbble',
      env: { clientId: 'DRIBBBLE_CLIENT_ID', clientSecret: 'DRIBBBLE_CLIENT_SECRET' },
      authorizeUrl: 'https://dribbble.com/oauth/authorize',
      tokenUrl: 'https://dribbble.com/oauth/token',
      scopes: ['public', 'upload'],
      exchangeStyle: 'form',
      connectDescription:
        'Connect Dribbble to manage your shots, attachments and projects. Register an application at Dribbble Account Settings > Applications to get a client ID and secret. Request the public scope for reads and the upload scope for publishing. Tokens are sent as Authorization: Bearer to api.dribbble.com.',
      callbackPath: '/api/auth/dribbble/callback',
      stateCookie: 'dribbble_oauth_state',
    },
  },
  allowedHosts: ['api.dribbble.com', 'dribbble.com'],
  tools: dribbbleTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as { scope?: 'read' | 'write' | 'delete' }).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.13',
    homepage: 'https://dribbble.com',
    docsUrl: 'https://developer.dribbble.com/v2/',
    apiDocsUrl: 'https://developer.dribbble.com/v2/',
  },
});
