import { defineToolkit, defineTool } from '../../core/define.js';
import { ONENOTE_ICON } from './icon.js';
import { onenoteTools } from './tools/index.js';

export default defineToolkit({
  id: 'onenote',
  displayName: 'OneNote',
  shortDescription:
    'OneNote notebooks, sections, and pages via Microsoft Graph: browse, search, create, and edit notes.',
  category: 'Document & File Management',
  icon: ONENOTE_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'onenoteToken',
    provider: {
      slug: 'onenote',
      env: { clientId: 'ONENOTE_CLIENT_ID', clientSecret: 'ONENOTE_CLIENT_SECRET' },
      authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: ['openid', 'profile', 'offline_access', 'Notes.ReadWrite'],
      exchangeStyle: 'form',
      extraAuthParams: { prompt: 'consent' },
      connectDescription:
        'Connect OneNote with your Microsoft account to browse notebooks, search pages, and create or edit notes.',
      callbackPath: '/api/auth/onenote/callback',
      stateCookie: 'onenote_oauth_state',
    },
  },
  allowedHosts: ['graph.microsoft.com'],
  tools: onenoteTools.map((entry) =>
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
    homepage: 'https://www.onenote.com',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/onenote-api-overview',
    apiDocsUrl: 'https://learn.microsoft.com/en-us/graph/onenote-get-content',
  },
});
