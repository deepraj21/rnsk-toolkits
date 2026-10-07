// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { confluentCloudRequest, failedResult, toKafkaError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Kafka credentials JSON with cloudApiKey and cloudApiSecret (Confluent Cloud API key) for management calls',
  );

export const kafkaListEnvironments = tool({
  description: 'List Confluent Cloud environments. Use to discover environment IDs.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    pageSize: z.number().int().min(1).optional().describe('Page size'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ kafkaCredentials, pageSize, pageToken }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/org/v2/environments', {
        query: { page_size: pageSize, page_token: pageToken },
      });
      if (!result.ok) return failedResult('Failed to list environments', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing environments');
    }
  },
});

export const kafkaGetEnvironment = tool({
  description: 'Get one environment with display name and stream governance config.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    environmentId: z.string().describe('Environment ID, e.g. env-abc123'),
  }),
  execute: async ({ kafkaCredentials, environmentId }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/org/v2/environments/${environmentId}`,
      );
      if (!result.ok) return failedResult('Failed to get environment', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting environment');
    }
  },
});

export const kafkaCreateEnvironment = tool({
  description: 'Create a Confluent Cloud environment (governance package optional).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    displayName: z.string().describe('Environment display name'),
    streamGovernance: z
      .record(z.string(), z.any())
      .optional()
      .describe('Stream governance config, e.g. {package: "ESSENTIALS"}'),
  }),
  execute: async ({ kafkaCredentials, displayName, streamGovernance }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/org/v2/environments', {
        method: 'POST',
        body: {
          display_name: displayName,
          ...(streamGovernance !== undefined ? { stream_governance: streamGovernance } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create environment', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating environment');
    }
  },
});

export const kafkaUpdateEnvironment = tool({
  description: 'Rename a Confluent Cloud environment.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    environmentId: z.string().describe('Environment ID'),
    displayName: z.string().describe('New display name'),
  }),
  execute: async ({ kafkaCredentials, environmentId, displayName }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/org/v2/environments/${environmentId}`,
        {
          method: 'PATCH',
          body: { display_name: displayName },
        },
      );
      if (!result.ok) return failedResult('Failed to update environment', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating environment');
    }
  },
});

export const kafkaDeleteEnvironment = tool({
  description: 'Delete an environment (must be empty first).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    environmentId: z.string().describe('Environment ID'),
  }),
  execute: async ({ kafkaCredentials, environmentId }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/org/v2/environments/${environmentId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete environment', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting environment');
    }
  },
});

export const kafkaListManagedClusters = tool({
  description: 'List managed Kafka clusters in an environment with phases and endpoints.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    environmentId: z.string().describe('Environment ID'),
    pageSize: z.number().int().min(1).optional().describe('Page size'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ kafkaCredentials, environmentId, pageSize, pageToken }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/cmk/v2/clusters', {
        query: { environment: environmentId, page_size: pageSize, page_token: pageToken },
      });
      if (!result.ok) return failedResult('Failed to list managed clusters', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing managed clusters');
    }
  },
});

