import { tool } from 'ai';
import { z } from 'zod';
import { DisableHealthServiceAccessForOrganizationCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDisableHealthServiceAccessForOrganization = tool({
  description: 'Disable Health service access for your organization',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createHealthClient(awsCredentials, region);

      const command = new DisableHealthServiceAccessForOrganizationCommand({});
      await client.send(command);
      return {
                  message: 'Health service access disabled for organization successfully',
              };
    } catch (err) {
      return { error: 'Failed to disable Health service access for your organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
