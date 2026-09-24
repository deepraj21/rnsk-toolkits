import { tool } from 'ai';
import { z } from 'zod';
import { GetTrailCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsGetTrail = tool({
  description: 'Returns settings information for a specified trail. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name or the Amazon Resource Name (ARN) of the trail'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new GetTrailCommand({
          Name: name,
      });
      const response = await client.send(command);
      return {
                  trail: response.Trail,
              };
    } catch (err) {
      return { error: 'Failed to returns settings information for a specified trail', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
