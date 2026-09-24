// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { k8sRequest, missingCredentialsError } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

interface NodeItem {
  metadata?: { name?: string; labels?: Record<string, string> };
  spec?: { unschedulable?: boolean };
  status?: {
    conditions?: Array<{ type?: string; status?: string }>;
    capacity?: Record<string, string>;
    allocatable?: Record<string, string>;
    nodeInfo?: { kubeletVersion?: string; osImage?: string; architecture?: string };
  };
}

function summarizeNode(node: NodeItem) {
  const conditions = Object.fromEntries((node.status?.conditions ?? []).map((c) => [c.type, c.status]));
  return {
    name: node.metadata?.name,
    unschedulable: node.spec?.unschedulable ?? false,
    conditions,
    capacity: { cpu: node.status?.capacity?.cpu, memory: node.status?.capacity?.memory, pods: node.status?.capacity?.pods },
    allocatable: { cpu: node.status?.allocatable?.cpu, memory: node.status?.allocatable?.memory, pods: node.status?.allocatable?.pods },
    kubelet: node.status?.nodeInfo?.kubeletVersion,
    osImage: node.status?.nodeInfo?.osImage,
  };
}

export const kubernetesListNodes = tool({
  description: 'List cluster nodes with Ready status, capacity, allocatable resources and versions. Use for capacity and upgrade planning.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    labelSelector: z.string().optional().describe('Label filter, e.g. "node-role.kubernetes.io/worker="'),
  }),
  execute: async ({ kubernetesCredentials, labelSelector }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, '/api/v1/nodes', {
        query: { labelSelector },
      })) as { items?: NodeItem[] };
      const nodes = (data.items ?? []).map(summarizeNode);
      return { count: nodes.length, nodes };
    } catch (error) {
      return { error: 'Failed to list nodes', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetNode = tool({
  description: 'Get full node details including addresses, taints, images, volumes and system info.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    nodeName: z.string().describe('Node name'),
  }),
  execute: async ({ kubernetesCredentials, nodeName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, `/api/v1/nodes/${encodeURIComponent(nodeName)}`);
    } catch (error) {
      return { error: 'Failed to get node', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesCordonNode = tool({
  description: 'Mark a node unschedulable (kubectl cordon equivalent). Use before draining or maintaining a node.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    nodeName: z.string().describe('Node name to cordon'),
  }),
  execute: async ({ kubernetesCredentials, nodeName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, `/api/v1/nodes/${encodeURIComponent(nodeName)}`, {
        method: 'PATCH',
        body: { spec: { unschedulable: true } },
      });
    } catch (error) {
      return { error: 'Failed to cordon node', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesUncordonNode = tool({
  description: 'Mark a node schedulable again (kubectl uncordon equivalent). Use after maintenance completes.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    nodeName: z.string().describe('Node name to uncordon'),
  }),
  execute: async ({ kubernetesCredentials, nodeName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, `/api/v1/nodes/${encodeURIComponent(nodeName)}`, {
        method: 'PATCH',
        body: { spec: { unschedulable: false } },
      });
    } catch (error) {
      return { error: 'Failed to uncordon node', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
