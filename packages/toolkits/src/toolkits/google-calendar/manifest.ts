import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GCAL_ICON } from './icon.js';
import { googleCalendarTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-calendar',
  displayName: 'Google Calendar',
  shortDescription: 'List and create calendar events.',
  category: 'Scheduling & Booking',
  icon: GCAL_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleCalendarToken',
    provider: {
      slug: 'googlecalendar',
      env: {
        clientId: 'GOOGLE_CALENDAR_CLIENT_ID',
        clientSecret: 'GOOGLE_CALENDAR_CLIENT_SECRET',
        clientIdFallback: 'GMAIL_CLIENT_ID',
        clientSecretFallback: 'GMAIL_CLIENT_SECRET',
      },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Integrate Google Calendar to view and manage events.',
      callbackPath: '/api/auth/googlecalendar/callback',
      stateCookie: 'google_calendar_oauth_state',
    },
  },
  allowedHosts: ['www.googleapis.com'],
  tools: googleCalendarTools.map((entry) =>
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
