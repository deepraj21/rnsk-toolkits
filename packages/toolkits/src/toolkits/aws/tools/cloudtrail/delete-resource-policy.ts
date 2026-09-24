import { tool } from 'ai';
import { z } from 'zod';
import { DeleteResourcePolicyCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsDeleteResourcePolicy = tool({
  description: 'Deletes the resource-based policy attached to the CloudTrail channel, event data store, or lake. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The Amazon Resource Name (ARN) of the CloudTrail resource'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new DeleteResourcePolicyCommand({
          ResourceArn: resourceArn,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes the resource-based policy attached to the CloudTrail channel, event data store, or lake', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
