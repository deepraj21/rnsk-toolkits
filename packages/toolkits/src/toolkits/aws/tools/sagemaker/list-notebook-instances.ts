import { tool } from 'ai';
import { z } from 'zod';
import { ListNotebookInstancesCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsListSagemakerNotebookInstances = tool({
  description: 'List SageMaker notebook instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of instances to return'),
    sortBy: z.enum(['Name', 'CreationTime', 'Status']).optional().describe('Sort by'),
    sortOrder: z.enum(['Ascending', 'Descending']).optional().describe('Sort order'),
    nameContains: z.string().optional().describe('Filter by name containing'),
    creationTimeBefore: z.string().optional().describe('Filter by creation time before (ISO 8601)'),
    creationTimeAfter: z.string().optional().describe('Filter by creation time after (ISO 8601)'),
    lastModifiedTimeBefore: z.string().optional().describe('Filter by last modified time before (ISO 8601)'),
    lastModifiedTimeAfter: z.string().optional().describe('Filter by last modified time after (ISO 8601)'),
    statusEquals: z.enum(['Pending', 'InService', 'Stopping', 'Stopped', 'Failed', 'Deleting', 'Updating']).optional().describe('Filter by status'),
    notebookInstanceLifecycleConfigNameContains: z.string().optional().describe('Filter by lifecycle config name containing'),
    defaultCodeRepositoryContains: z.string().optional().describe('Filter by default code repository containing'),
    additionalCodeRepositoryEquals: z.string().optional().describe('Filter by additional code repository'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, sortBy, sortOrder, nameContains, creationTimeBefore, creationTimeAfter, lastModifiedTimeBefore, lastModifiedTimeAfter, statusEquals, notebookInstanceLifecycleConfigNameContains, defaultCodeRepositoryContains, additionalCodeRepositoryEquals }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new ListNotebookInstancesCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          SortBy: sortBy,
          SortOrder: sortOrder,
          NameContains: nameContains,
          CreationTimeBefore: creationTimeBefore ? new Date(creationTimeBefore) : undefined,
          CreationTimeAfter: creationTimeAfter ? new Date(creationTimeAfter) : undefined,
          LastModifiedTimeBefore: lastModifiedTimeBefore ? new Date(lastModifiedTimeBefore) : undefined,
          LastModifiedTimeAfter: lastModifiedTimeAfter ? new Date(lastModifiedTimeAfter) : undefined,
          StatusEquals: statusEquals,
          NotebookInstanceLifecycleConfigNameContains: notebookInstanceLifecycleConfigNameContains,
          DefaultCodeRepositoryContains: defaultCodeRepositoryContains,
          AdditionalCodeRepositoryEquals: additionalCodeRepositoryEquals,
      });
      const response = await client.send(command);
      return {
                  notebookInstances: response.NotebookInstances || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list SageMaker notebook instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
