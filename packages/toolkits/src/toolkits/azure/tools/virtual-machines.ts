// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { armRequest, missingCredentialsError, resolveSubscriptionId } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const subField = z.string().optional().describe('Subscription ID (defaults to the one stored in Azure credentials)');
const rgField = z.string().optional().describe('Resource group name (omit to list across the subscription)');
const COMPUTE_API = '2024-11-01';

function vmPath(sub: string, rg: string | undefined, vmName?: string): string {
  const base = rg
    ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(rg)}/providers/Microsoft.Compute/virtualMachines`
    : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Compute/virtualMachines`;
  return vmName ? `${base}/${encodeURIComponent(vmName)}` : base;
}

export const azureListVirtualMachines = tool({
  description: 'List virtual machines in a subscription or resource group. Returns name, size, OS, provisioning and power state.',
  inputSchema: z.object({ azureCredentials: authField, subscriptionId: subField, resourceGroupName: rgField }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const data = (await armRequest(azureCredentials, vmPath(sub, resourceGroupName), {
        apiVersion: COMPUTE_API,
        extraQuery: { $expand: 'instanceView' },
      })) as { value?: Record<string, unknown>[] };
      return { count: (data.value ?? []).length, virtualMachines: data.value ?? [] };
    } catch (error) {
      return { error: 'Failed to list virtual machines', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureGetVirtualMachine = tool({
  description: 'Get details of a virtual machine, optionally including instanceView for live power and provisioning status.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the VM'),
    vmName: z.string().describe('Virtual machine name'),
    includeInstanceView: z.boolean().optional().describe('Set true to include runtime status (default: true)'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, vmName, includeInstanceView }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(azureCredentials, vmPath(sub, resourceGroupName, vmName), {
        apiVersion: COMPUTE_API,
        extraQuery: { $expand: (includeInstanceView ?? true) ? 'instanceView' : undefined },
      });
    } catch (error) {
      return { error: 'Failed to get virtual machine', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureStartVirtualMachine = tool({
  description: 'Start a stopped Azure virtual machine. Use to bring a dev/test or production VM back online.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the VM'),
    vmName: z.string().describe('Virtual machine name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, vmName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(azureCredentials, `${vmPath(sub, resourceGroupName, vmName)}/start`, {
        method: 'POST',
        apiVersion: COMPUTE_API,
      });
    } catch (error) {
      return { error: 'Failed to start virtual machine', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureDeallocateVirtualMachine = tool({
  description: 'Stop and deallocate an Azure virtual machine to stop compute billing. Use to save cost on idle VMs.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the VM'),
    vmName: z.string().describe('Virtual machine name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, vmName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(azureCredentials, `${vmPath(sub, resourceGroupName, vmName)}/deallocate`, {
        method: 'POST',
        apiVersion: COMPUTE_API,
      });
    } catch (error) {
      return { error: 'Failed to deallocate virtual machine', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureRestartVirtualMachine = tool({
  description: 'Restart an Azure virtual machine. Use after config changes or to recover an unresponsive VM.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the VM'),
    vmName: z.string().describe('Virtual machine name'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, vmName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(azureCredentials, `${vmPath(sub, resourceGroupName, vmName)}/restart`, {
        method: 'POST',
        apiVersion: COMPUTE_API,
      });
    } catch (error) {
      return { error: 'Failed to restart virtual machine', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureListVmScaleSets = tool({
  description: 'List virtual machine scale sets in a subscription or resource group. Returns SKU, capacity, upgrade policy and orchestration mode.',
  inputSchema: z.object({ azureCredentials: authField, subscriptionId: subField, resourceGroupName: rgField }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      const path = resourceGroupName
        ? `/subscriptions/${encodeURIComponent(sub)}/resourceGroups/${encodeURIComponent(resourceGroupName)}/providers/Microsoft.Compute/virtualMachineScaleSets`
        : `/subscriptions/${encodeURIComponent(sub)}/providers/Microsoft.Compute/virtualMachineScaleSets`;
      const data = (await armRequest(azureCredentials, path, { apiVersion: COMPUTE_API })) as {
        value?: Array<{ id?: string; name?: string; location?: string; sku?: { name?: string; capacity?: number } }>;
      };
      const scaleSets = (data.value ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        sku: s.sku?.name,
        capacity: s.sku?.capacity,
      }));
      return { count: scaleSets.length, scaleSets };
    } catch (error) {
      return { error: 'Failed to list VM scale sets', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const azureRunVmCommand = tool({
  description: 'Run a shell or PowerShell script on a VM via the VM agent (RunShellScript for Linux, RunPowerShellScript for Windows). The call is async — a 202 means accepted for processing.',
  inputSchema: z.object({
    azureCredentials: authField,
    subscriptionId: subField,
    resourceGroupName: z.string().describe('Resource group containing the VM'),
    vmName: z.string().describe('Virtual machine name'),
    commandId: z.enum(['RunShellScript', 'RunPowerShellScript']).describe('Built-in command: RunShellScript (Linux) or RunPowerShellScript (Windows)'),
    script: z.array(z.string()).describe('Script lines to execute, e.g. ["apt-get update", "apt-get install -y nginx"]'),
  }),
  execute: async ({ azureCredentials, subscriptionId, resourceGroupName, vmName, commandId, script }) => {
    if (!azureCredentials) return missingCredentialsError();
    try {
      const sub = resolveSubscriptionId(azureCredentials, subscriptionId);
      return await armRequest(azureCredentials, `${vmPath(sub, resourceGroupName, vmName)}/runCommand`, {
        method: 'POST',
        apiVersion: COMPUTE_API,
        body: { commandId, script },
      });
    } catch (error) {
      return { error: 'Failed to run VM command', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
