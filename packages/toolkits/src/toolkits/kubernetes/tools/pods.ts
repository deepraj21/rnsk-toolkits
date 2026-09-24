// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

interface PodItem {
  metadata?: { name?: string; namespace?: string; creationTimestamp?: string };
  status?: {
    phase?: string;
    podIP?: string;
    containerStatuses?: Array<{ restartCount?: number; ready?: boolean; name?: string }>;
  };
  spec?: { nodeName?: string; containers?: Array<{ name?: string; image?: string }> };
}

function summarizePod(pod: PodItem) {
  const restarts = (pod.status?.containerStatuses ?? []).reduce((n, c) => n + (c.restartCount ?? 0), 0);
  return {
    name: pod.metadata?.name,
    namespace: pod.metadata?.namespace,
    phase: pod.status?.phase,
    podIP: pod.status?.podIP,
    node: pod.spec?.nodeName,
    restarts,
    containers: (pod.spec?.containers ?? []).map((c) => c.name),
    images: [...new Set((pod.spec?.containers ?? []).map((c) => c.image))],
    created: pod.metadata?.creationTimestamp,
  };
}

export const kubernetesListPods = tool({
  description: 'List pods in a namespace or across all namespaces. Returns phase, IP, node, restart counts and images. Use to check workload health.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: nsField,
    labelSelector: z.string().optional().describe('Label filter, e.g. "app=web,tier=frontend"'),
    fieldSelector: z.string().optional().describe('Field filter, e.g. "status.phase=Running"'),
    limit: z.number().int().min(1).max(1000).optional().describe('Max pods to return'),
  }),
  execute: async ({ kubernetesCredentials, namespace, labelSelector, fieldSelector, limit }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'pods', namespace), {
        query: { labelSelector, fieldSelector, limit },
      })) as { items?: PodItem[] };
      const pods = (data.items ?? []).map(summarizePod);
      return { count: pods.length, pods };
    } catch (error) {
      return { error: 'Failed to list pods', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetPod = tool({
  description: 'Get full details of a pod including spec, container statuses, events-ready conditions and IPs.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    podName: z.string().describe('Pod name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, podName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('', 'v1', 'pods', podName, ns));
    } catch (error) {
      return { error: 'Failed to get pod', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetPodLogs = tool({
  description: 'Fetch container logs for a pod. Use to debug crashes, CrashLoopBackOff and application errors.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    podName: z.string().describe('Pod name'),
    container: z.string().optional().describe('Container name (required for multi-container pods)'),
    tailLines: z.number().int().min(1).max(10000).optional().describe('Return only the last N lines (default 200)'),
    previous: z.boolean().optional().describe('Return logs from the previous terminated instance'),
    timestamps: z.boolean().optional().describe('Include RFC3339 timestamps on each line'),
  }),
  execute: async ({ kubernetesCredentials, namespace, podName, container, tailLines, previous, timestamps }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      const logs = (await k8sRequest(kubernetesCredentials, `${itemPath('', 'v1', 'pods', podName, ns)}/log`, {
        query: { container, tailLines: tailLines ?? 200, previous, timestamps },
        responseType: 'text',
      })) as string;
      return { podName, namespace: ns, container, logs };
    } catch (error) {
      return { error: 'Failed to get pod logs', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesDeletePod = tool({
  description: 'Delete a pod to force a restart (the controller recreates it). Use to recover stuck pods or pick up new config.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    podName: z.string().describe('Pod name to delete'),
    gracePeriodSeconds: z.number().int().min(0).optional().describe('Grace period before force-kill (0 = immediate)'),
  }),
  execute: async ({ kubernetesCredentials, namespace, podName, gracePeriodSeconds }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('', 'v1', 'pods', podName, ns), {
        method: 'DELETE',
        body: gracePeriodSeconds !== undefined ? { gracePeriodSeconds } : undefined,
      });
    } catch (error) {
      return { error: 'Failed to delete pod', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
