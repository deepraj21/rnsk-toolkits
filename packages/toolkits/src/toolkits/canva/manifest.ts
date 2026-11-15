import { defineToolkit, defineTool } from '../../core/define.js';
import { CANVA_ICON } from './icon.js';
import { canvaTools } from './tools/index.js';

export default defineToolkit({
  id: 'canva',
  displayName: 'Canva',
  shortDescription:
    'Design with Canva — create and copy designs, export PDFs/images/videos, manage folders and assets, import files, comment, autofill brand templates, and generate designs and images with AI.',
  category: 'Design & Creative Tools',
  icon: CANVA_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'canvaToken',
    provider: {
      connectDescription:
        'Connect Canva with an OAuth access token. Create an integration at https://www.canva.dev/ (Developer Dashboard), run the authorization code flow for the user, and paste the resulting access token here. The token is sent as an Authorization: Bearer header on every api.canva.com/rest request and acts on behalf of the Canva user — keep it private.',
    },
  },
  allowedHosts: ['api.canva.com'],
  tools: canvaTools.map((entry) =>
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
    homepage: 'https://www.canva.com',
    docsUrl: 'https://www.canva.dev/docs/connect',
  },
});
