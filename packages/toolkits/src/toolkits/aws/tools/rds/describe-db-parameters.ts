import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDBParametersCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeDbParameters = tool({
  description: 'List all parameters in an RDS parameter group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbParameterGroupName: z.string().describe('Parameter group name'),
    source: z.string().optional().describe('Filter by source (user, system, engine-default)'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, dbParameterGroupName, source, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeDBParametersCommand({
          DBParameterGroupName: dbParameterGroupName,
          Source: source,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.Parameters;
    } catch (err) {
      return { error: 'Failed to list all parameters in an RDS parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
