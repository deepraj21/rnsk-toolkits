// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, k8sRequest, missingCredentialsError } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');
const limitField = z.number().int().min(1).max(1000).optional().describe('Max items to return');

interface WorkloadItem {
  metadata?: { name?: string; namespace?: string };
  spec?: { replicas?: number };
  status?: { replicas?: number; readyReplicas?: number };
}

function summarizeWorkload(kind: string, item: WorkloadItem) {
  return {
    kind,
    name: item.metadata?.name,
    namespace: item.metadata?.namespace,
    desired: item.spec?.replicas,
    replicas: item.status?.replicas,
    ready: item.status?.readyReplicas,
  };
}

export const kubernetesListStatefulSets = tool({
  description: 'List StatefulSets for stateful workloads like databases and queues. Returns desired vs ready replicas.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField, limit: limitField }),
  execute: async ({ kubernetesCredentials, namespace, limit }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('apps', 'v1', 'statefulsets', namespace), {
        query: { limit },
      })) as { items?: WorkloadItem[] };
      const statefulSets = (data.items ?? []).map((item) => summarizeWorkload('StatefulSet', item));
      return { count: statefulSets.length, statefulSets };
    } catch (error) {
      return { error: 'Failed to list StatefulSets', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListDaemonSets = tool({
  description: 'List DaemonSets running node-level agents like log collectors and CNI plugins. Returns scheduling status.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField, limit: limitField }),
  execute: async ({ kubernetesCredentials, namespace, limit }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('apps', 'v1', 'daemonsets', namespace), {
        query: { limit },
      })) as { items?: WorkloadItem[] };
      const daemonSets = (data.items ?? []).map((item) => summarizeWorkload('DaemonSet', item));
      return { count: daemonSets.length, daemonSets };
    } catch (error) {
      return { error: 'Failed to list DaemonSets', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListReplicaSets = tool({
  description: 'List ReplicaSets backing deployments. Use to inspect rollout history and old revisions during a stuck rollout.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField, limit: limitField }),
  execute: async ({ kubernetesCredentials, namespace, limit }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('apps', 'v1', 'replicasets', namespace), {
        query: { limit },
      })) as { items?: WorkloadItem[] };
      const replicaSets = (data.items ?? []).map((item) => summarizeWorkload('ReplicaSet', item));
      return { count: replicaSets.length, replicaSets };
    } catch (error) {
      return { error: 'Failed to list ReplicaSets', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
