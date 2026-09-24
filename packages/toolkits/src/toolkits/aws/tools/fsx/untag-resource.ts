import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsUntagFsxResource = tool({
  description: 'Remove tags from an FSx resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceARN: z.string().describe('The ARN of the resource'),
    tagKeys: z.array(z.string()).describe('List of tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceARN, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          ResourceARN: resourceARN,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags removed successfully from resource ${resourceARN}`,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from an FSx resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
