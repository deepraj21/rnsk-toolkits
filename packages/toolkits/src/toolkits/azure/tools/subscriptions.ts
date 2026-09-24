// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

export const azureListSubscriptions = tool({
  description: 'List Azure subscriptions visible to the connected service principal. Use to discover subscription IDs before other calls.',
  inputSchema: z.object({ azureCredentials: authField }),
  execute: async ({ azureCredentials }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const data = (await armRequest(azureCredentials, '/subscriptions', { apiVersion: '2022-12-01' })) as {
        value?: Array<{ subscriptionId?: string; displayName?: string; state?: string }>;
      };
      const subscriptions = (data.value ?? []).map((s) => ({
        subscriptionId: s.subscriptionId,
        displayName: s.displayName,
        state: s.state,
      }));
      return { count: subscriptions.length, subscriptions };
    } catch (error) {
      return { error: 'Failed to list subscriptions', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
