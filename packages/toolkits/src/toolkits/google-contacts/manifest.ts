import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GCONTACTS_ICON } from './icon.js';
import { googleContactsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-contacts',
  displayName: 'Google Contacts',
  shortDescription: 'Create, search, and manage Google Contacts people, groups, and directory profiles.',
  category: 'CRM',
  icon: GCONTACTS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleContactsToken',
    provider: {
      slug: 'google-contacts',
      env: { clientId: 'GOOGLE_CONTACTS_CLIENT_ID', clientSecret: 'GOOGLE_CONTACTS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/contacts.other.readonly',
        'https://www.googleapis.com/auth/directory.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Contacts to manage people, groups, and directory profiles.',
      callbackPath: '/api/auth/google-contacts/callback',
      stateCookie: 'google_contacts_oauth_state',
    },
  },
  allowedHosts: ['people.googleapis.com'],
  tools: googleContactsTools.map((entry) =>
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
    homepage: 'https://contacts.google.com',
    docsUrl: 'https://developers.google.com/people',
  },
});
