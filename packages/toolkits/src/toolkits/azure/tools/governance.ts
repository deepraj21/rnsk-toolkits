// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');

export const azureListRoleAssignments = tool({
  description: 'List RBAC role assignments in a subscription or resource group. Use to audit who has access to what.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Authorization/roleAssignments`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Authorization/roleAssignments`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: '2022-04-01' })) as {
        value?: Array<{ id?: string; name?: string; properties?: { roleDefinitionId?: string; principalId?: string; scope?: string } }>;
      };
      const assignments = (data.value ?? []).map((a) => ({
        id: a.id,
        roleDefinitionId: a.properties?.roleDefinitionId,
        principalId: a.properties?.principalId,
        scope: a.properties?.scope,
      }));
      return { count: assignments.length, roleAssignments: assignments };
    } catch (error) {
      return { error: 'Failed to list role assignments', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureQueryCostManagement = tool({
  description: 'Query Azure Cost Management for actual cost grouped by service, resource group or location. Use to answer spend and billing questions.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().optional().describe('Limit cost query to this resource group (default: whole subscription)'),
    timeframe: z.enum(['MonthToDate', 'LastMonth', 'Last30Days', 'YearToDate']).optional().describe('Time range (default: MonthToDate)'),
    groupBy: z.enum(['ServiceName', 'ResourceGroup', 'ResourceLocation', 'ResourceType', 'None']).optional().describe('Dimension to group cost by (default: ServiceName)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, timeframe, groupBy }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const scope = resourceGroupName
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}`
        : `/subscriptions/${encodeURIComponent(sub)}`;
      const grouping = groupBy && groupBy !== 'None' ? [{ type: 'Dimension', name: groupBy }] : [];
      return await armRequest(azureCredentials, `${scope}/providers/Microsoft.CostManagement/query`, {
        method: 'POST',
        apiVersion: '2023-11-01',
        body: {
          type: 'ActualCost',
          timeframe: timeframe ?? 'MonthToDate',
          dataset: {
            granularity: 'None',
            aggregation: { totalCost: { name: 'Cost', function: 'Sum' } },
            grouping,
          },
        },
      });
    } catch (error) {
      return { error: 'Failed to query cost management', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListAdvisorRecommendations = tool({
  description: 'List Azure Advisor recommendations for cost, security, reliability and performance. Use to find savings and best-practice fixes.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    category: z.enum(['Cost', 'Security', 'HighAvailability', 'Performance', 'OperationalExcellence']).optional().describe('Filter to this category'),
    top: z.number().int().min(1).max(1000).optional().describe('Max recommendations to return'),
  }),
  execute: async ({ azureCredentials, subscriptionId, category, top }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Advisor/recommendations`, {
        apiVersion: '2025-01-01',
        extraQuery: { $filter: category ? `Category eq '${category}'` : undefined, $top: top ? String(top) : undefined },
      })) as {
        value?: Array<{ id?: string; properties?: { category?: string; impact?: string; shortDescription?: { problem?: string; solution?: string } } }>;
      };
      const recommendations = (data.value ?? []).map((r) => ({
        id: r.id,
        category: r.properties?.category,
        impact: r.properties?.impact,
        problem: r.properties?.shortDescription?.problem,
        solution: r.properties?.shortDescription?.solution,
      }));
      return { count: recommendations.length, recommendations };
    } catch (error) {
      return { error: 'Failed to list Advisor recommendations', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
