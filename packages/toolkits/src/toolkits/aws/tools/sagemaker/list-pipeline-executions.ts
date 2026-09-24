import { tool } from 'ai';
import { z } from 'zod';
import { ListPipelineExecutionsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerPipelineExecutions = tool({
  description: 'List SageMaker pipeline executions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of executions to return'),
    createdAfter: z.string().optional().describe('Filter by created after (ISO 8601)'),
    createdBefore: z.string().optional().describe('Filter by created before (ISO 8601)'),
    sortBy: z.enum(['Name', 'CreationTime']).optional().describe('Sort by'),
    sortOrder: z.enum(['Ascending', 'Descending']).optional().describe('Sort order'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, nextToken, maxResults, createdAfter, createdBefore, sortBy, sortOrder }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListPipelineExecutionsCommand({
          PipelineName: pipelineName,
          NextToken: nextToken,
          MaxResults: maxResults,
          CreatedAfter: createdAfter ? new Date(createdAfter) : undefined,
          CreatedBefore: createdBefore ? new Date(createdBefore) : undefined,
          SortBy: sortBy,
          SortOrder: sortOrder,
      } as any);
      const response = await client.send(command);
      return {
                  pipelineExecutionSummaries: response.PipelineExecutionSummaries || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list SageMaker pipeline executions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
