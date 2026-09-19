import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GPHOTOS_ICON } from './icon.js';
import { googlePhotosTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-photos',
  displayName: 'Google Photos',
  shortDescription: 'Manage Google Photos albums, media items, uploads, and enrichment.',
  category: 'Entertainment & Media',
  icon: GPHOTOS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googlePhotosToken',
    provider: {
      slug: 'google-photos',
      env: { clientId: 'GOOGLE_PHOTOS_CLIENT_ID', clientSecret: 'GOOGLE_PHOTOS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/photoslibrary',
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'https://www.googleapis.com/auth/photoslibrary.appendonly',
        'https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata',
        'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Photos to manage albums, uploads, and app-created media.',
      callbackPath: '/api/auth/google-photos/callback',
      stateCookie: 'google_photos_oauth_state',
    },
  },
  allowedHosts: ['photoslibrary.googleapis.com'],
  tools: googlePhotosTools.map((entry) =>
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
    homepage: 'https://photos.google.com',
    docsUrl: 'https://developers.google.com/photos',
  },
});
