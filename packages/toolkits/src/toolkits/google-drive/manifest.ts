import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GDRIVE_ICON } from './icon.js';
import { googleDriveTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-drive',
  displayName: 'Google Drive',
  shortDescription: 'List, search, upload, and manage files and folders in Google Drive.',
  category: 'Document & File Management',
  icon: GDRIVE_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleDriveToken',
    provider: {
      slug: 'google-drive',
      env: { clientId: 'GOOGLE_DRIVE_CLIENT_ID', clientSecret: 'GOOGLE_DRIVE_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/drive'],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Drive to browse, upload, and manage files and folders.',
      callbackPath: '/api/auth/google-drive/callback',
      stateCookie: 'google_drive_oauth_state',
    },
  },
  allowedHosts: ['www.googleapis.com'],
  tools: googleDriveTools.map((entry) =>
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
