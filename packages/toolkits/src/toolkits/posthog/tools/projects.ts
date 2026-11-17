// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogGetUser = tool({
  description:
    'Gets the PostHog user account behind the connected personal API key — name, email, UUID, and the organizations and projects they belong to. Use this first to confirm which account is connected. Needs user:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
  }),
  execute: async ({ posthogCredentials }) => {
    const result = await posthogRequest(posthogCredentials, '/api/users/@me/');
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogListProjects = tool({
  description:
    'Lists the PostHog projects the connected account can access — id, name, organization, timezone, and project settings. Run this first: use the returned id as projectId for every other PostHog tool. Needs project:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
  }),
  execute: async ({ posthogCredentials }) => {
    const result = await posthogRequest(posthogCredentials, '/api/projects/');
    if (result.error) return result;

    return result.data ?? {};
  },
});
