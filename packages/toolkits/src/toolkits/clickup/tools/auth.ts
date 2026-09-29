// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupGetAccessToken = tool({
  description:
    'Exchanges a ClickUp OAuth 2.0 authorization code (obtained after user consent) for an access token.',
  inputSchema: z.object({
    code: z
      .string()
      .describe(
        "Authorization code from ClickUp's authorization server, typically a query parameter to your redirect URI after user consent.",
      ),
    clientId: z.string().describe('Client ID for your registered ClickUp OAuth application.'),
    clientSecret: z
      .string()
      .describe('Client Secret for your registered ClickUp OAuth application.'),
  }),
  execute: async ({ code, clientId, clientSecret }) => {
    return cuPost(undefined, 'V2', '/oauth/token', {
      query: { client_id: clientId, client_secret: clientSecret, code },
    });
  },
});
