import { tool } from 'ai';
import { z } from 'zod';
import { PublishCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsPublishSnsMessage = tool({
  description: 'Publish a message to an SNS topic.. Use it to publish a message.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().optional().describe('The ARN of the topic (or target ARN)'),
    targetArn: z.string().optional().describe('The target ARN (for mobile push)'),
    phoneNumber: z.string().optional().describe('Phone number (for SMS)'),
    message: z.string().describe('The message to publish'),
    subject: z.string().optional().describe('Subject (for email)'),
    messageStructure: z.string().optional().describe('Message structure (json, string)'),
    messageAttributes: z.record(z.any()).optional().describe('Message attributes'),
  }),
  execute: async ({ awsCredentials, region, topicArn, targetArn, phoneNumber, message, subject, messageStructure, messageAttributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new PublishCommand({
          TopicArn: topicArn,
          TargetArn: targetArn,
          PhoneNumber: phoneNumber,
          Message: message,
          Subject: subject,
          MessageStructure: messageStructure,
          MessageAttributes: messageAttributes,
      });
      const response = await client.send(command);
      return {
                  messageId: response.MessageId,
                  sequenceNumber: response.SequenceNumber,
              };
    } catch (err) {
      return { error: 'Failed to publish a message to an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
