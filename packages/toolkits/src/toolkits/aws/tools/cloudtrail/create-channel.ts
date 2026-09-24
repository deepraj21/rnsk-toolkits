import { tool } from 'ai';
import { z } from 'zod';
import { CreateChannelCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsCreateChannel = tool({
  description: 'Creates a channel for CloudTrail to deliver events to a partner or external destination. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the channel'),
    source: z.string().describe('The source for the channel'),
    destinations: z.array(z.record(z.any())).describe('List of destinations'),
    tags: z.array(z.record(z.any())).optional().describe('List of tags'),
  }),
  execute: async ({ awsCredentials, region, name, source, destinations, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new CreateChannelCommand({
          Name: name,
          Source: source,
          Destinations: destinations,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  channelArn: response.ChannelArn,
                  name: response.Name,
                  source: response.Source,
                  destinations: response.Destinations,
              };
    } catch (err) {
      return { error: 'Failed to creates a channel for CloudTrail to deliver events to a partner or external destination', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
