import { tool } from 'ai';
import { z } from 'zod';
import { CreateDBSubnetGroupCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateDbSubnetGroup = tool({
  description: 'Create a new RDS subnet group for VPC. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbSubnetGroupName: z.string().describe('Subnet group name'),
    dbSubnetGroupDescription: z.string().describe('Description of the subnet group'),
    subnetIds: z.array(z.string()).describe('List of subnet IDs'),
  }),
  execute: async ({ awsCredentials, region, dbSubnetGroupName, dbSubnetGroupDescription, subnetIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateDBSubnetGroupCommand({
          DBSubnetGroupName: dbSubnetGroupName,
          DBSubnetGroupDescription: dbSubnetGroupDescription,
          SubnetIds: subnetIds,
      });
      const response = await client.send(command);
      return response.DBSubnetGroup;
    } catch (err) {
      return { error: 'Failed to create a new RDS subnet group for VPC', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