export const kafkaGetManagedCluster = tool({
  description: 'Get one managed cluster with bootstrap/REST endpoints and status.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    clusterId: z.string().describe('Cluster ID, e.g. lkc-abc123'),
    environmentId: z.string().describe('Environment ID containing the cluster'),
  }),
  execute: async ({ kafkaCredentials, clusterId, environmentId }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/cmk/v2/clusters/${clusterId}`,
        {
          query: { environment: environmentId },
        },
      );
      if (!result.ok) return failedResult('Failed to get managed cluster', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting managed cluster');
    }
  },
});

export const kafkaCreateManagedCluster = tool({
  description:
    'Provision a Kafka cluster: Basic/Standard/Enterprise (LOW/HIGH availability) or Dedicated (SINGLE_ZONE/MULTI_ZONE with CKUs).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    displayName: z.string().describe('Cluster display name'),
    availability: z
      .enum(['SINGLE_ZONE', 'MULTI_ZONE', 'LOW', 'HIGH'])
      .describe(
        'Availability: SINGLE_ZONE/MULTI_ZONE (Dedicated) or LOW/HIGH (Basic/Standard/Enterprise)',
      ),
    cloud: z.enum(['AWS', 'GCP', 'AZURE']).describe('Cloud provider'),
    region: z.string().describe('Cloud region, e.g. us-west-2'),
    kind: z
      .enum(['Basic', 'Standard', 'Enterprise', 'Dedicated', 'Freight'])
      .describe('Cluster type'),
    ckus: z.number().int().min(1).optional().describe('CKUs for Dedicated clusters'),
    environmentId: z.string().describe('Environment ID'),
    networkId: z.string().optional().describe('Network ID for private networking'),
  }),
  execute: async ({
    kafkaCredentials,
    displayName,
    availability,
    cloud,
    region,
    kind,
    ckus,
    environmentId,
    networkId,
  }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/cmk/v2/clusters', {
        method: 'POST',
        body: {
          spec: {
            display_name: displayName,
            availability,
            cloud,
            region,
            config: {
              kind,
              ...(ckus !== undefined ? { ckus } : {}),
            },
            environment: { id: environmentId },
            ...(networkId !== undefined ? { network: { id: networkId } } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create managed cluster', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating managed cluster');
    }
  },
});

export const kafkaUpdateManagedCluster = tool({
  description:
    'Update a cluster: rename, change type (Basic to Standard upgrade), or scale Dedicated CKUs.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    clusterId: z.string().describe('Cluster ID'),
    environmentId: z.string().describe('Environment ID containing the cluster'),
    displayName: z.string().optional().describe('New display name'),
    kind: z.string().optional().describe('New cluster type, e.g. Standard'),
    ckus: z.number().int().min(1).optional().describe('New CKU count (Dedicated only)'),
  }),
  execute: async ({ kafkaCredentials, clusterId, environmentId, displayName, kind, ckus }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/cmk/v2/clusters/${clusterId}`,
        {
          method: 'PATCH',
          body: {
            spec: {
              environment: { id: environmentId },
              ...(displayName !== undefined ? { display_name: displayName } : {}),
              ...(kind !== undefined || ckus !== undefined
                ? {
                    config: {
                      ...(kind !== undefined ? { kind } : {}),
                      ...(ckus !== undefined ? { ckus } : {}),
                    },
                  }
                : {}),
            },
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update managed cluster', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating managed cluster');
    }
  },
});

export const kafkaDeleteManagedCluster = tool({
  description: 'Delete a managed cluster and all its data. Cannot be undone.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    clusterId: z.string().describe('Cluster ID'),
    environmentId: z.string().describe('Environment ID containing the cluster'),
  }),
  execute: async ({ kafkaCredentials, clusterId, environmentId }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/cmk/v2/clusters/${clusterId}`,
        {
          method: 'DELETE',
          query: { environment: environmentId },
        },
      );
      if (!result.ok) return failedResult('Failed to delete managed cluster', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting managed cluster');
    }
  },
});

export const kafkaListApiKeys = tool({
  description: 'List API keys with owners and resources. Secrets are never returned.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    owner: z.string().optional().describe('Filter by owner ID'),
    pageSize: z.number().int().min(1).optional().describe('Page size'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ kafkaCredentials, owner, pageSize, pageToken }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/iam/v2/api-keys', {
        query: { 'spec.owner': owner, page_size: pageSize, page_token: pageToken },
      });
      if (!result.ok) return failedResult('Failed to list API keys', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing API keys');
    }
  },
});

export const kafkaGetApiKey = tool({
  description: 'Get one API key metadata (owner, resource, creation time).',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    keyId: z.string().describe('API key ID'),
  }),
  execute: async ({ kafkaCredentials, keyId }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, `/iam/v2/api-keys/${keyId}`);
      if (!result.ok) return failedResult('Failed to get API key', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting API key');
    }
  },
});

export const kafkaCreateApiKey = tool({
  description:
    'Create an API key for an owner (user, service account, or cluster resource). The secret is returned once — store it immediately.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    ownerId: z.string().describe('Owner ID (user, service account, or cluster ID)'),
    ownerKind: z
      .string()
      .describe(
        'Owner kind, e.g. User, ServiceAccount, CloudCluster, SchemaRegistry, KsqlCluster, ConnectCluster',
      ),
    resourceId: z
      .string()
      .optional()
      .describe('Resource ID the key is scoped to (for resource keys)'),
    description: z.string().optional().describe('Key description'),
  }),
  execute: async ({ kafkaCredentials, ownerId, ownerKind, resourceId, description }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/iam/v2/api-keys', {
        method: 'POST',
        body: {
          spec: {
            owner: { id: ownerId, kind: ownerKind },
            ...(resourceId !== undefined ? { resource: { id: resourceId } } : {}),
            ...(description !== undefined ? { description } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create API key', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating API key');
    }
  },
});

export const kafkaUpdateApiKey = tool({
  description: 'Update an API key description.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    keyId: z.string().describe('API key ID'),
    description: z.string().describe('New description'),
  }),
  execute: async ({ kafkaCredentials, keyId, description }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, `/iam/v2/api-keys/${keyId}`, {
        method: 'PATCH',
        body: { spec: { description } },
      });
      if (!result.ok) return failedResult('Failed to update API key', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating API key');
    }
  },
});

export const kafkaDeleteApiKey = tool({
  description: 'Delete (revoke) an API key. Dependent workloads lose access immediately.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    keyId: z.string().describe('API key ID'),
  }),
  execute: async ({ kafkaCredentials, keyId }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, `/iam/v2/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete API key', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting API key');
    }
  },
});

