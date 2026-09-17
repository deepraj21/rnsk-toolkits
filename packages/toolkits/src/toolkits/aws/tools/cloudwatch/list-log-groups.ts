import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsListCloudwatchLogGroups = tool({
  description: 'List CloudWatch log groups, optionally filtered by name prefix.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupNamePrefix: z.string().optional().describe('Only return log groups whose name starts with this prefix'),
    limit: z.number().min(1).max(50).optional().describe('Maximum number of log groups to return'),
  }),
  execute: async ({ awsCredentials, region, logGroupNamePrefix, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);
      const response = await client.send(new DescribeLogGroupsCommand({ logGroupNamePrefix, limit }));
      return {
        logGroups: (response.logGroups ?? []).map((group) => ({
          logGroupName: group.logGroupName,
          creationTime: group.creationTime,
          retentionInDays: group.retentionInDays,
          storedBytes: group.storedBytes,
          arn: group.arn,
        })),
      };
    } catch (err) {
      return {
        error: 'Failed to list CloudWatch log groups',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
