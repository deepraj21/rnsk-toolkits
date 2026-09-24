import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsUntagBackupResource = tool({
  description: 'Remove tags from a backup resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the resource'),
    tagKeyList: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeyList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          ResourceArn: resourceArn,
          TagKeyList: tagKeyList,
      });
      await client.send(command);
      return {
                  message: 'Tags removed successfully',
                  resourceArn: resourceArn,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a backup resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
