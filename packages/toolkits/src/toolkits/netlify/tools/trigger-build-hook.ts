// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyTriggerHook } from './client.js';

export const netlifyTriggerBuildHook = tool({
  description:
    'Triggers a Netlify build by POSTing to a build-hook URL (from listBuildHooks or createBuildHook, e.g. "https://api.netlify.com/hooks/..."). Starts a real build/deploy of the hook’s branch — confirm before triggering if a deploy is not expected.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    hookUrl: z
      .string()
      .describe('Build hook URL on api.netlify.com, as returned by createBuildHook/listBuildHooks'),
  }),
  execute: async ({ netlifyToken, hookUrl }) => {
    const result = await netlifyTriggerHook(netlifyToken, hookUrl);
    if (result.error) return result;
    return { triggered: true, message: result.message };
  },
});
