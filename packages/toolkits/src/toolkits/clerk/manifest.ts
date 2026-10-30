import { defineToolkit, defineTool } from '../../core/define.js';
import { CLERK_ICON } from './icon.js';
import { clerkTools } from './tools/index.js';

export default defineToolkit({
  id: 'clerk',
  displayName: 'Clerk',
  shortDescription:
    'Manage Clerk users, sessions, and organizations — look up accounts, create or update users, set metadata, ban users, revoke sessions, mint session tokens, manage org members and invitations, and mint sign-in tokens.',
  category: 'Developer Tools & DevOps',
  icon: CLERK_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'clerkToken',
    provider: {
      connectDescription:
        'Connect Clerk with your instance secret key. In the Clerk Dashboard: API keys, then copy the Secret Key (sk_test_... for development instances, sk_live_... for production) and paste it here. Keep it private — this key can read and modify every user in your instance.',
    },
  },
  allowedHosts: ['api.clerk.com'],
  tools: clerkTools.map((entry) =>
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
    homepage: 'https://clerk.com',
    docsUrl: 'https://clerk.com/docs/reference/backend-api',
  },
});
