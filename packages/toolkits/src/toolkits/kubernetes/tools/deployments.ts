// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

interface DeploymentItem {
  metadata?: { name?: string; namespace?: string };
  spec?: { replicas?: number };
  status?: { replicas?: number; availableReplicas?: number; updatedReplicas?: number; unavailableReplicas?: number };
}

function summarizeDeployment(d: DeploymentItem) {
  return {
    name: d.metadata?.name,
    namespace: d.metadata?.namespace,
    desired: d.spec?.replicas,
    replicas: d.status?.replicas,
    available: d.status?.availableReplicas,
    updated: d.status?.updatedReplicas,
    unavailable: d.status?.unavailableReplicas,
  };
}

export const kubernetesListDeployments = tool({
  description: 'List deployments in a namespace or across all namespaces. Returns desired vs available replica counts for rollout health.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: nsField,
    labelSelector: z.string().optional().describe('Label filter, e.g. "app=web"'),
    limit: z.number().int().min(1).max(1000).optional().describe('Max deployments to return'),
  }),
  execute: async ({ kubernetesCredentials, namespace, labelSelector, limit }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('apps', 'v1', 'deployments', namespace), {
        query: { labelSelector, limit },
      })) as { items?: DeploymentItem[] };
      const deployments = (data.items ?? []).map(summarizeDeployment);
      return { count: deployments.length, deployments };
    } catch (error) {
      return { error: 'Failed to list deployments', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetDeployment = tool({
  description: 'Get full details of a deployment including strategy, selector, pod template and rollout status.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    deploymentName: z.string().describe('Deployment name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, deploymentName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('apps', 'v1', 'deployments', deploymentName, ns));
    } catch (error) {
      return { error: 'Failed to get deployment', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesCreateDeployment = tool({
  description: 'Create a deployment from a container image with replicas, port and env vars. Use to deploy a new stateless workload.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    deploymentName: z.string().describe('Deployment name (also used as app label)'),
    image: z.string().describe('Container image, e.g. "nginx:1.25"'),
    replicas: z.number().int().min(1).max(100).optional().describe('Replica count (default 1)'),
    containerPort: z.number().int().min(1).max(65535).optional().describe('Port the container listens on'),
    env: z.record(z.string()).optional().describe('Environment variables as key/value pairs'),
  }),
  execute: async ({ kubernetesCredentials, namespace, deploymentName, image, replicas, containerPort, env }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      const labels = { app: deploymentName };
      return await k8sRequest(kubernetesCredentials, collectionPath('apps', 'v1', 'deployments', ns), {
        method: 'POST',
        body: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: deploymentName, namespace: ns, labels },
          spec: {
            replicas: replicas ?? 1,
            selector: { matchLabels: labels },
            template: {
              metadata: { labels },
              spec: {
                containers: [
                  {
                    name: deploymentName,
                    image,
                    ports: containerPort ? [{ containerPort }] : undefined,
                    env: env ? Object.entries(env).map(([name, value]) => ({ name, value })) : undefined,
                  },
                ],
              },
            },
          },
        },
      });
    } catch (error) {
      return { error: 'Failed to create deployment', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesScaleDeployment = tool({
  description: 'Scale a deployment to a replica count. Use to handle traffic spikes or scale down idle workloads.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    deploymentName: z.string().describe('Deployment name'),
    replicas: z.number().int().min(0).max(1000).describe('Desired replica count'),
  }),
  execute: async ({ kubernetesCredentials, namespace, deploymentName, replicas }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('apps', 'v1', 'deployments', deploymentName, ns), {
        method: 'PATCH',
        body: { spec: { replicas } },
      });
    } catch (error) {
      return { error: 'Failed to scale deployment', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesRestartDeployment = tool({
  description: 'Rolling-restart a deployment (kubectl rollout restart equivalent). Use to pick up new images with the same tag or fresh config.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    deploymentName: z.string().describe('Deployment name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, deploymentName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('apps', 'v1', 'deployments', deploymentName, ns), {
        method: 'PATCH',
        body: {
          spec: {
            template: {
              metadata: { annotations: { 'kubectl.kubernetes.io/restartedAt': new Date().toISOString() } },
            },
          },
        },
      });
    } catch (error) {
      return { error: 'Failed to restart deployment', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesDeleteDeployment = tool({
  description: 'Delete a deployment and its pods. Services, config and PVCs are left untouched — confirm with the user first.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    deploymentName: z.string().describe('Deployment name to delete'),
  }),
  execute: async ({ kubernetesCredentials, namespace, deploymentName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('apps', 'v1', 'deployments', deploymentName, ns), {
        method: 'DELETE',
      });
    } catch (error) {
      return { error: 'Failed to delete deployment', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
