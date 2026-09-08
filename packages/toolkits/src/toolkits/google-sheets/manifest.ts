import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GSHEETS_ICON } from './icon.js';
import { googleSheetsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-sheets',
  displayName: 'Google Sheets',
  shortDescription: 'Spreadsheets, ranges, and values.',
  category: 'Document & File Management',
  icon: GSHEETS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleSheetsToken',
    provider: {
      slug: 'google-sheets',
      env: {
        clientId: 'GOOGLE_CLIENT_ID',
        clientSecret: 'GOOGLE_CLIENT_SECRET',
        clientIdFallback: 'GMAIL_CLIENT_ID',
        clientSecretFallback: 'GMAIL_CLIENT_SECRET',
      },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Sheets to read and write spreadsheet data.',
      callbackPath: '/api/auth/google-sheets/callback',
      stateCookie: 'google_sheets_oauth_state',
    },
  },
  allowedHosts: ['sheets.googleapis.com', 'www.googleapis.com'],
  tools: googleSheetsTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.2' },
});
