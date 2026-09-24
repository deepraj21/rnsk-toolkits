import { tool } from 'ai';
import { z } from 'zod';
import { DeleteEventDataStoreCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsDeleteEventDataStore = tool({
  description: 'Disables the event data store specified by EventDataStore. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    eventDataStore: z.string().describe('The ARN or ID of the event data store'),
  }),
  execute: async ({ awsCredentials, region, eventDataStore }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new DeleteEventDataStoreCommand({
          EventDataStore: eventDataStore,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to disables the event data store specified by EventDataStore', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
