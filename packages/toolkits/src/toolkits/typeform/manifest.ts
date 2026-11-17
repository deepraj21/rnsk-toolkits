import { defineToolkit, defineTool } from '../../core/define.js';
import { TYPEFORM_ICON } from './icon.js';
import { typeformTools } from './tools/index.js';

export default defineToolkit({
  id: 'typeform',
  displayName: 'Typeform',
  shortDescription:
    'Conversational forms and surveys on Typeform — build typeforms, pull responses, and manage webhooks, themes, images, and workspaces.',
  category: 'Document & File Management',
  icon: TYPEFORM_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'typeformToken',
    provider: {
      slug: 'typeform',
      env: { clientId: 'TYPEFORM_CLIENT_ID', clientSecret: 'TYPEFORM_CLIENT_SECRET' },
      authorizeUrl: 'https://api.typeform.com/oauth/authorize',
      tokenUrl: 'https://api.typeform.com/oauth/token',
      scopes: [
        'offline',
        'accounts:read',
        'forms:read',
        'forms:write',
        'images:read',
        'images:write',
        'themes:read',
        'themes:write',
        'workspaces:read',
        'workspaces:write',
        'responses:read',
        'responses:write',
        'webhooks:read',
        'webhooks:write',
      ],
      scopeSeparator: ' ',
      exchangeStyle: 'form',
      connectDescription:
        "Connect Typeform with the authorization code flow. Register an app under Developer Apps in the Typeform admin panel (admin.typeform.com → organization menu → Developer Apps), set the redirect URI to this app's /api/auth/typeform/callback, and provide the Client ID and Client Secret — Typeform tokens expire after 1 week and are refreshed by the host (the offline scope is requested for refresh tokens).",
      callbackPath: '/api/auth/typeform/callback',
      stateCookie: 'typeform_oauth_state',
    },
  },
  allowedHosts: ['api.typeform.com'],
  tools: typeformTools.map((entry) =>
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
    homepage: 'https://www.typeform.com',
    docsUrl: 'https://www.typeform.com/developers/',
  },
});
