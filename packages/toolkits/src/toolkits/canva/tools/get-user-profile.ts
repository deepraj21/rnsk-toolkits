// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest } from './client.js';

export const canvaGetUserProfile = tool({
  description:
    'Returns the profile of the user behind the connected Canva access token — currently the display name. Use to confirm whose account is connected.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
  }),
  execute: async ({ canvaToken }) => {
    const result = await canvaRequest(canvaToken, '/users/me/profile');
    if (result.error) return result;

    return result.data ?? {};
  },
});
