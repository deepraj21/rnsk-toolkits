import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { YOUTUBE_ICON } from './icon.js';
import { youtubeTools } from './tools/index.js';

export default defineToolkit({
  id: 'youtube',
  displayName: 'YouTube',
  shortDescription: 'Search, upload, and manage YouTube videos, playlists, channels, and comments.',
  category: 'Entertainment & Media',
  icon: YOUTUBE_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'youtubeToken',
    provider: {
      slug: 'youtube',
      env: { clientId: 'YOUTUBE_CLIENT_ID', clientSecret: 'YOUTUBE_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtubepartner',
        'https://www.googleapis.com/auth/youtubepartner-channel-audit',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect YouTube to search, upload, and manage videos, playlists, and channels.',
      callbackPath: '/api/auth/youtube/callback',
      stateCookie: 'youtube_oauth_state',
    },
  },
  allowedHosts: ['www.googleapis.com', 'youtube.googleapis.com'],
  tools: youtubeTools.map((entry) =>
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
    homepage: 'https://www.youtube.com',
    docsUrl: 'https://developers.google.com/youtube/v3/docs',
  },
});
