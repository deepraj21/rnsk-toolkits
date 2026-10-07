// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { kafkaClusterRequest, failedResult, toKafkaError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Kafka credentials JSON with clusterRestUrl, clusterId, apiKey, apiSecret (Kafka API key with access to the cluster)',
  );
const groupField = z.string().describe('Consumer group ID');

export const kafkaListConsumerGroups = tool({
  description: 'List consumer groups on the cluster. Use to discover group IDs.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/consumer-groups');
      if (!result.ok) return failedResult('Failed to list consumer groups', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing consumer groups');
    }
  },
});

export const kafkaGetConsumerGroup = tool({
  description: 'Get one consumer group with state, coordinator, and partition assignor.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
  }),
  execute: async ({ kafkaCredentials, consumerGroupId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}`,
      );
      if (!result.ok) return failedResult('Failed to get consumer group', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting consumer group');
    }
  },
});

export const kafkaListConsumers = tool({
  description: 'List active consumers (members) of a consumer group.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
  }),
  execute: async ({ kafkaCredentials, consumerGroupId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/consumers`,
      );
      if (!result.ok) return failedResult('Failed to list consumers', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing consumers');
    }
  },
});

export const kafkaGetConsumer = tool({
  description: 'Get one consumer with client ID and instance details.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
    consumerId: z.string().describe('Consumer (member) ID'),
  }),
  execute: async ({ kafkaCredentials, consumerGroupId, consumerId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/consumers/${consumerId}`,
      );
      if (!result.ok) return failedResult('Failed to get consumer', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting consumer');
    }
  },
});

export const kafkaGetConsumerLagSummary = tool({
  description:
    'Get lag summary of a consumer group: max/total lag and partitions behind. Use to detect stuck consumers.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
  }),
  execute: async ({ kafkaCredentials, consumerGroupId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/lag-summary`,
      );
      if (!result.ok) return failedResult('Failed to get consumer lag summary', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting consumer lag summary');
    }
  },
});

export const kafkaListConsumerLags = tool({
  description: 'List per-topic consumer lags of a group (current offset vs log end offset).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
  }),
  execute: async ({ kafkaCredentials, consumerGroupId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/lags`,
      );
      if (!result.ok) return failedResult('Failed to list consumer lags', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing consumer lags');
    }
  },
});

export const kafkaGetConsumerLag = tool({
  description: 'Get consumer lag for one topic partition: offsets and lag.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
    topicName: z.string().describe('Topic name'),
    partitionId: z.number().int().min(0).describe('Partition ID'),
  }),
  execute: async ({ kafkaCredentials, consumerGroupId, topicName, partitionId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/lags/${topicName}/partitions/${partitionId}`,
      );
      if (!result.ok) return failedResult('Failed to get consumer lag', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting consumer lag');
    }
  },
});

export const kafkaListConsumerAssignments = tool({
  description: 'List topic-partition assignments of one consumer.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
    consumerId: z.string().describe('Consumer (member) ID'),
  }),
  execute: async ({ kafkaCredentials, consumerGroupId, consumerId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/consumers/${consumerId}/assignments`,
      );
      if (!result.ok) return failedResult('Failed to list consumer assignments', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing consumer assignments');
    }
  },
});

export const kafkaGetConsumerAssignment = tool({
  description: 'Get one partition assignment of a consumer (lag and offset details).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    consumerGroupId: groupField,
    consumerId: z.string().describe('Consumer (member) ID'),
    topicName: z.string().describe('Topic name'),
    partitionId: z.number().int().min(0).describe('Partition ID'),
  }),
  execute: async ({ kafkaCredentials, consumerGroupId, consumerId, topicName, partitionId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/consumer-groups/${consumerGroupId}/consumers/${consumerId}/assignments/${topicName}/partitions/${partitionId}`,
      );
      if (!result.ok) return failedResult('Failed to get consumer assignment', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting consumer assignment');
    }
  },
});

