import { tool } from 'ai';
import { z } from 'zod';
import { SetSubscriptionAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsSetSnsSubscriptionAttributes = tool({
  description: 'Set attributes of an SNS subscription. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subscriptionArn: z.string().describe('The ARN of the subscription'),
    attributeName: z.string().describe('The name of the attribute to set'),
    attributeValue: z.string().describe('The value of the attribute'),
  }),
  execute: async ({ awsCredentials, region, subscriptionArn, attributeName, attributeValue }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new SetSubscriptionAttributesCommand({
          SubscriptionArn: subscriptionArn,
          AttributeName: attributeName,
          AttributeValue: attributeValue,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Attribute ${attributeName} set successfully for subscription ${subscriptionArn}`,
              };
    } catch (err) {
      return { error: 'Failed to set attributes of an SNS subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
