import { tool } from 'ai';
import { z } from 'zod';
import { GetQueryLoggingConfigCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53QueryLoggingConfig = tool({
  description: 'Get information about a query logging configuration. Use it to inspect current state before making changes.',
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

      const command = new GetQueryLoggingConfigCommand({
          Id: id,
      });
      const response = await client.send(command);
      return {
                  queryLoggingConfig: response.QueryLoggingConfig,
              };
    } catch (err) {
      return { error: 'Failed to get information about a query logging configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
