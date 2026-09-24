import { tool } from 'ai';
import { z } from 'zod';
import { DeleteEventSourceMappingCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsDeleteLambdaEventSourceMapping = tool({
  description: 'Delete an event source mapping. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    uuid: z.string().describe('UUID of the event source mapping'),
  }),
  execute: async ({ awsCredentials, region, uuid }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new DeleteEventSourceMappingCommand({
          UUID: uuid,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Event source mapping ${uuid} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete an event source mapping', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
