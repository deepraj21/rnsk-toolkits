import { defineToolkit, defineTool } from '../../core/define.js';
import { FIREBASE_ICON } from './icon.js';
import { firebaseTools } from './tools/index.js';

export default defineToolkit({
  id: 'firebase',
  displayName: 'Firebase',
  shortDescription:
    'Manage Firebase projects, apps, Firestore, Realtime Database, Auth, FCM, and Remote Config.',
  category: 'Developer Tools & DevOps',
  icon: FIREBASE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'firebaseCredentials',
    provider: {
      fields: ['projectId', 'serviceAccountKey', 'databaseUrl'],
      connectDescription:
        'Connect a Firebase service account: project ID plus the service account key JSON (Firebase console > Project settings > Service accounts > Generate new private key). OAuth tokens are minted automatically with cloud-platform scope. Optional databaseUrl overrides the Realtime Database host (defaults to https://<projectId>-default-rtdb.firebaseio.com).',
    },
  },
  tools: firebaseTools.map((entry) =>
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
    since: '0.0.13',
    homepage: 'https://firebase.google.com',
    docsUrl: 'https://firebase.google.com/docs/reference/rest',
  },
});
