import { tool } from 'ai';
import { z } from 'zod';
import { DeliverConfigSnapshotCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeliverConfigSnapshot = tool({
  description: 'Schedules delivery of a configuration snapshot',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deliveryChannelName: z.string().describe('The name of the delivery channel'),
  }),
  execute: async ({ awsCredentials, region, deliveryChannelName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeliverConfigSnapshotCommand({
          deliveryChannelName: deliveryChannelName,
      });
      const response = await client.send(command);
      return {
                  configSnapshotId: response.configSnapshotId,
              };
    } catch (err) {
      return { error: 'Failed to schedules delivery of a configuration snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
