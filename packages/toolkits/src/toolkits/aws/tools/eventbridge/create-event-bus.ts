import { tool } from 'ai';
import { z } from 'zod';
import { CreateEventBusCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsCreateEventbridgeEventBus = tool({
  description: 'Create a new EventBridge event bus. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the event bus'),
    eventSourceName: z.string().optional().describe('Event source name (for partner event buses)'),
    description: z.string().optional().describe('Event bus description'),
    kmsKeyIdentifier: z.string().optional().describe('KMS key identifier for encryption'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, name, eventSourceName, description, kmsKeyIdentifier, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new CreateEventBusCommand({
          Name: name,
          EventSourceName: eventSourceName,
          Description: description,
          KmsKeyIdentifier: kmsKeyIdentifier,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  eventBusArn: response.EventBusArn,
              };
    } catch (err) {
      return { error: 'Failed to create a new EventBridge event bus', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
