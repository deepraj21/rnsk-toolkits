import { tool } from 'ai';
import { z } from 'zod';
import { ListEndpointConfigsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerEndpointConfigs = tool({
  description: 'List SageMaker endpoint configurations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of configs to return'),
    sortBy: z.enum(['Name', 'CreationTime']).optional().describe('Sort by'),
    sortOrder: z.enum(['Ascending', 'Descending']).optional().describe('Sort order'),
    nameContains: z.string().optional().describe('Filter by name containing'),
    creationTimeBefore: z.string().optional().describe('Filter by creation time before (ISO 8601)'),
    creationTimeAfter: z.string().optional().describe('Filter by creation time after (ISO 8601)'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, sortBy, sortOrder, nameContains, creationTimeBefore, creationTimeAfter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListEndpointConfigsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          SortBy: sortBy,
          SortOrder: sortOrder,
          NameContains: nameContains,
          CreationTimeBefore: creationTimeBefore ? new Date(creationTimeBefore) : undefined,
          CreationTimeAfter: creationTimeAfter ? new Date(creationTimeAfter) : undefined,
      });
      const response = await client.send(command);
      return {
                  endpointConfigs: response.EndpointConfigs || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list SageMaker endpoint configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
