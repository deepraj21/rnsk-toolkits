// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { kafkaClusterRequest, kafkaRootRequest, failedResult, toKafkaError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Kafka credentials JSON with clusterRestUrl, clusterId, apiKey, apiSecret (Kafka API key with access to the cluster)',
  );
const topicField = z.string().describe('Topic name');

export const kafkaListClusters = tool({
  description:
    'List Kafka clusters visible through this REST endpoint. Use to confirm connectivity.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      const result = await kafkaRootRequest(kafkaCredentials, '/clusters');
      if (!result.ok) return failedResult('Failed to list clusters', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing clusters');
    }
  },
});

export const kafkaGetCluster = tool({
  description: 'Get the Kafka cluster: ID, topics/partitions links, and related resources.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      // Empty path resolves to the cluster resource itself (clusterId is in the base URL).
      const result = await kafkaClusterRequest(kafkaCredentials, '');
      if (!result.ok) return failedResult('Failed to get cluster', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting cluster');
    }
  },
});

export const kafkaListTopics = tool({
  description: 'List topics on the Kafka cluster. Use to discover topic names.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/topics');
      if (!result.ok) return failedResult('Failed to list topics', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing topics');
    }
  },
});

export const kafkaGetTopic = tool({
  description: 'Get one topic: partitions count, replication factor, configs and partition links.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
  }),
  execute: async ({ kafkaCredentials, topicName }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/topics/${topicName}`);
      if (!result.ok) return failedResult('Failed to get topic', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting topic');
    }
  },
});

export const kafkaCreateTopic = tool({
  description:
    'Create a topic with partitions count, replication factor, and optional configs. Supports dry-run validation via validateOnly.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    partitionsCount: z.number().int().min(1).describe('Number of partitions'),
    replicationFactor: z.number().int().min(1).optional().describe('Replication factor'),
    configs: z
      .array(z.object({ name: z.string(), value: z.string().optional() }))
      .optional()
      .describe('Topic configs, e.g. [{name:"cleanup.policy", value:"compact"}]'),
    validateOnly: z.boolean().optional().describe('Validate only, without creating the topic'),
  }),
  execute: async ({
    kafkaCredentials,
    topicName,
    partitionsCount,
    replicationFactor,
    configs,
    validateOnly,
  }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/topics', {
        method: 'POST',
        body: {
          topic_name: topicName,
          partitions_count: partitionsCount,
          ...(replicationFactor !== undefined ? { replication_factor: replicationFactor } : {}),
          ...(configs !== undefined ? { configs } : {}),
          ...(validateOnly === true ? { validate_only: true } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create topic', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating topic');
    }
  },
});

export const kafkaIncreaseTopicPartitions = tool({
  description: 'Increase the partition count of a topic (cannot be decreased).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    partitionsCount: z.number().int().min(1).describe('New total partition count (must increase)'),
  }),
  execute: async ({ kafkaCredentials, topicName, partitionsCount }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/topics/${topicName}`, {
        method: 'PATCH',
        body: { partitions_count: partitionsCount },
      });
      if (!result.ok) return failedResult('Failed to increase topic partitions', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error increasing topic partitions');
    }
  },
});

export const kafkaDeleteTopic = tool({
  description: 'Delete a topic and all its data. Cannot be undone.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
  }),
  execute: async ({ kafkaCredentials, topicName }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/topics/${topicName}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete topic', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting topic');
    }
  },
});

export const kafkaListTopicConfigs = tool({
  description: 'List all configuration parameters of a topic.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
  }),
  execute: async ({ kafkaCredentials, topicName }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/topics/${topicName}/configs`);
      if (!result.ok) return failedResult('Failed to list topic configs', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing topic configs');
    }
  },
});

export const kafkaGetTopicConfig = tool({
  description: 'Get one topic configuration parameter (value, source, synonyms).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    configName: z.string().describe('Config name, e.g. cleanup.policy'),
  }),
  execute: async ({ kafkaCredentials, topicName, configName }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/configs/${configName}`,
      );
      if (!result.ok) return failedResult('Failed to get topic config', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting topic config');
    }
  },
});

