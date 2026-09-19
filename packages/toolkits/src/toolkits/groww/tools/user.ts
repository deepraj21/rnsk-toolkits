// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');

export const growwGetUserProfile = tool({
  description: 'Get Groww user profile including UCC, enabled exchanges (NSE/BSE), DDPI status and active segments.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
  }),
  execute: async ({ growwAccessToken }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/user/detail');
      return handleGrowwResult(result, 'get user profile');
    } catch (error) {
      return { error: 'Error getting user profile', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
