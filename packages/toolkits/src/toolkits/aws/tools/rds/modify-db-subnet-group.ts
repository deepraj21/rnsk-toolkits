import { tool } from 'ai';
import { z } from 'zod';
import { ModifyDBSubnetGroupCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsModifyDbSubnetGroup = tool({
  description: 'Modify an RDS subnet group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbSubnetGroupName: z.string().describe('Subnet group name to modify'),
    dbSubnetGroupDescription: z.string().optional().describe('New description'),
    subnetIds: z.array(z.string()).describe('New list of subnet IDs'),
  }),
  execute: async ({ awsCredentials, region, dbSubnetGroupName, dbSubnetGroupDescription, subnetIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new ModifyDBSubnetGroupCommand({
          DBSubnetGroupName: dbSubnetGroupName,
          DBSubnetGroupDescription: dbSubnetGroupDescription,
          SubnetIds: subnetIds,
      });
      const response = await client.send(command);
      return response.DBSubnetGroup;
    } catch (err) {
      return { error: 'Failed to modify an RDS subnet group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
