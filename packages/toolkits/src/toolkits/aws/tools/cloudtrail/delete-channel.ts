import { tool } from 'ai';
import { z } from 'zod';
import { DeleteChannelCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsDeleteChannel = tool({
  description: 'Deletes a channel. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    channel: z.string().describe('The ARN or ID of the channel'),
  }),
  execute: async ({ awsCredentials, region, channel }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new DeleteChannelCommand({
          Channel: channel,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a channel', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
