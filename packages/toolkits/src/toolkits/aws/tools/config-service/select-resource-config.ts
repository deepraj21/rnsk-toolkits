import { tool } from 'ai';
import { z } from 'zod';
import { SelectResourceConfigCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsSelectResourceConfig = tool({
  description: 'Accepts a structured query language (SQL) SELECT command and returns resource configurations',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    expression: z.string().describe('The SQL query SELECT command'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, expression, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new SelectResourceConfigCommand({
          Expression: expression,
          Limit: limit,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  results: response.Results || [],
                  nextToken: response.NextToken,
                  queryInfo: response.QueryInfo,
              };
    } catch (err) {
      return { error: 'Failed to accepts a structured query language (SQL) SELECT command and returns resource configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
