import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { FIGMA_ICON } from './icon.js';
import { figmaTools } from './tools/index.js';

export default defineToolkit({
  id: 'figma',
  displayName: 'Figma',
  shortDescription: 'Read files, export assets, manage comments, variables, webhooks, and libraries in Figma.',
  category: 'Design & Creative Tools',
  icon: FIGMA_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'figmaToken',
    provider: {
      slug: 'figma',
      env: { clientId: 'FIGMA_CLIENT_ID', clientSecret: 'FIGMA_CLIENT_SECRET' },
      authorizeUrl: 'https://www.figma.com/oauth',
      tokenUrl: 'https://api.figma.com/v1/oauth/token',
      scopes: [
        'file_content:read',
        'file_metadata:read',
        'file_comments:write',
        'file_variables:read',
        'file_variables:write',
        'file_dev_resources:read',
        'file_dev_resources:write',
        'file_versions:read',
        'files:read',
        'library_content:read',
        'library_analytics:read',
        'projects:read',
        'webhooks:read',
        'webhooks:write',
        'team_library_content:read',
        'org:activity_log_read',
      ],
      exchangeStyle: 'form',
      extraAuthParams: {},
      connectDescription: 'Connect Figma to read designs, export assets, and manage libraries.',
      callbackPath: '/api/auth/figma/callback',
      stateCookie: 'figma_oauth_state',
    },
  },
  allowedHosts: ['api.figma.com', 'www.figma.com'],
  tools: figmaTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.8',
    homepage: 'https://www.figma.com',
    docsUrl: 'https://developers.figma.com/docs/rest-api',
  },
});
