// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');
const DISK_API = '2024-03-02';

export const azureListManagedDisks = tool({
  description: 'List managed disks in a subscription or resource group. Returns size, SKU, OS type, attachment state and encryption.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Compute/disks`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Compute/disks`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: DISK_API })) as {
        value?: Array<{ id?: string; name?: string; location?: string; sku?: { name?: string }; properties?: { diskSizeGB?: number; osType?: string; diskState?: string } }>;
      };
      const disks = (data.value ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        location: d.location,
        sku: d.sku?.name,
        sizeGB: d.properties?.diskSizeGB,
        osType: d.properties?.osType,
        state: d.properties?.diskState,
      }));
      return { count: disks.length, disks };
    } catch (error) {
      return { error: 'Failed to list managed disks', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetManagedDisk = tool({
  description: 'Get details of a managed disk including size, SKU, encryption, network access and attached VM.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the disk'),
    diskName: z.string().describe('Managed disk name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, diskName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Compute/disks/${encodeURIComponent(diskName)}`,
        { apiVersion: DISK_API },
      );
    } catch (error) {
      return { error: 'Failed to get managed disk', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListSnapshots = tool({
  description: 'List managed disk snapshots in a subscription or resource group. Use to find backup/restore points before disk recovery.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Compute/snapshots`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Compute/snapshots`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: DISK_API })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { diskSizeGB?: number; osType?: string; timeCreated?: string } }>;
      };
      const snapshots = (data.value ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        sizeGB: s.properties?.diskSizeGB,
        osType: s.properties?.osType,
        timeCreated: s.properties?.timeCreated,
      }));
      return { count: snapshots.length, snapshots };
    } catch (error) {
      return { error: 'Failed to list snapshots', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
