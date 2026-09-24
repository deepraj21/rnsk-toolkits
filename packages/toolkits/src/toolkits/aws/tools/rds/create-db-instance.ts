import { tool } from 'ai';
import { z } from 'zod';
import { CreateDBInstanceCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateDbInstance = tool({
  description: 'Create a new RDS database instance (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server). Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('Unique identifier for the DB instance'),
    dbInstanceClass: z.string().describe('Instance type (e.g., db.t3.micro, db.r5.large)'),
    engine: z.string().describe('Database engine (mysql, postgres, mariadb, oracle-ee, sqlserver-ex, etc.)'),
    masterUsername: z.string().describe('Master username for database access'),
    masterUserPassword: z.string().describe('Master password for database access'),
    allocatedStorage: z.number().describe('Storage size in GB (20-65536)'),
    vpcSecurityGroupIds: z.array(z.string()).optional().describe('List of VPC security group IDs'),
    dbSubnetGroupName: z.string().optional().describe('DB subnet group name for VPC'),
    publiclyAccessible: z.boolean().optional().describe('Whether the instance is publicly accessible'),
    storageEncrypted: z.boolean().optional().describe('Enable storage encryption'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, dbInstanceClass, engine, masterUsername, masterUserPassword, allocatedStorage, vpcSecurityGroupIds, dbSubnetGroupName, publiclyAccessible, storageEncrypted }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateDBInstanceCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          DBInstanceClass: dbInstanceClass,
          Engine: engine,
          MasterUsername: masterUsername,
          MasterUserPassword: masterUserPassword,
          AllocatedStorage: allocatedStorage,
          VpcSecurityGroupIds: vpcSecurityGroupIds,
          DBSubnetGroupName: dbSubnetGroupName,
          PubliclyAccessible: publiclyAccessible,
          StorageEncrypted: storageEncrypted,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to create a new RDS database instance (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