export const kafkaAlterTopicConfigs = tool({
  description:
    'Set or delete multiple topic configs in one batch. Each entry: {name, value?, operation?} where operation defaults to SET; use DELETE to reset.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    configs: z
      .array(
        z.object({
          name: z.string(),
          value: z.string().optional(),
          operation: z.enum(['SET', 'DELETE', 'APPEND', 'SUBTRACT']).optional(),
        }),
      )
      .min(1)
      .describe('Config operations'),
    validateOnly: z.boolean().optional().describe('Validate only, without applying changes'),
  }),
  execute: async ({ kafkaCredentials, topicName, configs, validateOnly }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/configs:alter`,
        {
          method: 'POST',
          body: {
            data: configs.map((c) => ({
              name: c.name,
              ...(c.value !== undefined ? { value: c.value } : {}),
              ...(c.operation !== undefined ? { operation: c.operation } : {}),
            })),
            ...(validateOnly === true ? { validate_only: true } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to alter topic configs', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error altering topic configs');
    }
  },
});

export const kafkaUpdateTopicConfig = tool({
  description: 'Set a single topic configuration parameter value.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    configName: z.string().describe('Config name, e.g. retention.ms'),
    value: z.string().describe('New config value'),
  }),
  execute: async ({ kafkaCredentials, topicName, configName, value }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/configs/${configName}`,
        { method: 'PUT', body: { value } },
      );
      if (!result.ok) return failedResult('Failed to update topic config', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating topic config');
    }
  },
});

export const kafkaDeleteTopicConfig = tool({
  description: 'Reset a topic configuration parameter to its default (delete the override).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    configName: z.string().describe('Config name to reset'),
  }),
  execute: async ({ kafkaCredentials, topicName, configName }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/configs/${configName}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete topic config', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting topic config');
    }
  },
});

export const kafkaListPartitions = tool({
  description: 'List partitions of a topic with leader and replica info.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
  }),
  execute: async ({ kafkaCredentials, topicName }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/topics/${topicName}/partitions`);
      if (!result.ok) return failedResult('Failed to list partitions', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing partitions');
    }
  },
});

export const kafkaGetPartition = tool({
  description: 'Get one partition with leader, replicas, and reassignment state.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    partitionId: z.number().int().min(0).describe('Partition ID'),
  }),
  execute: async ({ kafkaCredentials, topicName, partitionId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/partitions/${partitionId}`,
      );
      if (!result.ok) return failedResult('Failed to get partition', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting partition');
    }
  },
});

export const kafkaGetPartitionOffsets = tool({
  description: 'Get beginning and end offsets of one partition. Use to gauge backlog size.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    partitionId: z.number().int().min(0).describe('Partition ID'),
  }),
  execute: async ({ kafkaCredentials, topicName, partitionId }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/partitions/${partitionId}/offset`,
      );
      if (!result.ok) return failedResult('Failed to get partition offsets', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting partition offsets');
    }
  },
});

const recordDataField = z
  .object({ type: z.enum(['BINARY', 'JSON', 'STRING']), data: z.any() })
  .describe('Record payload: BINARY (base64 string), JSON (object), or STRING (text)');

export const kafkaProduceRecord = tool({
  description:
    'Produce a single record to a topic (non-streaming). Key/value as BINARY base64, JSON object, or STRING text. Returns the delivery report with offset.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    value: recordDataField,
    key: recordDataField.optional().describe('Optional record key'),
    partitionId: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Target partition (omit for key-based routing)'),
    headers: z
      .array(z.object({ name: z.string(), value: z.string().optional() }))
      .optional()
      .describe('Record headers (values base64)'),
  }),
  execute: async ({ kafkaCredentials, topicName, value, key, partitionId, headers }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/topics/${topicName}/records`, {
        method: 'POST',
        body: {
          ...(partitionId !== undefined ? { partition_id: partitionId } : {}),
          ...(headers !== undefined ? { headers } : {}),
          ...(key !== undefined ? { key } : {}),
          value,
        },
      });
      if (!result.ok) return failedResult('Failed to produce record', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error producing record');
    }
  },
});

