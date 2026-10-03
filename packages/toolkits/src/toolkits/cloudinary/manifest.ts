import { defineToolkit, defineTool } from '../../core/define.js';
import { CLOUDINARY_ICON } from './icon.js';
import { cloudinaryTools } from './tools/index.js';

export default defineToolkit({
  id: 'cloudinary',
  displayName: 'Cloudinary',
  shortDescription:
    'Upload, transform, manage, and deliver images, videos, and live streams via the Cloudinary APIs.',
  category: 'Design & Creative Tools',
  icon: CLOUDINARY_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'cloudinaryCredentials',
    provider: {
      fields: ['cloudName', 'apiKey', 'apiSecret'],
      connectDescription:
        'Connect Cloudinary with your cloud name plus API key and secret from Console Settings > API Keys. Admin/Search/Analytics/Live APIs use Basic auth; Upload API calls are SHA-1 signed server-side. Keep the secret server-side only.',
    },
  },
  allowedHosts: ['api.cloudinary.com'],
  tools: cloudinaryTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.14',
    homepage: 'https://cloudinary.com',
    docsUrl: 'https://cloudinary.com/documentation',
    apiDocsUrl: 'https://cloudinary.com/documentation/cloudinary_references',
  },
});
