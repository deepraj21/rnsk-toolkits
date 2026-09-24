import { tool } from 'ai';
import { z } from 'zod';
import { UpdateChannelCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsUpdateChannel = tool({
  description: 'Updates a channel. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    channel: z.string().describe('The ARN or ID of the channel'),
    destinations: z.array(z.record(z.any())).optional().describe('List of destinations'),
  }),
  execute: async ({ awsCredentials, region, channel, destinations }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new UpdateChannelCommand({
          Channel: channel,
          Destinations: destinations,
      } as any);
      const response = await client.send(command);
      return {
                  channelArn: response.ChannelArn,
                  name: response.Name,
                  source: response.Source,
                  destinations: response.Destinations,
              };
    } catch (err) {
      return { error: 'Failed to updates a channel', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
