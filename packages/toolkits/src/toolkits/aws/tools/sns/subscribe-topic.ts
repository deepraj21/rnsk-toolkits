import { tool } from 'ai';
import { z } from 'zod';
import { SubscribeCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsSubscribeSnsTopic = tool({
  description: 'Subscribe to an SNS topic.. Use it to subscribe an endpoint.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
    protocol: z.enum(['http', 'https', 'email', 'email-json', 'sms', 'sqs', 'application', 'lambda', 'firehose']).describe('The protocol (http, https, email, email-json, sms, sqs, application, lambda, firehose)'),
    endpoint: z.string().describe('The endpoint (URL, email, phone, ARN)'),
    attributes: z.record(z.any()).optional().describe('Subscription attributes'),
    returnSubscriptionArn: z.boolean().optional().describe('Whether to return subscription ARN'),
  }),
  execute: async ({ awsCredentials, region, topicArn, protocol, endpoint, attributes, returnSubscriptionArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new SubscribeCommand({
          TopicArn: topicArn,
          Protocol: protocol,
          Endpoint: endpoint,
          Attributes: attributes,
          ReturnSubscriptionArn: returnSubscriptionArn,
      });
      const response = await client.send(command);
      return {
                  subscriptionArn: response.SubscriptionArn,
              };
    } catch (err) {
      return { error: 'Failed to subscribe to an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
