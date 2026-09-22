// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseListProfiles = tool({
  description: "List the connected Wise account's personal or business profiles and return the profile IDs required by profile-scoped tools.",
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
  }),
  execute: async ({ wiseApiKey }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch('/v2/profiles', {
        wiseApiKey,
        method: 'GET',
      });
      if (!res.ok) return { error: 'Failed to list profiles', details: res.data };
      const d: any = res.data;
      const profiles = Array.isArray(d) ? d : d.profiles ?? [];
      return { profiles, raw: d };
    } catch (e) {
      return { error: 'Error listing profiles', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
