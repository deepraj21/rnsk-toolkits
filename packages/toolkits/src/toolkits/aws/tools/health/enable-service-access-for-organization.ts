import { tool } from 'ai';
import { z } from 'zod';
import { EnableHealthServiceAccessForOrganizationCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsEnableHealthServiceAccessForOrganization = tool({
  description: 'Enable Health service access for your organization. Use it to enable a feature.',
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

      const command = new EnableHealthServiceAccessForOrganizationCommand({});
      await client.send(command);
      return {
                  message: 'Health service access enabled for organization successfully',
              };
    } catch (err) {
      return { error: 'Failed to enable Health service access for your organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