const aclShape = {
  resourceType: z.string().describe('TOPIC, GROUP, CLUSTER, TRANSACTIONAL_ID, etc.'),
  resourceName: z.string().describe('Resource name (cluster ID for CLUSTER type)'),
  patternType: z.enum(['LITERAL', 'PREFIXED']).describe('LITERAL or PREFIXED'),
  principal: z.string().describe('Principal, e.g. User:<service-account-id>'),
  host: z.string().optional().describe('Host (default *)'),
  operation: z.string().describe('READ, WRITE, CREATE, DELETE, DESCRIBE, ALTER, etc.'),
  permission: z.enum(['ALLOW', 'DENY']).describe('ALLOW or DENY'),
};

export const kafkaListAcls = tool({
  description: 'List ACLs on the cluster with optional search filters.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    resourceType: z.string().optional().describe('Filter by resource type'),
    resourceName: z.string().optional().describe('Filter by resource name'),
    patternType: z.string().optional().describe('Filter by pattern type'),
    principal: z.string().optional().describe('Filter by principal'),
    operation: z.string().optional().describe('Filter by operation'),
    permission: z.string().optional().describe('Filter by ALLOW/DENY'),
  }),
  execute: async ({ kafkaCredentials, ...filters }) => {
    try {
      const query: Record<string, unknown> = {
        resource_type: filters.resourceType,
        resource_name: filters.resourceName,
        pattern_type: filters.patternType,
        principal: filters.principal,
        operation: filters.operation,
        permission: filters.permission,
      };
      const result = await kafkaClusterRequest(kafkaCredentials, '/acls', { query });
      if (!result.ok) return failedResult('Failed to list ACLs', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing ACLs');
    }
  },
});

export const kafkaCreateAcl = tool({
  description:
    'Create one ACL entry (principal, resource, operation, ALLOW/DENY). Use to grant topic access to service accounts.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    ...aclShape,
  }),
  execute: async ({
    kafkaCredentials,
    resourceType,
    resourceName,
    patternType,
    principal,
    host,
    operation,
    permission,
  }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/acls', {
        method: 'POST',
        body: {
          resource_type: resourceType,
          resource_name: resourceName,
          pattern_type: patternType,
          principal,
          host: host ?? '*',
          operation,
          permission,
        },
      });
      if (!result.ok) return failedResult('Failed to create ACL', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating ACL');
    }
  },
});

export const kafkaCreateAclsBatch = tool({
  description: 'Create multiple ACL entries in one call.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    acls: z
      .array(z.object({ ...aclShape }))
      .min(1)
      .describe('ACL entries (host defaults to * when omitted)'),
  }),
  execute: async ({ kafkaCredentials, acls }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/acls:batch', {
        method: 'POST',
        body: {
          data: acls.map((a) => ({
            resource_type: a.resourceType,
            resource_name: a.resourceName,
            pattern_type: a.patternType,
            principal: a.principal,
            host: a.host ?? '*',
            operation: a.operation,
            permission: a.permission,
          })),
        },
      });
      if (!result.ok) return failedResult('Failed to create ACLs batch', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating ACLs batch');
    }
  },
});

export const kafkaDeleteAcls = tool({
  description:
    'Delete ACLs matching the search criteria (resource type/pattern, principal, operation, permission required).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    resourceType: z.string().describe('Resource type to match'),
    patternType: z.string().describe('Pattern type to match'),
    operation: z.string().describe('Operation to match'),
    permission: z.string().describe('ALLOW or DENY'),
    resourceName: z.string().optional().describe('Resource name to match'),
    principal: z.string().optional().describe('Principal to match'),
    host: z.string().optional().describe('Host to match'),
  }),
  execute: async ({
    kafkaCredentials,
    resourceType,
    patternType,
    operation,
    permission,
    resourceName,
    principal,
    host,
  }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/acls', {
        method: 'DELETE',
        query: {
          resource_type: resourceType,
          resource_name: resourceName,
          pattern_type: patternType,
          principal,
          host,
          operation,
          permission,
        },
      });
      if (!result.ok) return failedResult('Failed to delete ACLs', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting ACLs');
    }
  },
});