export const kafkaProduceRecordsBatch = tool({
  description:
    'Produce a batch of records (each with a client id) to a topic in one call. Returns per-record delivery reports; check each error_code.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    topicName: topicField,
    entries: z
      .array(
        z.object({
          id: z.string().describe('Client batch entry ID (1-80 chars)'),
          value: recordDataField.optional(),
          key: recordDataField.optional(),
          partitionId: z.number().int().min(0).optional(),
          headers: z.array(z.object({ name: z.string(), value: z.string().optional() })).optional(),
        }),
      )
      .min(1)
      .describe('Batch entries'),
  }),
  execute: async ({ kafkaCredentials, topicName, entries }) => {
    try {
      const result = await kafkaClusterRequest(
        kafkaCredentials,
        `/topics/${topicName}/records:batch`,
        {
          method: 'POST',
          body: {
            entries: entries.map((e) => ({
              id: e.id,
              ...(e.partitionId !== undefined ? { partition_id: e.partitionId } : {}),
              ...(e.headers !== undefined ? { headers: e.headers } : {}),
              ...(e.key !== undefined ? { key: e.key } : {}),
              ...(e.value !== undefined ? { value: e.value } : {}),
            })),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to produce records batch', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error producing records batch');
    }
  },
});

export const kafkaListBrokers = tool({
  description: 'List brokers of the Kafka cluster.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/brokers');
      if (!result.ok) return failedResult('Failed to list brokers', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing brokers');
    }
  },
});

export const kafkaGetBroker = tool({
  description: 'Get one broker with host, port, and rack info.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    brokerId: z.number().int().min(0).describe('Broker ID'),
  }),
  execute: async ({ kafkaCredentials, brokerId }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/brokers/${brokerId}`);
      if (!result.ok) return failedResult('Failed to get broker', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting broker');
    }
  },
});

export const kafkaListBrokerConfigs = tool({
  description: 'List dynamic cluster-wide broker configurations.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
  }),
  execute: async ({ kafkaCredentials }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/broker-configs');
      if (!result.ok) return failedResult('Failed to list broker configs', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing broker configs');
    }
  },
});

export const kafkaGetBrokerConfig = tool({
  description: 'Get one dynamic broker configuration parameter.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    configName: z.string().describe('Config name'),
  }),
  execute: async ({ kafkaCredentials, configName }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, `/broker-configs/${configName}`);
      if (!result.ok) return failedResult('Failed to get broker config', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting broker config');
    }
  },
});

export const kafkaAlterBrokerConfigs = tool({
  description:
    'Set or delete dynamic broker configs in one batch: {name, value?, operation?} (SET default, DELETE to reset).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    configs: z
      .array(
        z.object({
          name: z.string(),
          value: z.string().optional(),
          operation: z.enum(['SET', 'DELETE', 'APPEND', 'SUBTRACT']).optional(),
        }),
      )
      .min(1)
      .describe('Broker config operations'),
  }),
  execute: async ({ kafkaCredentials, configs }) => {
    try {
      const result = await kafkaClusterRequest(kafkaCredentials, '/broker-configs:alter', {
        method: 'POST',
        body: {
          data: configs.map((c) => ({
            name: c.name,
            ...(c.value !== undefined ? { value: c.value } : {}),
            ...(c.operation !== undefined ? { operation: c.operation } : {}),
          })),
        },
      });
      if (!result.ok) return failedResult('Failed to alter broker configs', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error altering broker configs');
    }
  },
});
