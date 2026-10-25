import { defineToolkit, defineTool } from '../../core/define.js';
import { SHAREPOINT_ICON } from './icon.js';
import { sharepointTools } from './tools/index.js';

export default defineToolkit({
  id: 'sharepoint',
  displayName: 'SharePoint',
  shortDescription:
    'SharePoint sites, lists, and document libraries via Microsoft Graph: browse sites, manage list rows, work with files, and control sharing.',
  category: 'Document & File Management',
  icon: SHAREPOINT_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'sharepointToken',
    provider: {
      slug: 'sharepoint',
      env: { clientId: 'SHAREPOINT_CLIENT_ID', clientSecret: 'SHAREPOINT_CLIENT_SECRET' },
      authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: [
        'openid',
        'profile',
        'offline_access',
        'User.Read',
        'Sites.Read.All',
        'Sites.ReadWrite.All',
        'Files.Read.All',
        'Files.ReadWrite.All',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { prompt: 'consent' },
      connectDescription:
        'Connect SharePoint with your Microsoft account to find sites, browse and edit lists, manage files in document libraries, and share or revoke access.',
      callbackPath: '/api/auth/sharepoint/callback',
      stateCookie: 'sharepoint_oauth_state',
    },
  },
  allowedHosts: ['graph.microsoft.com'],
  tools: sharepointTools.map((entry) =>
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
    homepage: 'https://www.microsoft.com/en-us/microsoft-365/sharepoint',
    docsUrl: 'https://learn.microsoft.com/en-us/sharepoint/',
    apiDocsUrl:
      'https://learn.microsoft.com/en-us/graph/api/resources/sharepoint?view=graph-rest-1.0',
  },
});
