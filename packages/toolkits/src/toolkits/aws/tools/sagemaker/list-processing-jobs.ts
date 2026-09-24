import { tool } from 'ai';
import { z } from 'zod';
import { ListProcessingJobsCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerProcessingJobs = tool({
  description: 'List SageMaker processing jobs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of jobs to return'),
    creationTimeAfter: z.string().optional().describe('Filter by creation time after (ISO 8601)'),
    creationTimeBefore: z.string().optional().describe('Filter by creation time before (ISO 8601)'),
    lastModifiedTimeAfter: z.string().optional().describe('Filter by last modified time after (ISO 8601)'),
    lastModifiedTimeBefore: z.string().optional().describe('Filter by last modified time before (ISO 8601)'),
    nameContains: z.string().optional().describe('Filter by name containing'),
    statusEquals: z.enum(['InProgress', 'Completed', 'Failed', 'Stopping', 'Stopped']).optional().describe('Filter by status'),
    sortBy: z.enum(['Name', 'CreationTime', 'Status']).optional().describe('Sort by'),
    sortOrder: z.enum(['Ascending', 'Descending']).optional().describe('Sort order'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, creationTimeAfter, creationTimeBefore, lastModifiedTimeAfter, lastModifiedTimeBefore, nameContains, statusEquals, sortBy, sortOrder }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListProcessingJobsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          CreationTimeAfter: creationTimeAfter ? new Date(creationTimeAfter) : undefined,
          CreationTimeBefore: creationTimeBefore ? new Date(creationTimeBefore) : undefined,
          LastModifiedTimeAfter: lastModifiedTimeAfter ? new Date(lastModifiedTimeAfter) : undefined,
          LastModifiedTimeBefore: lastModifiedTimeBefore ? new Date(lastModifiedTimeBefore) : undefined,
          NameContains: nameContains,
          StatusEquals: statusEquals,
          SortBy: sortBy,
          SortOrder: sortOrder,
      });
      const response = await client.send(command);
      return {
                  processingJobSummaries: response.ProcessingJobSummaries || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list SageMaker processing jobs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
