// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');
const STORAGE_API = '2023-01-01';

export const azureListStorageAccounts = tool({
  description: 'List storage accounts in a subscription or resource group. Returns name, SKU, kind, location and access tier.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Storage/storageAccounts`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Storage/storageAccounts`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: STORAGE_API })) as {
        value?: Array<{ id?: string; name?: string; location?: string; kind?: string; sku?: { name?: string } }>;
      };
      const accounts = (data.value ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        location: a.location,
        kind: a.kind,
        sku: a.sku?.name,
      }));
      return { count: accounts.length, storageAccounts: accounts };
    } catch (error) {
      return { error: 'Failed to list storage accounts', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetStorageAccount = tool({
  description: 'Get properties of a storage account including endpoints, encryption, network rules and status.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the storage account'),
    accountName: z.string().describe('Storage account name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, accountName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Storage/storageAccounts/${encodeURIComponent(accountName)}`,
        { apiVersion: STORAGE_API },
      );
    } catch (error) {
      return { error: 'Failed to get storage account', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListStorageAccountKeys = tool({
  description: 'List access keys for a storage account. Handle as sensitive — use for connection strings and rotation checks.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the storage account'),
    accountName: z.string().describe('Storage account name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, accountName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Storage/storageAccounts/${encodeURIComponent(accountName)}/listKeys`,
        { method: 'POST', apiVersion: STORAGE_API },
      );
    } catch (error) {
      return { error: 'Failed to list storage account keys', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListBlobContainers = tool({
  description: 'List blob containers in a storage account. Returns name, public access level and last-modified time.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the storage account'),
    accountName: z.string().describe('Storage account name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, accountName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Storage/storageAccounts/${encodeURIComponent(accountName)}/blobServices/default/containers`,
        { apiVersion: STORAGE_API },
      )) as { value?: Array<{ id?: string; name?: string; properties?: { publicAccess?: string; lastModifiedTime?: string } }> };
      const containers = (data.value ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        publicAccess: c.properties?.publicAccess,
        lastModifiedTime: c.properties?.lastModifiedTime,
      }));
      return { count: containers.length, containers };
    } catch (error) {
      return { error: 'Failed to list blob containers', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListFileShares = tool({
  description: 'List file shares in a storage account. Returns name, quota, provisioned size and access tier.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the storage account'),
    accountName: z.string().describe('Storage account name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, accountName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Storage/storageAccounts/${encodeURIComponent(accountName)}/fileServices/default/shares`,
        { apiVersion: STORAGE_API },
      )) as { value?: Array<{ id?: string; name?: string; properties?: { shareQuota?: number; accessTier?: string } }> };
      const shares = (data.value ?? []).map((s) => ({ id: s.id, name: s.name, quotaGB: s.properties?.shareQuota, accessTier: s.properties?.accessTier }));
      return { count: shares.length, shares };
    } catch (error) {
      return { error: 'Failed to list file shares', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureRegenerateStorageAccountKey = tool({
  description: 'Regenerate (rotate) a storage account access key. Pass keyName key1 or key2 — rotate the standby key first to avoid downtime.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the storage account'),
    accountName: z.string().describe('Storage account name'),
    keyName: z.enum(['key1', 'key2']).describe('Which key to regenerate'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, accountName, keyName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Storage/storageAccounts/${encodeURIComponent(accountName)}/regenerateKey`,
        { method: 'POST', apiVersion: STORAGE_API, body: { keyName } },
      );
    } catch (error) {
      return { error: 'Failed to regenerate storage account key', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
