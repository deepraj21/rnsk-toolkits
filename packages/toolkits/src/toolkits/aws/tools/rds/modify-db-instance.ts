import { tool } from 'ai';
import { z } from 'zod';
import { ModifyDBInstanceCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsModifyDbInstance = tool({
  description: 'Modify an existing RDS database instance (change storage, compute, engine version). Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('DB instance identifier to modify'),
    dbInstanceClass: z.string().optional().describe('New instance type'),
    allocatedStorage: z.number().optional().describe('New storage size in GB'),
    masterUserPassword: z.string().optional().describe('New master password'),
    applyImmediately: z.boolean().optional().describe('Apply changes immediately (true) or during next maintenance window (false)'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, dbInstanceClass, allocatedStorage, masterUserPassword, applyImmediately }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new ModifyDBInstanceCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          DBInstanceClass: dbInstanceClass,
          AllocatedStorage: allocatedStorage,
          MasterUserPassword: masterUserPassword,
          ApplyImmediately: applyImmediately,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to modify an existing RDS database instance (change storage, compute, engine version)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
