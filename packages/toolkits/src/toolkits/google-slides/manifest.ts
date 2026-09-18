import { defineToolkit, defineTool } from '../../core/define.js';
import { GSLIDES_ICON } from './icon.js';
import { googleSlidesTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-slides',
  displayName: 'Google Slides',
  shortDescription:
    'Create, read, and update Google Slides presentations, including Markdown-based slide generation.',
  category: 'Document & File Management',
  icon: GSLIDES_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleSlidesToken',
    provider: {
      slug: 'googleslides',
      env: { clientId: 'GOOGLE_SLIDES_CLIENT_ID', clientSecret: 'GOOGLE_SLIDES_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/presentations.readonly',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription:
        'Connect Google Slides to create presentations, copy templates, and manage slide content.',
      callbackPath: '/api/auth/googleslides/callback',
      stateCookie: 'google_slides_oauth_state',
    },
  },
  allowedHosts: ['slides.googleapis.com', 'www.googleapis.com'],
  tools: googleSlidesTools.map((entry) =>
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
    homepage: 'https://slides.google.com',
    docsUrl: 'https://developers.google.com/slides/api/reference/rest',
  },
});
