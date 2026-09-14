import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GDOCS_ICON } from './icon.js';
import { googleDocsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-docs',
  displayName: 'Google Docs',
  shortDescription: 'Create, read, edit, and manage Google Docs documents.',
  category: 'Document & File Management',
  icon: GDOCS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleDocsToken',
    provider: {
      slug: 'google-docs',
      env: { clientId: 'GOOGLE_DOCS_CLIENT_ID', clientSecret: 'GOOGLE_DOCS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Docs to create, read, and edit documents.',
      callbackPath: '/api/auth/google-docs/callback',
      stateCookie: 'google_docs_oauth_state',
    },
  },
  allowedHosts: ['docs.googleapis.com', 'www.googleapis.com'],
  tools: googleDocsTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.5' },
});
