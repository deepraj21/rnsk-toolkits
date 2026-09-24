import { tool } from 'ai';
import { z } from 'zod';
import { DescribeJobDefinitionsCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDescribeBatchJobDefinitions = tool({
  description: 'Get details about one or more Batch job definitions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobDefinitions: z.array(z.string()).describe('List of job definition names or ARNs to describe'),
  }),
  execute: async ({ awsCredentials, region, jobDefinitions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DescribeJobDefinitionsCommand({
          jobDefinitions: jobDefinitions,
      });
      const response = await client.send(command);
      return {
                  jobDefinitions: response.jobDefinitions || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more Batch job definitions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
