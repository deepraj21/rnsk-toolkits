import { tool } from 'ai';
import { z } from 'zod';
import { CreateDBClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateDbCluster = tool({
  description: 'Create a new Aurora database cluster. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().describe('Unique identifier for the cluster'),
    engine: z.string().describe('Database engine (aurora-mysql, aurora-postgresql)'),
    masterUsername: z.string().describe('Master username'),
    masterUserPassword: z.string().describe('Master password'),
    databaseName: z.string().optional().describe('Initial database name'),
    vpcSecurityGroupIds: z.array(z.string()).optional().describe('VPC security group IDs'),
    dbSubnetGroupName: z.string().optional().describe('DB subnet group name'),
    storageEncrypted: z.boolean().optional().describe('Enable storage encryption'),
    serverlessV2ScalingConfiguration: z.record(z.any()).optional().describe('Aurora Serverless v2 scaling configuration'),
    properties: z.number().optional().describe('Minimum ACUs (0.5-128)'),
    MinCapacity: z.number().optional().describe('Minimum ACUs (0.5-128)'),
    MaxCapacity: z.number().optional().describe('Maximum ACUs (0.5-128)'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier, engine, masterUsername, masterUserPassword, databaseName, vpcSecurityGroupIds, dbSubnetGroupName, storageEncrypted, serverlessV2ScalingConfiguration, properties, MinCapacity, MaxCapacity }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateDBClusterCommand({
          DBClusterIdentifier: dbClusterIdentifier,
          Engine: engine,
          MasterUsername: masterUsername,
          MasterUserPassword: masterUserPassword,
          DatabaseName: databaseName,
          VpcSecurityGroupIds: vpcSecurityGroupIds,
          DBSubnetGroupName: dbSubnetGroupName,
          StorageEncrypted: storageEncrypted,
          ServerlessV2ScalingConfiguration: serverlessV2ScalingConfiguration,
      });
      const response = await client.send(command);
      return response.DBCluster;
    } catch (err) {
      return { error: 'Failed to create a new Aurora database cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
