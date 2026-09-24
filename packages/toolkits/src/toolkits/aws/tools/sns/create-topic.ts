import { tool } from 'ai';
import { z } from 'zod';
import { CreateTopicCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsCreateSnsTopic = tool({
  description: 'Create a new SNS topic.. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the topic'),
    attributes: z.record(z.any()).optional().describe('Topic attributes (DisplayName, Policy, DeliveryPolicy, etc.)'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the topic'),
  }),
  execute: async ({ awsCredentials, region, name, attributes, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new CreateTopicCommand({
          Name: name,
          Attributes: attributes,
          Tags: tags as any,
      });
      const response = await client.send(command);
      return {
                  topicArn: response.TopicArn,
              };
    } catch (err) {
      return { error: 'Failed to create a new SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
