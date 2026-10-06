// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError } from './client.js';

export const intercomListSubscriptionTypes = tool({
  description: 'List subscription types with consent mode and translations.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/subscription_types`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list subscription types', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing subscription types');
    }
  },
});
