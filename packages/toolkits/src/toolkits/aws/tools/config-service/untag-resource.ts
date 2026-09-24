import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsUntagConfigResource = tool({
  description: 'Remove tags from a Config resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          ResourceArn: resourceArn,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  message: 'Tags removed successfully',
                  resourceArn: resourceArn,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a Config resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
