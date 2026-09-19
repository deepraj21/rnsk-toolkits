import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GMAPS_ICON } from './icon.js';
import { googleMapsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-maps',
  displayName: 'Google Maps',
  shortDescription: 'Search places, geocode addresses, compute routes, and render map tiles.',
  category: 'Developer Tools & DevOps',
  icon: GMAPS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleMapsToken',
    provider: {
      slug: 'google-maps',
      env: { clientId: 'GOOGLE_MAPS_CLIENT_ID', clientSecret: 'GOOGLE_MAPS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/maps-platform.geocode',
        'https://www.googleapis.com/auth/maps-platform.geocode.address',
        'https://www.googleapis.com/auth/maps-platform.geocode.location',
        'https://www.googleapis.com/auth/maps-platform.geocode.place',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Maps for places, geocoding, routes, and tiles.',
      callbackPath: '/api/auth/google-maps/callback',
      stateCookie: 'google_maps_oauth_state',
    },
  },
  allowedHosts: [
    'places.googleapis.com',
    'routes.googleapis.com',
    'geocode.googleapis.com',
    'tile.googleapis.com',
    'aerialview.googleapis.com',
    'www.googleapis.com',
    'maps.googleapis.com',
  ],
  tools: googleMapsTools.map((entry) =>
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
    homepage: 'https://maps.google.com',
    docsUrl: 'https://developers.google.com/maps/documentation',
  },
});
