import { tool } from 'ai';
import { z } from 'zod';
import { ListQueuesCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsListSqsQueues = tool({
  description: 'List all SQS queues. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueNamePrefix: z.string().optional().describe('Filter queues by name prefix'),
    maxResults: z.number().optional().describe('Maximum number of queues to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, queueNamePrefix, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new ListQueuesCommand({
          QueueNamePrefix: queueNamePrefix,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  queueUrls: response.QueueUrls || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all SQS queues', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
