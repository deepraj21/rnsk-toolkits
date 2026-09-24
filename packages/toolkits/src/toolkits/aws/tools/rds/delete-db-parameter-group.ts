import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDBParameterGroupCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDeleteDbParameterGroup = tool({
  description: 'Delete an RDS parameter group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbParameterGroupName: z.string().describe('Parameter group name to delete'),
  }),
  execute: async ({ awsCredentials, region, dbParameterGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DeleteDBParameterGroupCommand({
          DBParameterGroupName: dbParameterGroupName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an RDS parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
