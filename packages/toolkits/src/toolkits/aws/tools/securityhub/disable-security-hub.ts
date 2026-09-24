import { tool } from 'ai';
import { z } from 'zod';
import { DisableSecurityHubCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDisableSecurityHub = tool({
  description: 'Disable AWS Security Hub in the current region',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DisableSecurityHubCommand({});
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to disable AWS Security Hub in the current region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
