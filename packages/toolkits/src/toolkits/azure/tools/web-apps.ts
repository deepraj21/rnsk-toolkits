// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');
const WEB_API = '2023-01-01';

export const azureListWebApps = tool({
  description: 'List App Service web apps in a subscription or resource group. Returns hostname, state, runtime stack and app plan.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Web/sites`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Web/sites`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: WEB_API })) as {
        value?: Array<{ id?: string; name?: string; location?: string; properties?: { defaultHostName?: string; state?: string } }>;
      };
      const apps = (data.value ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        location: a.location,
        hostname: a.properties?.defaultHostName,
        state: a.properties?.state,
      }));
      return { count: apps.length, webApps: apps };
    } catch (error) {
      return { error: 'Failed to list web apps', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetWebApp = tool({
  description: 'Get configuration of an App Service web app including app settings, bindings and site config.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the web app'),
    appName: z.string().describe('Web app (site) name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, appName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Web/sites/${encodeURIComponent(appName)}`,
        { apiVersion: WEB_API },
      );
    } catch (error) {
      return { error: 'Failed to get web app', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureRestartWebApp = tool({
  description: 'Restart an App Service web app. Use after deployments or config changes, or to recover a stuck app.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the web app'),
    appName: z.string().describe('Web app (site) name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, appName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Web/sites/${encodeURIComponent(appName)}/restart`,
        { method: 'POST', apiVersion: WEB_API },
      );
    } catch (error) {
      return { error: 'Failed to restart web app', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListAppServicePlans = tool({
  description: 'List App Service plans in a subscription or resource group. Returns SKU, worker count, OS kind and hosting status.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Web/serverfarms`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Web/serverfarms`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: WEB_API })) as {
        value?: Array<{ id?: string; name?: string; location?: string; kind?: string; sku?: { name?: string; tier?: string; capacity?: number } }>;
      };
      const plans = (data.value ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location,
        kind: p.kind,
        sku: p.sku?.name,
        tier: p.sku?.tier,
        capacity: p.sku?.capacity,
      }));
      return { count: plans.length, appServicePlans: plans };
    } catch (error) {
      return { error: 'Failed to list App Service plans', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListFunctionApps = tool({
  description: 'List Function Apps in a subscription or resource group. Returns hostname, state and runtime info for serverless workloads.',
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
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Web/sites`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Web/sites`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: WEB_API })) as {
        value?: Array<{ id?: string; name?: string; kind?: string; location?: string; properties?: { defaultHostName?: string; state?: string } }>;
      };
      const apps = (data.value ?? [])
        .filter((a) => (a.kind ?? '').toLowerCase().includes('functionapp'))
        .map((a) => ({ id: a.id, name: a.name, location: a.location, hostname: a.properties?.defaultHostName, state: a.properties?.state }));
      return { count: apps.length, functionApps: apps };
    } catch (error) {
      return { error: 'Failed to list Function Apps', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetWebAppSettings = tool({
  description: 'List app settings (environment variables) of a web app. Handle as sensitive — values may include secrets and connection strings.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the web app'),
    appName: z.string().describe('Web app (site) name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, appName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(
        azureCredentials,
        `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Web/sites/${encodeURIComponent(appName)}/config/appsettings/list`,
        { method: 'POST', apiVersion: WEB_API },
      );
    } catch (error) {
      return { error: 'Failed to get web app settings', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
