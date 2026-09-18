import { defineToolkit, defineTool } from '../../core/define.js';
import { GSEARCHCONSOLE_ICON } from './icon.js';
import { googleSearchConsoleTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-search-console',
  displayName: 'Google Search Console',
  shortDescription:
    'Manage Search Console properties, sitemaps, URL inspection, and search analytics queries.',
  category: 'Data & Analytics',
  icon: GSEARCHCONSOLE_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleSearchConsoleToken',
    provider: {
      slug: 'google-search-console',
      env: {
        clientId: 'GOOGLE_SEARCH_CONSOLE_CLIENT_ID',
        clientSecret: 'GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET',
      },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/webmasters',
        'https://www.googleapis.com/auth/webmasters.readonly',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription:
        'Connect Google Search Console to manage sites, sitemaps, inspect URLs, and query search analytics.',
      callbackPath: '/api/auth/google-search-console/callback',
      stateCookie: 'google_search_console_oauth_state',
    },
  },
  allowedHosts: ['www.googleapis.com', 'searchconsole.googleapis.com'],
  tools: googleSearchConsoleTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.8',
    homepage: 'https://search.google.com/search-console',
    docsUrl: 'https://developers.google.com/webmaster-tools/v1/api_reference_index',
  },
});
