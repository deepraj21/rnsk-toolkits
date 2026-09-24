import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsTagEventbridgeResource = tool({
  description: 'Add tags to an EventBridge resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceARN: z.string().describe('The ARN of the resource'),
    tags: z.array(z.record(z.any())).describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, resourceARN, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new TagResourceCommand({
          ResourceARN: resourceARN,
          Tags: tags,
      } as any);
      await client.send(command);
      return {
                  message: 'Tags applied successfully',
                  resourceARN: resourceARN,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an EventBridge resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
