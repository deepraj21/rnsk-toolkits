import { tool } from 'ai';
import { z } from 'zod';
import { GetResourcePolicyCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsGetResourcePolicy = tool({
  description: 'Retrieves the JSON-formatted resource-based policy document attached to the CloudTrail channel. Use it to inspect current state before making changes.',
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

      const command = new GetResourcePolicyCommand({
          ResourceArn: resourceArn,
      });
      const response = await client.send(command);
      return {
                  resourceArn: response.ResourceArn,
                  resourcePolicy: response.ResourcePolicy,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the JSON-formatted resource-based policy document attached to the CloudTrail channel', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
