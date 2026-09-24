import { tool } from 'ai';
import { z } from 'zod';
import { ListExperimentsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerExperiments = tool({
  description: 'List SageMaker experiments. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of experiments to return'),
    createdAfter: z.string().optional().describe('Filter by created after (ISO 8601)'),
    createdBefore: z.string().optional().describe('Filter by created before (ISO 8601)'),
    sortBy: z.enum(['Name', 'CreationTime']).optional().describe('Sort by'),
    sortOrder: z.enum(['Ascending', 'Descending']).optional().describe('Sort order'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, createdAfter, createdBefore, sortBy, sortOrder }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListExperimentsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          CreatedAfter: createdAfter ? new Date(createdAfter) : undefined,
          CreatedBefore: createdBefore ? new Date(createdBefore) : undefined,
          SortBy: sortBy,
          SortOrder: sortOrder,
      });
      const response = await client.send(command);
      return {
                  experimentSummaries: response.ExperimentSummaries || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list SageMaker experiments', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
