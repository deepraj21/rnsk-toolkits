import { tool } from 'ai';
import { z } from 'zod';
import { ModifyDBClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsModifyDbCluster = tool({
  description: 'Modify an Aurora database cluster. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().describe('Cluster identifier to modify'),
    masterUserPassword: z.string().optional().describe('New master password'),
    applyImmediately: z.boolean().optional().describe('Apply changes immediately'),
    serverlessV2ScalingConfiguration: z.record(z.any()).optional().describe('Update Serverless v2 scaling'),
    properties: z.number().optional().describe('properties'),
    MinCapacity: z.number().optional().describe('MinCapacity'),
    MaxCapacity: z.number().optional().describe('MaxCapacity'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier, masterUserPassword, applyImmediately, serverlessV2ScalingConfiguration, properties, MinCapacity, MaxCapacity }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new ModifyDBClusterCommand({
          DBClusterIdentifier: dbClusterIdentifier,
          MasterUserPassword: masterUserPassword,
          ApplyImmediately: applyImmediately,
          ServerlessV2ScalingConfiguration: serverlessV2ScalingConfiguration,
      });
      const response = await client.send(command);
      return response.DBCluster;
    } catch (err) {
      return { error: 'Failed to modify an Aurora database cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
