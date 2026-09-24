import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDeliveryChannelsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeDeliveryChannels = tool({
  description: 'Returns details about one or more delivery channels. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    deliveryChannelNames: z.array(z.string()).optional().describe('List of delivery channel names'),
  }),
  execute: async ({ awsCredentials, region, deliveryChannelNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeDeliveryChannelsCommand({
          DeliveryChannelNames: deliveryChannelNames,
      });
      const response = await client.send(command);
      return {
                  deliveryChannels: response.DeliveryChannels || [],
              };
    } catch (err) {
      return { error: 'Failed to returns details about one or more delivery channels', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
