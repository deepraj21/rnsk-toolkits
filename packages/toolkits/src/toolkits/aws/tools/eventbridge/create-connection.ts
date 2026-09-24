import { tool } from 'ai';
import { z } from 'zod';
import { CreateConnectionCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsCreateEventbridgeConnection = tool({
  description: 'Create an EventBridge connection. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the connection'),
    description: z.string().optional().describe('Connection description'),
    authorizationType: z.enum(['BASIC', 'OAUTH_CLIENT_CREDENTIALS', 'API_KEY']).describe('Authorization type'),
    authParameters: z.record(z.any()).describe('Authorization parameters'),
  }),
  execute: async ({ awsCredentials, region, name, description, authorizationType, authParameters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new CreateConnectionCommand({
          Name: name,
          Description: description,
          AuthorizationType: authorizationType,
          AuthParameters: authParameters,
      });
      const response = await client.send(command);
      return {
                  connectionArn: response.ConnectionArn,
                  connectionState: response.ConnectionState,
                  creationTime: response.CreationTime,
                  lastModifiedTime: response.LastModifiedTime,
              };
    } catch (err) {
      return { error: 'Failed to create an EventBridge connection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
