import { defineToolkit, defineTool } from '../../core/define.js';
import { ZOOM_ICON } from './icon.js';
import { zoomTools } from './tools/index.js';

export default defineToolkit({
  id: 'zoom',
  displayName: 'Zoom',
  shortDescription:
    'Schedule, update, and end Zoom meetings, manage registrants, and fetch cloud recordings and webinars.',
  category: 'Scheduling & Booking',
  icon: ZOOM_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'zoomToken',
    provider: {
      slug: 'zoom',
      env: { clientId: 'ZOOM_CLIENT_ID', clientSecret: 'ZOOM_CLIENT_SECRET' },
      authorizeUrl: 'https://zoom.us/oauth/authorize',
      tokenUrl: 'https://zoom.us/oauth/token',
      scopes: [
        'meeting:read',
        'meeting:write',
        'recording:read',
        'recording:write',
        'user:read',
        'webinar:read',
        'webinar:write',
      ],
      exchangeStyle: 'form',
      connectDescription:
        'Connect Zoom to schedule and manage meetings, end live calls, register attendees, and access cloud recordings and webinars.',
      callbackPath: '/api/auth/zoom/callback',
      stateCookie: 'zoom_oauth_state',
    },
  },
  allowedHosts: ['api.zoom.us'],
  tools: zoomTools.map((entry) =>
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
    homepage: 'https://zoom.us',
    docsUrl: 'https://developers.zoom.us/docs/api/meetings',
  },
});
