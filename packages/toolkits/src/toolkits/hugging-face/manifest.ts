import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { HUGGING_FACE_ICON } from './icon.js';
import { huggingFaceTools } from './tools/index.js';

export default defineToolkit({
  id: 'hugging-face',
  displayName: 'Hugging Face',
  shortDescription: 'Models, datasets, spaces, papers, inference, and discussions on the Hugging Face Hub.',
  category: 'AI & Machine Learning',
  icon: HUGGING_FACE_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'huggingFaceToken',
    provider: {
      slug: 'hugging-face',
      env: { clientId: 'HUGGING_FACE_CLIENT_ID', clientSecret: 'HUGGING_FACE_CLIENT_SECRET' },
      authorizeUrl: 'https://huggingface.co/oauth/authorize',
      tokenUrl: 'https://huggingface.co/oauth/token',
      scopes: ['openid', 'profile', 'read-repos', 'write-repos', 'manage-repos', 'inference-api'],
      exchangeStyle: 'form',
      connectDescription:
        'Connect Hugging Face to browse models, datasets, spaces, and papers, run inference, and manage repos, discussions, and webhooks.',
      callbackPath: '/api/auth/hugging-face/callback',
      stateCookie: 'hugging_face_oauth_state',
    },
  },
  allowedHosts: [
    'huggingface.co',
    'datasets-server.huggingface.co',
    'router.huggingface.co',
    'api-inference.huggingface.co',
    'api.endpoints.huggingface.cloud',
  ],
  tools: huggingFaceTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.8' },
});
