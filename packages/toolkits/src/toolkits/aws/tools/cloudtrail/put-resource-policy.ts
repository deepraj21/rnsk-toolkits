import { tool } from 'ai';
import { z } from 'zod';
import { PutResourcePolicyCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsPutResourcePolicy = tool({
  description: 'Attaches a resource-based permission policy to a CloudTrail channel, event data store, or lake. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The Amazon Resource Name (ARN) of the CloudTrail resource'),
    resourcePolicy: z.string().describe('A JSON-formatted string for the resource policy'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, resourcePolicy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new PutResourcePolicyCommand({
          ResourceArn: resourceArn,
          ResourcePolicy: resourcePolicy,
      });
      const response = await client.send(command);
      return {
                  resourceArn: response.ResourceArn,
                  resourcePolicy: response.ResourcePolicy,
              };
    } catch (err) {
      return { error: 'Failed to attaches a resource-based permission policy to a CloudTrail channel, event data store, or lake', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
