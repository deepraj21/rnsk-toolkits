import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsUntagEfsResource = tool({
  description: 'Remove tags from an EFS resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceId: z.string().describe('The ID of the resource'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceId, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          ResourceId: resourceId,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  message: 'Tags removed successfully',
                  resourceId: resourceId,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from an EFS resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
