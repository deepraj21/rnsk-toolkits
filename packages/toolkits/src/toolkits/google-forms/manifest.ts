import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GFORMS_ICON } from './icon.js';
import { googleFormsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-forms',
  displayName: 'Google Forms',
  shortDescription: 'Create, read, update, and manage Google Forms and their responses.',
  category: 'Document & File Management',
  icon: GFORMS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleFormsToken',
    provider: {
      slug: 'google-forms',
      env: { clientId: 'GOOGLE_FORMS_CLIENT_ID', clientSecret: 'GOOGLE_FORMS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/forms.body.readonly',
        'https://www.googleapis.com/auth/forms.responses.readonly',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Forms to create forms, manage questions, and read responses.',
      callbackPath: '/api/auth/google-forms/callback',
      stateCookie: 'google_forms_oauth_state',
    },
  },
  allowedHosts: ['forms.googleapis.com', 'www.googleapis.com'],
  tools: googleFormsTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.6' },
});
