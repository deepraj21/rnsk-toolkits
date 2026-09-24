import { tool } from 'ai';
import { z } from 'zod';
import { DeleteEndpointCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsDeleteSnsEndpoint = tool({
  description: 'Delete a platform endpoint. Use it to permanently remove the resource.',
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

      const command = new DeleteEndpointCommand({
          EndpointArn: endpointArn,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Endpoint ${endpointArn} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a platform endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
