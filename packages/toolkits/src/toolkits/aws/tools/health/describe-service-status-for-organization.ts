import { tool } from 'ai';
import { z } from 'zod';
import { DescribeHealthServiceStatusForOrganizationCommand } from '@aws-sdk/client-health';
import { createHealthClient } from '../client.js';

export const awsDescribeHealthServiceStatusForOrganization = tool({
  description: 'Get the status of the Health service for your organization. Use it to inspect current state before making changes.',
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

      const command = new DescribeHealthServiceStatusForOrganizationCommand({});
      const response = await client.send(command);
      return {
                  healthServiceAccessStatusForOrganization: response.healthServiceAccessStatusForOrganization,
              };
    } catch (err) {
      return { error: 'Failed to get the status of the Health service for your organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
