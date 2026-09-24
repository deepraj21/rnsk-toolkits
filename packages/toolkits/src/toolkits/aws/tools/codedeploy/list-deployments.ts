import { tool } from 'ai';
import { z } from 'zod';
import { ListDeploymentsCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsListCodedeployDeployments = tool({
  description: 'List deployments. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().optional().describe('The name of the application'),
    deploymentGroupName: z.string().optional().describe('The name of the deployment group'),
    includeOnlyStatuses: z.enum(['Created', 'Queued', 'InProgress', 'Succeeded', 'Failed', 'Stopped', 'Ready']).optional().describe('Filter by deployment status'),
    createTimeRange: z.record(z.any()).optional().describe('Start time (ISO 8601)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, applicationName, deploymentGroupName, includeOnlyStatuses, createTimeRange, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new ListDeploymentsCommand({
          applicationName: applicationName,
          deploymentGroupName: deploymentGroupName,
          includeOnlyStatuses: includeOnlyStatuses,
          createTimeRange: createTimeRange,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  deployments: response.deployments || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list deployments', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
