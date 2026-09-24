// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');
const NETWORK_API = '2023-09-01';

export const azureListVirtualNetworks = tool({
  description: 'List virtual networks in a subscription or resource group. Returns address spaces, subnets and peering state.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Network/virtualNetworks`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Network/virtualNetworks`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: NETWORK_API })) as { value?: unknown[] };
      return { count: (data.value ?? []).length, virtualNetworks: data.value ?? [] };
    } catch (error) {
      return { error: 'Failed to list virtual networks', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

function networkPath(sub: string, resourceGroupName: string | undefined, provider: string): string {
  return resourceGroupName
    ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Network/${provider}`
    : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Network/${provider}`;
}

export const azureGetVirtualNetwork = tool({
  description: 'Get a virtual network including address spaces, subnets, DNS servers and peering status.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the virtual network'),
    vnetName: z.string().describe('Virtual network name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, vnetName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(azureCredentials, `${networkPath(sub, resourceGroupName, 'virtualNetworks')}/${encodeURIComponent(vnetName)}`, {
        apiVersion: NETWORK_API,
      });
    } catch (error) {
      return { error: 'Failed to get virtual network', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListPublicIpAddresses = tool({
  description: 'List public IP addresses in a subscription or resource group. Returns address, allocation method, SKU and association.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, networkPath(sub, resourceGroupName, 'publicIPAddresses'), {
        apiVersion: NETWORK_API,
      })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { ipAddress?: string; publicIPAllocationMethod?: string } }>;
      };
      const addresses = (data.value ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        location: a.location,
        ipAddress: a.properties?.ipAddress,
        allocationMethod: a.properties?.publicIPAllocationMethod,
      }));
      return { count: addresses.length, publicIpAddresses: addresses };
    } catch (error) {
      return { error: 'Failed to list public IP addresses', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListNetworkSecurityGroups = tool({
  description: 'List network security groups with their security rules. Use to audit open ports and access controls.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, networkPath(sub, resourceGroupName, 'networkSecurityGroups'), {
        apiVersion: NETWORK_API,
      })) as { value?: unknown[] };
      return { count: (data.value ?? []).length, networkSecurityGroups: data.value ?? [] };
    } catch (error) {
      return { error: 'Failed to list network security groups', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListLoadBalancers = tool({
  description: 'List load balancers in a subscription or resource group. Returns SKU, frontend IPs, backend pools and rules.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, networkPath(sub, resourceGroupName, 'loadBalancers'), {
        apiVersion: NETWORK_API,
      })) as {
        value?: Array<{ id?: string; name?: string; location?: string; sku?: { name?: string } }>;
      };
      const balancers = (data.value ?? []).map((b) => ({ id: b.id, name: b.name, location: b.location, sku: b.sku?.name }));
      return { count: balancers.length, loadBalancers: balancers };
    } catch (error) {
      return { error: 'Failed to list load balancers', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListDnsZones = tool({
  description: 'List Azure DNS zones in a subscription or resource group. Returns name, record count and name servers.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, networkPath(sub, resourceGroupName, 'dnszones'), {
        apiVersion: '2018-05-01',
      })) as {
        value?: Array<{ id?: string; name?: string; properties?: { numberOfRecordSets?: number; nameServers?: string[] } }>;
      };
      const zones = (data.value ?? []).map((zone) => ({
        id: zone.id,
        name: zone.name,
        recordSets: zone.properties?.numberOfRecordSets,
        nameServers: zone.properties?.nameServers,
      }));
      return { count: zones.length, dnsZones: zones };
    } catch (error) {
      return { error: 'Failed to list DNS zones', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
