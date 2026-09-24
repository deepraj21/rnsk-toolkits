import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDBParameterGroupsCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeDbParameterGroups = tool({
  description: 'List all RDS parameter groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbParameterGroupName: z.string().optional().describe('Filter by specific parameter group name'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, dbParameterGroupName, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeDBParameterGroupsCommand({
          DBParameterGroupName: dbParameterGroupName,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.DBParameterGroups;
    } catch (err) {
      return { error: 'Failed to list all RDS parameter groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
