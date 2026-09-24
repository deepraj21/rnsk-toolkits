import { tool } from 'ai';
import { z } from 'zod';
import { CreateReplicationGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsCreateReplicationGroup = tool({
  description: 'Create a Redis replication group with read replicas. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationGroupId: z.string().describe('Unique identifier for the replication group'),
    replicationGroupDescription: z.string().describe('Description of the replication group'),
    cacheNodeType: z.string().describe('Node type (e.g., cache.t3.micro, cache.r6g.large)'),
    engine: z.string().describe('Cache engine (redis)'),
    numCacheClusters: z.number().optional().describe('Number of clusters (1 primary + n-1 replicas)'),
    automaticFailoverEnabled: z.boolean().optional().describe('Enable automatic failover (requires 2+ clusters)'),
    cacheSubnetGroupName: z.string().optional().describe('Subnet group name for VPC'),
    securityGroupIds: z.array(z.string()).optional().describe('VPC security group IDs'),
    atRestEncryptionEnabled: z.boolean().optional().describe('Enable encryption at rest'),
    transitEncryptionEnabled: z.boolean().optional().describe('Enable encryption in transit'),
  }),
  execute: async ({ awsCredentials, region, replicationGroupId, replicationGroupDescription, cacheNodeType, engine, numCacheClusters, automaticFailoverEnabled, cacheSubnetGroupName, securityGroupIds, atRestEncryptionEnabled, transitEncryptionEnabled }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new CreateReplicationGroupCommand({
          ReplicationGroupId: replicationGroupId,
          ReplicationGroupDescription: replicationGroupDescription,
          CacheNodeType: cacheNodeType,
          Engine: engine,
          NumCacheClusters: numCacheClusters,
          AutomaticFailoverEnabled: automaticFailoverEnabled,
          CacheSubnetGroupName: cacheSubnetGroupName,
          SecurityGroupIds: securityGroupIds,
          AtRestEncryptionEnabled: atRestEncryptionEnabled,
          TransitEncryptionEnabled: transitEncryptionEnabled,
      });
      const response = await client.send(command);
      return response.ReplicationGroup;
    } catch (err) {
      return { error: 'Failed to create a Redis replication group with read replicas', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