export const kafkaListServiceAccounts = tool({
  description: 'List service accounts for automation principals.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    pageSize: z.number().int().min(1).optional().describe('Page size'),
    pageToken: z.string().optional().describe('Page token from a previous response'),
  }),
  execute: async ({ kafkaCredentials, pageSize, pageToken }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/iam/v2/service-accounts', {
        query: { page_size: pageSize, page_token: pageToken },
      });
      if (!result.ok) return failedResult('Failed to list service accounts', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error listing service accounts');
    }
  },
});

export const kafkaGetServiceAccount = tool({
  description: 'Get one service account.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    serviceAccountId: z.string().describe('Service account ID, e.g. sa-abc123'),
  }),
  execute: async ({ kafkaCredentials, serviceAccountId }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/iam/v2/service-accounts/${serviceAccountId}`,
      );
      if (!result.ok) return failedResult('Failed to get service account', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error getting service account');
    }
  },
});

export const kafkaCreateServiceAccount = tool({
  description: 'Create a service account for apps and automation to authenticate as.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    displayName: z.string().describe('Service account display name'),
    description: z.string().optional().describe('Description'),
  }),
  execute: async ({ kafkaCredentials, displayName, description }) => {
    try {
      const result = await confluentCloudRequest(kafkaCredentials, '/iam/v2/service-accounts', {
        method: 'POST',
        body: {
          display_name: displayName,
          ...(description !== undefined ? { description } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create service account', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error creating service account');
    }
  },
});

export const kafkaUpdateServiceAccount = tool({
  description: 'Update a service account name or description.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    serviceAccountId: z.string().describe('Service account ID'),
    displayName: z.string().optional().describe('New display name'),
    description: z.string().optional().describe('New description'),
  }),
  execute: async ({ kafkaCredentials, serviceAccountId, displayName, description }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/iam/v2/service-accounts/${serviceAccountId}`,
        {
          method: 'PATCH',
          body: {
            ...(displayName !== undefined ? { display_name: displayName } : {}),
            ...(description !== undefined ? { description } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update service account', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error updating service account');
    }
  },
});

export const kafkaDeleteServiceAccount = tool({
  description: 'Delete a service account and its role bindings.',
  inputSchema: z.object({
    kafkaCredentials: credentialsField,
    serviceAccountId: z.string().describe('Service account ID'),
  }),
  execute: async ({ kafkaCredentials, serviceAccountId }) => {
    try {
      const result = await confluentCloudRequest(
        kafkaCredentials,
        `/iam/v2/service-accounts/${serviceAccountId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete service account', result);
      return result.data;
    } catch (error) {
      return toKafkaError(error, 'Error deleting service account');
    }
  },
});
