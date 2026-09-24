import { tool } from 'ai';
import { z } from 'zod';
import { GetChannelCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsGetChannel = tool({
  description: 'Returns information about a channel. Use it to inspect current state before making changes.',
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

      const command = new GetChannelCommand({
          Channel: channel,
      });
      const response = await client.send(command);
      return {
                  channelArn: response.ChannelArn,
                  name: response.Name,
                  source: response.Source,
                  destinations: response.Destinations,
                  ingestionStatus: response.IngestionStatus,
              };
    } catch (err) {
      return { error: 'Failed to returns information about a channel', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
