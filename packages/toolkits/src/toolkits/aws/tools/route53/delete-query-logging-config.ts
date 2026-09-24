import { tool } from 'ai';
import { z } from 'zod';
import { DeleteQueryLoggingConfigCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDeleteRoute53QueryLoggingConfig = tool({
  description: 'Delete a query logging configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The query logging configuration ID'),
  }),
  execute: async ({ awsCredentials, region, id }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      await client.send(new DeleteQueryLoggingConfigCommand({
          Id: id,
      }));
      return {
                  success: true,
                  message: `Query logging config ${id} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a query logging configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
