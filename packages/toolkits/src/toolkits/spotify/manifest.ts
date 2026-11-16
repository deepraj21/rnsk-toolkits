import { defineToolkit, defineTool } from '../../core/define.js';
import { SPOTIFY_ICON } from './icon.js';
import { spotifyTools } from './tools/index.js';

export default defineToolkit({
  id: 'spotify',
  displayName: 'Spotify',
  shortDescription:
    'Music and podcasts on Spotify — search the catalog, manage playlists and your saved library, and control playback across devices.',
  category: 'Entertainment & Media',
  icon: SPOTIFY_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'spotifyToken',
    provider: {
      slug: 'spotify',
      env: { clientId: 'SPOTIFY_CLIENT_ID', clientSecret: 'SPOTIFY_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.spotify.com/authorize',
      tokenUrl: 'https://accounts.spotify.com/api/token',
      scopes: [
        'playlist-modify-private',
        'playlist-modify-public',
        'playlist-read-collaborative',
        'playlist-read-private',
        'ugc-image-upload',
        'user-follow-modify',
        'user-follow-read',
        'user-library-modify',
        'user-library-read',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-read-email',
        'user-read-playback-position',
        'user-read-playback-state',
        'user-read-private',
        'user-read-recently-played',
        'user-top-read',
      ],
      scopeSeparator: ' ',
      exchangeStyle: 'basic',
      connectDescription:
        'Connect Spotify with the authorization code flow. Create an app at https://developer.spotify.com/dashboard, set the redirect URI to this app\'s /api/auth/spotify/callback, and provide the Client ID and Client Secret — Spotify tokens expire after 1 hour and are refreshed by the host.',
      callbackPath: '/api/auth/spotify/callback',
      stateCookie: 'spotify_oauth_state',
    },
  },
  allowedHosts: ['api.spotify.com'],
  tools: spotifyTools.map((entry) =>
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
    homepage: 'https://www.spotify.com',
    docsUrl: 'https://developer.spotify.com/documentation/web-api',
  },
});
