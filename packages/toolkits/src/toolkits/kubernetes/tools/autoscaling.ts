// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

export const kubernetesListHorizontalPodAutoscalers = tool({
  description: 'List HorizontalPodAutoscalers with current vs desired replicas, targets and scaling status.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(
        kubernetesCredentials,
        collectionPath('autoscaling', 'v2', 'horizontalpodautoscalers', namespace),
      )) as {
        items?: Array<{
          metadata?: { name?: string; namespace?: string };
          spec?: { minReplicas?: number; maxReplicas?: number };
          status?: { currentReplicas?: number; desiredReplicas?: number };
        }>;
      };
      const autoscalers = (data.items ?? []).map((h) => ({
        name: h.metadata?.name,
        namespace: h.metadata?.namespace,
        minReplicas: h.spec?.minReplicas,
        maxReplicas: h.spec?.maxReplicas,
        currentReplicas: h.status?.currentReplicas,
        desiredReplicas: h.status?.desiredReplicas,
      }));
      return { count: autoscalers.length, horizontalPodAutoscalers: autoscalers };
    } catch (error) {
      return { error: 'Failed to list HorizontalPodAutoscalers', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetHorizontalPodAutoscaler = tool({
  description: 'Get an HPA including scale target, metrics (CPU/memory/custom) and recent scaling conditions.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    autoscalerName: z.string().describe('HorizontalPodAutoscaler name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, autoscalerName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(
        kubernetesCredentials,
        itemPath('autoscaling', 'v2', 'horizontalpodautoscalers', autoscalerName, ns),
      );
    } catch (error) {
      return { error: 'Failed to get HorizontalPodAutoscaler', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
