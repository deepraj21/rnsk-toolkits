import { tool } from 'ai';
import { z } from 'zod';
import { GetEndpointAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsGetSnsEndpointAttributes = tool({
  description: 'Get attributes of a platform endpoint. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointArn: z.string().describe('The ARN of the endpoint'),
  }),
  execute: async ({ awsCredentials, region, endpointArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new GetEndpointAttributesCommand({
          EndpointArn: endpointArn,
      });
      const response = await client.send(command);
      return {
                  attributes: response.Attributes || {},
              };
    } catch (err) {
      return { error: 'Failed to get attributes of a platform endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
