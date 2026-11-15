// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dropboxRpc } from './client.js';

export const dropboxGetSpaceUsage = tool({
  description:
    'Gets the storage usage of the connected Dropbox account — total used, quota, and the space breakdown by allocation.',
  inputSchema: z.object({
    dropboxToken: z.string().optional().describe('Dropbox access token (injected by system)'),
  }),
  execute: async ({ dropboxToken }) => {
    const result = await dropboxRpc(dropboxToken, '/users/get_space_usage', {});
    if (result.error) return result;

    return result.data;
  },
});
