import { defineToolkit, defineTool } from '../../core/define.js';
import { OUTLOOK_ICON } from './icon.js';
import { outlookTools } from './tools/index.js';

export default defineToolkit({
  id: 'outlook',
  displayName: 'Outlook',
  shortDescription:
    'Outlook mail, calendar, and contacts via Microsoft Graph: send and organize email, schedule meetings, and manage people.',
  category: 'Collaboration & Communication',
  icon: OUTLOOK_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'outlookToken',
    provider: {
      slug: 'outlook',
      env: { clientId: 'OUTLOOK_CLIENT_ID', clientSecret: 'OUTLOOK_CLIENT_SECRET' },
      authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: [
        'openid',
        'profile',
        'offline_access',
        'User.Read',
        'Mail.ReadWrite',
        'Mail.Send',
        'Calendars.ReadWrite',
        'Contacts.ReadWrite',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { prompt: 'consent' },
      connectDescription:
        'Connect Outlook with your Microsoft account to read, send, and organize email, manage calendars and meetings, and work with contacts and people.',
      callbackPath: '/api/auth/outlook/callback',
      stateCookie: 'outlook_oauth_state',
    },
  },
  allowedHosts: ['graph.microsoft.com'],
  tools: outlookTools.map((entry) =>
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
    homepage: 'https://outlook.live.com',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview',
    apiDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview',
  },
});
