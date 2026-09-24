import { tool } from 'ai';
import { z } from 'zod';
import { PutDeliveryChannelCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutDeliveryChannel = tool({
  description: 'Creates a delivery channel object to deliver configuration information. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deliveryChannel: z.enum(['One_Hour', 'Three_Hours', 'Six_Hours', 'Twelve_Hours', 'TwentyFour_Hours']).describe('Delivery channel configuration'),
  }),
  execute: async ({ awsCredentials, region, deliveryChannel }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutDeliveryChannelCommand({
          DeliveryChannel: deliveryChannel,
      } as any);
      await client.send(command);
      return {
                  message: 'Delivery channel created/updated successfully',
              };
    } catch (err) {
      return { error: 'Failed to creates a delivery channel object to deliver configuration information', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
