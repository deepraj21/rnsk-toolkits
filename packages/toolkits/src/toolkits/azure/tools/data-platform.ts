// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');
const SQL_API = '2021-11-01';
const AKS_API = '2024-01-01';
const VAULT_API = '2023-07-01';

export const azureListSqlServers = tool({
  description: 'List Azure SQL logical servers in a subscription. Returns name, location, version and admin login.',
  inputSchema: z.object({ azureCredentials: authField, subscriptionId: subField }),
  execute: async ({ azureCredentials, subscriptionId }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Sql/servers`, {
        apiVersion: SQL_API,
      })) as { value?: unknown[] };
      return { count: (data.value ?? []).length, sqlServers: data.value ?? [] };
    } catch (error) {
      return { error: 'Failed to list SQL servers', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListSqlDatabases = tool({
  description: 'List databases on an Azure SQL logical server. Returns name, SKU, status, collation and max size.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the SQL server'),
    serverName: z.string().describe('SQL logical server name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, serverName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Sql/servers/${encodeURIComponent(serverName)}/databases`,
        { apiVersion: SQL_API },
      )) as { value?: unknown[] };
      return { count: (data.value ?? []).length, databases: data.value ?? [] };
    } catch (error) {
      return { error: 'Failed to list SQL databases', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListKubernetesClusters = tool({
  description: 'List Azure Kubernetes Service (AKS) managed clusters. Returns name, location, Kubernetes version and node pools.',
  inputSchema: z.object({ azureCredentials: authField, subscriptionId: subField }),
  execute: async ({ azureCredentials, subscriptionId }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.ContainerService/managedClusters`,
        { apiVersion: AKS_API },
      )) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { kubernetesVersion?: string; powerState?: { code?: string } } }>;
      };
      const clusters = (data.value ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
        kubernetesVersion: c.properties?.kubernetesVersion,
        powerState: c.properties?.powerState?.code,
      }));
      return { count: clusters.length, clusters };
    } catch (error) {
      return { error: 'Failed to list Kubernetes clusters', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListKeyVaults = tool({
  description: 'List Key Vaults in a subscription. Returns name, location, SKU and vault URI for secrets management.',
  inputSchema: z.object({ azureCredentials: authField, subscriptionId: subField }),
  execute: async ({ azureCredentials, subscriptionId }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.KeyVault/vaults`, {
        apiVersion: VAULT_API,
      })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { vaultUri?: string; sku?: { name?: string } } }>;
      };
      const vaults = (data.value ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        location: v.location,
        vaultUri: v.properties?.vaultUri,
        sku: v.properties?.sku?.name,
      }));
      return { count: vaults.length, vaults };
    } catch (error) {
      return { error: 'Failed to list Key Vaults', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetSqlDatabase = tool({
  description: 'Get details of an Azure SQL database including SKU, status, collation, max size and zone redundancy.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the SQL server'),
    serverName: z.string().describe('SQL logical server name'),
    databaseName: z.string().describe('Database name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, serverName, databaseName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Sql/servers/${encodeURIComponent(serverName)}/databases/${encodeURIComponent(databaseName)}`,
        { apiVersion: SQL_API },
      );
    } catch (error) {
      return { error: 'Failed to get SQL database', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListCosmosDbAccounts = tool({
  description: 'List Azure Cosmos DB accounts in a subscription or resource group. Returns API kind, locations, consistency and endpoints.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const path = resourceGroupName
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.DocumentDB/databaseAccounts`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.DocumentDB/databaseAccounts`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: '2024-08-15' })) as {
        value?: Array<{ id?: string; name?: string; location?: string; kind?: string; properties?: { documentEndpoint?: string } }>;
      };
      const accounts = (data.value ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        location: a.location,
        kind: a.kind,
        documentEndpoint: a.properties?.documentEndpoint,
      }));
      return { count: accounts.length, cosmosDbAccounts: accounts };
    } catch (error) {
      return { error: 'Failed to list Cosmos DB accounts', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListContainerRegistries = tool({
  description: 'List Azure Container Registry (ACR) registries. Returns login server, SKU and admin-user status for image hosting.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const path = resourceGroupName
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.ContainerRegistry/registries`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.ContainerRegistry/registries`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: '2023-07-01' })) as {
        value?: Array<{ id?: string; name?: string; location?: string; sku?: { name?: string }; properties?: { loginServer?: string; adminUserEnabled?: boolean } }>;
      };
      const registries = (data.value ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        location: r.location,
        sku: r.sku?.name,
        loginServer: r.properties?.loginServer,
        adminUserEnabled: r.properties?.adminUserEnabled,
      }));
      return { count: registries.length, containerRegistries: registries };
    } catch (error) {
      return { error: 'Failed to list container registries', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListContainerGroups = tool({
  description: 'List Azure Container Instances (serverless containers). Returns state, IP, container image and restart policy.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const path = resourceGroupName
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.ContainerInstance/containerGroups`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.ContainerInstance/containerGroups`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: '2023-05-01' })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { provisioningState?: string; ipAddress?: { ip?: string } } }>;
      };
      const groups = (data.value ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        location: g.location,
        provisioningState: g.properties?.provisioningState,
        ip: g.properties?.ipAddress?.ip,
      }));
      return { count: groups.length, containerGroups: groups };
    } catch (error) {
      return { error: 'Failed to list container groups', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetKubernetesCluster = tool({
  description: 'Get an AKS cluster including Kubernetes version, DNS prefix, node pool profiles, network profile and power state.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the AKS cluster'),
    clusterName: z.string().describe('AKS managed cluster name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, clusterName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.ContainerService/managedClusters/${encodeURIComponent(clusterName)}`,
        { apiVersion: AKS_API },
      );
    } catch (error) {
      return { error: 'Failed to get Kubernetes cluster', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListAgentPools = tool({
  description: 'List node pools (agent pools) of an AKS cluster. Returns VM size, count, OS, mode and autoscaling config.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the AKS cluster'),
    clusterName: z.string().describe('AKS managed cluster name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, clusterName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.ContainerService/managedClusters/${encodeURIComponent(clusterName)}/agentPools`,
        { apiVersion: AKS_API },
      )) as {
        value?: Array<{ id?: string; name?: string; properties?: { vmSize?: string; count?: number; osType?: string; mode?: string; enableAutoScaling?: boolean } }>;
      };
      const pools = (data.value ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        vmSize: p.properties?.vmSize,
        count: p.properties?.count,
        osType: p.properties?.osType,
        mode: p.properties?.mode,
        autoScaling: p.properties?.enableAutoScaling,
      }));
      return { count: pools.length, agentPools: pools };
    } catch (error) {
      return { error: 'Failed to list agent pools', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
