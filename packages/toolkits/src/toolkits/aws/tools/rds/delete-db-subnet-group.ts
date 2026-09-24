import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDBSubnetGroupCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDeleteDbSubnetGroup = tool({
  description: 'Delete an RDS subnet group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbSubnetGroupName: z.string().describe('Subnet group name to delete'),
  }),
  execute: async ({ awsCredentials, region, dbSubnetGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DeleteDBSubnetGroupCommand({
          DBSubnetGroupName: dbSubnetGroupName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an RDS subnet group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
