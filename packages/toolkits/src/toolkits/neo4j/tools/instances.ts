// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { auraRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const instanceIdField = z.string().describe('Aura instance ID');
const instanceTypeEnum = z.enum(['enterprise-db', 'enterprise-ds', 'business-critical', 'professional-db', 'professional-ds', 'free-db']);
const cloudProviderEnum = z.enum(['gcp', 'aws', 'azure']);

export const neo4jCreateInstanceBeta = tool({
    description:
        'Create a new Neo4j Aura instance (v1beta5). Provisioning is asynchronous (202 Accepted). Save the returned username and password securely; they cannot be retrieved again.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        name: z.string().min(1).max(30).describe('Instance name, max 30 chars'),
        type: instanceTypeEnum.describe('Instance type'),
        memory: z.string().describe("Memory size, e.g. '1GB'"),
        region: z.string().describe("Region, e.g. 'europe-west1'"),
        tenantId: z.string().describe('Project/tenant ID to create the instance in'),
        version: z.string().describe("Neo4j version, e.g. '5'"),
        cloudProvider: cloudProviderEnum.describe('Cloud provider'),
        storage: z.string().optional().describe("Storage size, e.g. '10GB'"),
        vectorOptimized: z.boolean().optional().describe('Enable vector optimization'),
        graphAnalyticsPlugin: z.boolean().optional().describe('Enable graph analytics plugin'),
        sourceInstanceId: z.string().optional().describe('Source instance ID when cloning'),
        sourceSnapshotId: z.string().optional().describe('Snapshot ID to create from (requires sourceInstanceId)'),
        customerManagedKeyId: z.string().optional().describe('Customer managed key ID'),
    }),
    execute: async ({ neo4jCredentials, name, type, memory, region, tenantId, version, cloudProvider, storage, vectorOptimized, graphAnalyticsPlugin, sourceInstanceId, sourceSnapshotId, customerManagedKeyId }) => {
        return auraRequest(neo4jCredentials, '/v1beta5/instances', {
            method: 'POST',
            body: {
                name,
                type,
                memory,
                region,
                tenant_id: tenantId,
                version,
                cloud_provider: cloudProvider,
                storage,
                vector_optimized: vectorOptimized,
                graph_analytics_plugin: graphAnalyticsPlugin,
                source_instance_id: sourceInstanceId,
                source_snapshot_id: sourceSnapshotId,
                customer_managed_key_id: customerManagedKeyId,
            },
        });
    },
});

export const neo4jGetInstanceBeta = tool({
    description:
        'Get details of a Neo4j Aura instance by ID (v1beta5): status, configuration, connection URL. Read-only.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
    }),
    execute: async ({ neo4jCredentials, instanceId }) => {
        return auraRequest(neo4jCredentials, `/v1beta5/instances/${encodeURIComponent(instanceId)}`);
    },
});

export const neo4jListInstancesBeta = tool({
    description:
        'List Neo4j Aura instances, optionally filtered by tenant. Use to discover available instances.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        tenantId: z.string().optional().describe('Filter instances by tenant/project ID'),
    }),
    execute: async ({ neo4jCredentials, tenantId }) => {
        return auraRequest(neo4jCredentials, '/v1beta5/instances', { query: { tenantId } });
    },
});

const updateShape = {
    name: z.string().min(1).max(30).optional().describe('New instance name'),
    memory: z.string().optional().describe("New memory size, e.g. '8GB'"),
    storage: z.string().optional().describe("New storage size, e.g. '50GB'"),
    vectorOptimized: z.boolean().optional().describe('Toggle vector optimization'),
    graphAnalyticsPlugin: z.boolean().optional().describe('Toggle graph analytics plugin'),
};

export const neo4jUpdateInstance = tool({
    description:
        'Update a Neo4j Aura instance (v1): rename, resize memory/storage, toggle vector optimization or analytics plugin. Resizes may process asynchronously.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
        ...updateShape,
    }),
    execute: async ({ neo4jCredentials, instanceId, name, memory, storage, vectorOptimized, graphAnalyticsPlugin }) => {
        return auraRequest(neo4jCredentials, `/v1/instances/${encodeURIComponent(instanceId)}`, {
            method: 'PATCH',
            body: {
                name,
                memory,
                storage,
                vector_optimized: vectorOptimized,
                graph_analytics_plugin: graphAnalyticsPlugin,
            },
        });
    },
});

export const neo4jUpdateInstanceBeta = tool({
    description:
        'Update a Neo4j Aura instance (v1beta5): rename, resize memory/storage, toggle plugins. May return 202 Accepted for async processing.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
        ...updateShape,
    }),
    execute: async ({ neo4jCredentials, instanceId, name, memory, storage, vectorOptimized, graphAnalyticsPlugin }) => {
        return auraRequest(neo4jCredentials, `/v1beta5/instances/${encodeURIComponent(instanceId)}`, {
            method: 'PATCH',
            body: {
                name,
                memory,
                storage,
                vector_optimized: vectorOptimized,
                graph_analytics_plugin: graphAnalyticsPlugin,
            },
        });
    },
});

export const neo4jPauseInstanceBeta = tool({
    description:
        'Pause a Neo4j Aura instance to save costs or for maintenance. Asynchronous; resume it later. Fails if another operation (e.g. cloning) is in progress.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: instanceIdField,
    }),
    execute: async ({ neo4jCredentials, instanceId }) => {
        return auraRequest(neo4jCredentials, `/v1beta5/instances/${encodeURIComponent(instanceId)}/pause`, {
            method: 'POST',
        });
    },
});
