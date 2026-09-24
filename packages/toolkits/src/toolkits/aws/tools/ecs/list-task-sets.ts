import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTaskSetsCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsTaskSets = tool({
  description: 'List all task sets in a service (uses DescribeTaskSetsCommand). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().describe('The name of the cluster'),
    service: z.string().describe('The name of the service'),
    maxResults: z.number().optional().describe('Maximum number of task sets to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, cluster, service, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      // Use DescribeTaskSetsCommand without specifying taskSets to list all
      // Note: DescribeTaskSetsCommand doesn't support maxResults/nextToken, so we list all
      const command = new DescribeTaskSetsCommand({
          cluster: cluster,
          service: service,
      });
      const response = await client.send(command);
      return {
                  taskSets: response.taskSets?.map((ts: any) => ({
                      taskSetArn: ts.taskSetArn,
                      taskSetId: ts.id,
                      status: ts.status,
                      createdAt: ts.createdAt,
                  })) || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to list all task sets in a service (uses DescribeTaskSetsCommand)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
