import { defineToolkit, defineTool } from '../../core/define.js';
import { DROPBOX_ICON } from './icon.js';
import { dropboxTools } from './tools/index.js';

export default defineToolkit({
  id: 'dropbox',
  displayName: 'Dropbox',
  shortDescription:
    'Manage Dropbox files and folders — list, search, upload, download, move, copy, restore revisions, share links, manage shared folder members, and read account storage.',
  category: 'Document & File Management',
  icon: DROPBOX_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'dropboxToken',
    provider: {
      connectDescription:
        'Connect Dropbox with an access token. Create an app at https://www.dropbox.com/developers/app/console (Scoped access), grant files.content.read/write, files.metadata.read, sharing.read/write and account_info.read permissions, then generate a token on the Permissions tab (or complete the OAuth flow for a refreshable token). The token is sent as an Authorization: Bearer header on every api.dropboxapi.com and content.dropboxapi.com request. Keep it private — it can read and change every file the account can see. Console-generated tokens can expire; regenerate or refresh them in the App Console when they do.',
    },
  },
  allowedHosts: ['api.dropboxapi.com', 'content.dropboxapi.com'],
  tools: dropboxTools.map((entry) =>
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
    homepage: 'https://www.dropbox.com',
    docsUrl: 'https://docs.dropboxapi.com/dropbox-api',
  },
});
