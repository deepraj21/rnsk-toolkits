import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsUntagEventbridgeResource = tool({
  description: 'Remove tags from an EventBridge resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceARN: z.string().describe('The ARN of the resource'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceARN, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          ResourceARN: resourceARN,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  message: 'Tags removed successfully',
                  resourceARN: resourceARN,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from an EventBridge resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
