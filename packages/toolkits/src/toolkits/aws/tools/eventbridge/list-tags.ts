import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeTags = tool({
  description: 'List tags for an EventBridge resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceARN: z.string().describe('The ARN of the resource'),
  }),
  execute: async ({ awsCredentials, region, resourceARN }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          ResourceARN: resourceARN,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
              };
    } catch (err) {
      return { error: 'Failed to list tags for an EventBridge resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
