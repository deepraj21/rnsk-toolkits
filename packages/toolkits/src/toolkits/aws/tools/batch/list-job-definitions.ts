import { tool } from 'ai';
import { z } from 'zod';
import { DescribeJobDefinitionsCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsListBatchJobDefinitions = tool({
  description: 'List all Batch job definitions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobDefinitionName: z.string().optional().describe('Filter by job definition name'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().describe('Filter by status (ACTIVE, INACTIVE)'),
    maxResults: z.number().optional().describe('Maximum number of job definitions to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, jobDefinitionName, status, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      // Note: DescribeJobDefinitionsCommand requires jobDefinitions array
      // For listing all, we pass an empty array or undefined, but filtering is limited
      const command = new DescribeJobDefinitionsCommand({
          jobDefinitions: undefined, // When undefined, may list all (API dependent)
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      // Filter results client-side if jobDefinitionName or status provided
      let filtered = response.jobDefinitions || [];
      if (jobDefinitionName) {
          filtered = filtered.filter((jd: any) => 
              jd.jobDefinitionName?.includes(jobDefinitionName)
          );
      }
      if (status) {
          filtered = filtered.filter((jd: any) => jd.status === status);
      }
      return {
                  jobDefinitions: filtered,
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all Batch job definitions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
