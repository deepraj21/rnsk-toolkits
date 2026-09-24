import { tool } from 'ai';
import { z } from 'zod';
import { CreateDBParameterGroupCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateDbParameterGroup = tool({
  description: 'Create a new RDS parameter group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbParameterGroupName: z.string().describe('Parameter group name'),
    dbParameterGroupFamily: z.string().describe('DB parameter group family (e.g., mysql8.0, postgres14)'),
    description: z.string().describe('Description of the parameter group'),
  }),
  execute: async ({ awsCredentials, region, dbParameterGroupName, dbParameterGroupFamily, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateDBParameterGroupCommand({
          DBParameterGroupName: dbParameterGroupName,
          DBParameterGroupFamily: dbParameterGroupFamily,
          Description: description,
      });
      const response = await client.send(command);
      return response.DBParameterGroup;
    } catch (err) {
      return { error: 'Failed to create a new RDS parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
