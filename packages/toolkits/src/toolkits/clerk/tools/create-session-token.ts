// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, compact } from './client.js';

export const clerkCreateSessionToken = tool({
  description:
    'Creates a session token for an active Clerk session — the standard way to let a backend act "as" that signed-in user. Optionally pass a JWT template name to mint a template token (for third-party services). The token is short-lived and sensitive: never log or expose it.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    sessionId: z.string().describe('Active session ID (sess_...)'),
    templateName: z
      .string()
      .optional()
      .describe('JWT template name to use instead of the default session token'),
    expiresInSeconds: z.number().optional().describe('Token lifetime in seconds'),
  }),
  execute: async ({ clerkToken, sessionId, templateName, expiresInSeconds }) => {
    const path = templateName
      ? `/sessions/${sessionId}/tokens/${encodeURIComponent(templateName)}`
      : `/sessions/${sessionId}/tokens`;
    const result = await clerkRequest(clerkToken, path, {
      method: 'POST',
      body: compact({ expires_in_seconds: expiresInSeconds }),
    });
    if (result.error) return result;
    // The response is { object: "token", jwt: "..." } — keep it out of casual logs.
    return { token: result.data?.jwt ?? result.data, sessionId };
  },
});
