import { defineToolkit, defineTool } from '../../core/define.js';
import { GMEET_ICON } from './icon.js';
import { googleMeetTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-meet',
  displayName: 'Google Meet',
  shortDescription:
    'Create and manage Google Meet spaces, conference records, participants, recordings, and transcripts.',
  category: 'Scheduling & Booking',
  icon: GMEET_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleMeetToken',
    provider: {
      slug: 'googlemeet',
      env: { clientId: 'GOOGLE_MEET_CLIENT_ID', clientSecret: 'GOOGLE_MEET_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/meetings.space.created',
        'https://www.googleapis.com/auth/meetings.space.readonly',
        'https://www.googleapis.com/auth/meetings.space.settings',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription:
        'Connect Google Meet to create meeting spaces, manage conferences, and access recordings and transcripts.',
      callbackPath: '/api/auth/googlemeet/callback',
      stateCookie: 'google_meet_oauth_state',
    },
  },
  allowedHosts: ['meet.googleapis.com'],
  tools: googleMeetTools.map((entry) =>
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
    homepage: 'https://meet.google.com',
    docsUrl: 'https://developers.google.com/meet/api/reference/rest/v2',
  },
});
