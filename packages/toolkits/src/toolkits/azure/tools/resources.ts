// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');

export const azureListResources = tool({
  description: 'List ARM resources in a subscription or resource group, optionally filtered by resource type. Use for inventory across VMs, storage, web apps and more.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit to this resource group (default: whole subscription)'),
    resourceType: z.string().optional().describe('OData filter helper, e.g. "Microsoft.Compute/virtualMachines"'),
    top: z.number().int().min(1).max(1000).optional().describe('Max resources to return'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, resourceType, top }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const path = resourceGroupName
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/resources`
        : `/subscriptions/${encodeURIComponent(sub)}/resources`;
      const data = (await armRequest(azureCredentials, path, {
        apiVersion: '2021-04-01',
        extraQuery: {
          $filter: resourceType ? `resourceType eq '${resourceType}'` : undefined,
          $top: top ? String(top) : undefined,
        },
      })) as { value?: Array<{ id?: string; name?: string; type?: string; location?: string }> };
      const resources = (data.value ?? []).map((r) => ({ id: r.id, name: r.name, type: r.type, location: r.location }));
      return { count: resources.length, resources };
    } catch (error) {
      return { error: 'Failed to list resources', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
