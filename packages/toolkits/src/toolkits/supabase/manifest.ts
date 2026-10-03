import { defineToolkit, defineTool } from '../../core/define.js';
import { SUPABASE_ICON } from './icon.js';
import { supabaseTools } from './tools/index.js';

export default defineToolkit({
  id: 'supabase',
  displayName: 'Supabase',
  shortDescription:
    'Manage Supabase projects, Postgres databases, auth, storage, edge functions and branches.',
  category: 'Developer Tools & DevOps',
  icon: SUPABASE_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'supabaseAccessToken',
    provider: {
      connectDescription:
        'Connect Supabase with a personal access token (starts with sbp_). Generate one from Supabase Dashboard > Account > Access Tokens. All Management API calls send it as Authorization: Bearer <token> to api.supabase.com. Scoped tokens only permit their granted permissions. Project-data tools (PostgREST reads, function invocation, TUS uploads) target https://<project-ref>.supabase.co and resolve the project publishable or secret key through the Management API automatically.',
    },
  },
  tools: supabaseTools.map((entry) =>
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
    since: '0.0.14',
    homepage: 'https://supabase.com',
    docsUrl: 'https://supabase.com/docs/reference/api/introduction',
    apiDocsUrl: 'https://supabase.com/docs/reference/api/introduction',
  },
});
