import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTrailCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsDeleteTrail = tool({
  description: 'Deletes a trail. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name or the Amazon Resource Name (ARN) of the trail to be deleted'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new DeleteTrailCommand({
          Name: name,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a trail', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
