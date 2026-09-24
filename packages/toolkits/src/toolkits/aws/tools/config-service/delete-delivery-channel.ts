import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDeliveryChannelCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteDeliveryChannel = tool({
  description: 'Deletes the delivery channel. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deliveryChannelName: z.string().describe('The name of the delivery channel to delete'),
  }),
  execute: async ({ awsCredentials, region, deliveryChannelName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteDeliveryChannelCommand({
          DeliveryChannelName: deliveryChannelName,
      });
      await client.send(command);
      return {
                  message: 'Delivery channel deleted successfully',
                  deliveryChannelName: deliveryChannelName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the delivery channel', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
