// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');

export const azureListResourceGroups = tool({
  description: 'List resource groups in an Azure subscription. Use to discover where VMs, storage and apps live.',
  inputSchema: z.object({ azureCredentials: authField, subscriptionId: subField }),
  execute: async ({ azureCredentials, subscriptionId }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, `/subscriptions/${encodeURIComponent(sub)}/resourcegroups`, {
        apiVersion: '2021-04-01',
      })) as { value?: unknown[] };
      return { count: (data.value ?? []).length, resourceGroups: data.value ?? [] };
    } catch (error) {
      return { error: 'Failed to list resource groups', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetResourceGroup = tool({
  description: 'Get details of a single Azure resource group including location, tags and provisioning state.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group name (case-insensitive)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourcegroups/${encodeURIComponent(resourceGroupName)}`,
        { apiVersion: '2021-04-01' },
      );
    } catch (error) {
      return { error: 'Failed to get resource group', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureCreateResourceGroup = tool({
  description: 'Create a new Azure resource group in a subscription and location. Use before deploying new workloads.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Name for the new resource group'),
    location: z.string().describe('Azure region, e.g. "eastus", "westeurope", "centralindia"'),
    tags: z.record(z.string()).optional().describe('Optional tags as key/value pairs'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, location, tags }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourcegroups/${encodeURIComponent(resourceGroupName)}`,
        { method: 'PUT', apiVersion: '2021-04-01', body: { location, tags } },
      );
    } catch (error) {
      return { error: 'Failed to create resource group', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureDeleteResourceGroup = tool({
  description: 'Delete an Azure resource group and all resources it contains. Irreversible — confirm with the user first.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group name to delete'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourcegroups/${encodeURIComponent(resourceGroupName)}`,
        { method: 'DELETE', apiVersion: '2021-04-01' },
      );
    } catch (error) {
      return { error: 'Failed to delete resource group', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
