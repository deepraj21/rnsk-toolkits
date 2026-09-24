// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, getArmToken, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');

export const azureQueryMonitorMetrics = tool({
  description: 'Query Azure Monitor metrics for any resource (VM CPU, storage latency, app requests). Use to check health and performance.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceId: z.string().describe('Full ARM resource ID, e.g. /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/<vm>'),
    metricNames: z.string().describe('Comma-separated metric names, e.g. "Percentage CPU" for VMs, "UsedCapacity" for storage'),
    timespan: z.string().optional().describe('ISO8601 interval, e.g. "PT1H" for the last hour (default: PT1H)'),
    interval: z.string().optional().describe('Aggregation interval, e.g. "PT5M", "PT1H"'),
    aggregation: z.string().optional().describe('Aggregation type: Average, Maximum, Minimum, Total, Count (default: Average)'),
  }),
  execute: async ({ azureCredentials, resourceId, metricNames, timespan, interval, aggregation }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const token = await getArmToken(azureCredentials);
      const params = new URLSearchParams({
        'api-version': '2021-05-01',
        metricnames: metricNames,
        timespan: timespan ?? 'PT1H',
      });
      if (interval) params.set('interval', interval);
      params.set('aggregation', aggregation ?? 'Average');
      const response = await fetch(`https://management.azure.com${resourceId}/providers/Microsoft.Insights/metrics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        return { error: 'Failed to query metrics', details };
      }
      return await response.json();
    } catch (error) {
      return { error: 'Failed to query metrics', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListActivityLogs = tool({
  description: 'List Azure Activity Log events for a subscription. Use to audit who created, updated or deleted resources and when.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    filter: z.string().optional().describe("OData filter, e.g. \"eventTimestamp ge '2026-09-01T00:00:00Z' and resourceGroupName eq 'my-rg'\""),
    top: z.number().int().min(1).max(1000).optional().describe('Max events to return (default 50)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, filter, top }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const params: Record<string, string | undefined> = {
        $filter: filter,
        $top: top ? String(top) : '50',
      };
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Insights/eventtypes/management/values`,
        { apiVersion: '2017-04-01', extraQuery: params },
      );
    } catch (error) {
      return { error: 'Failed to list activity logs', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListMetricAlerts = tool({
  description: 'List Azure Monitor metric alert rules in a subscription or resource group. Returns severity, condition, scopes and actions.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Insights/metricAlerts`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Insights/metricAlerts`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: '2018-03-01' })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { severity?: number; enabled?: boolean; description?: string } }>;
      };
      const alerts = (data.value ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        severity: a.properties?.severity,
        enabled: a.properties?.enabled,
        description: a.properties?.description,
      }));
      return { count: alerts.length, metricAlerts: alerts };
    } catch (error) {
      return { error: 'Failed to list metric alerts', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListLogAnalyticsWorkspaces = tool({
  description: 'List Log Analytics workspaces. Returns retention, SKU, provisioning state and customer ID for log queries.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.OperationalInsights/workspaces`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.OperationalInsights/workspaces`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: '2022-10-01' })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { retentionInDays?: number; sku?: { name?: string }; provisioningState?: string } }>;
      };
      const workspaces = (data.value ?? []).map((w) => ({
        id: w.id,
        name: w.name,
        location: w.location,
        retentionInDays: w.properties?.retentionInDays,
        sku: w.properties?.sku?.name,
        provisioningState: w.properties?.provisioningState,
      }));
      return { count: workspaces.length, workspaces };
    } catch (error) {
      return { error: 'Failed to list Log Analytics workspaces', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListMonitorMetricDefinitions = tool({
  description: 'List available metric definitions for a resource. Use to discover valid metricNames before calling azureQueryMonitorMetrics.',
  inputSchema: z.object({
    azureCredentials: authField,
    resourceId: z.string().describe('Full ARM resource ID, e.g. /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Compute/virtualMachines/<vm>'),
  }),
  execute: async ({ azureCredentials, resourceId }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const token = await getArmToken(azureCredentials);
      const response = await fetch(
        `https://management.azure.com${resourceId}/providers/Microsoft.Insights/metricDefinitions?api-version=2018-01-01`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
      );
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        return { error: 'Failed to list metric definitions', details };
      }
      const data = (await response.json()) as { value?: Array<{ name?: { value?: string; localizedValue?: string }; unit?: string; primaryAggregationType?: string }> };
      const definitions = (data.value ?? []).map((d) => ({
        name: d.name?.value,
        displayName: d.name?.localizedValue,
        unit: d.unit,
        primaryAggregation: d.primaryAggregationType,
      }));
      return { count: definitions.length, metricDefinitions: definitions };
    } catch (error) {
      return { error: 'Failed to list metric definitions', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
