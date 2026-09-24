import { tool } from 'ai';
import { z } from 'zod';
import { ListModelsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerModels = tool({
  description: 'List SageMaker models. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of models to return'),
    sortBy: z.enum(['Name', 'CreationTime']).optional().describe('Sort by'),
    sortOrder: z.enum(['Ascending', 'Descending']).optional().describe('Sort order'),
    creationTimeAfter: z.string().optional().describe('Filter by creation time after (ISO 8601)'),
    creationTimeBefore: z.string().optional().describe('Filter by creation time before (ISO 8601)'),
    nameContains: z.string().optional().describe('Filter by name containing'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, sortBy, sortOrder, creationTimeAfter, creationTimeBefore, nameContains }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListModelsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          SortBy: sortBy,
          SortOrder: sortOrder,
          CreationTimeAfter: creationTimeAfter ? new Date(creationTimeAfter) : undefined,
          CreationTimeBefore: creationTimeBefore ? new Date(creationTimeBefore) : undefined,
          NameContains: nameContains,
      });
      const response = await client.send(command);
      return {
                  models: response.Models || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list SageMaker models', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
