// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { k8sRequest, missingCredentialsError } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

export const kubernetesListNamespaces = tool({
  description: 'List Kubernetes namespaces. Use to discover where workloads are deployed before other calls.',
  inputSchema: z.object({ kubernetesCredentials: authField }),
  execute: async ({ kubernetesCredentials }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, '/api/v1/namespaces')) as {
        items?: Array<{ metadata?: { name?: string }; status?: { phase?: string } }>;
      };
      const namespaces = (data.items ?? []).map((ns) => ({ name: ns.metadata?.name, phase: ns.status?.phase }));
      return { count: namespaces.length, namespaces };
    } catch (error) {
      return { error: 'Failed to list namespaces', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetNamespace = tool({
  description: 'Get details of a namespace including labels, annotations and phase.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().describe('Namespace name'),
  }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, `/api/v1/namespaces/${encodeURIComponent(namespace)}`);
    } catch (error) {
      return { error: 'Failed to get namespace', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesCreateNamespace = tool({
  description: 'Create a new namespace, optionally with labels. Use to isolate a new application or environment.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().describe('Name for the new namespace'),
    labels: z.record(z.string()).optional().describe('Optional labels as key/value pairs'),
  }),
  execute: async ({ kubernetesCredentials, namespace, labels }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, '/api/v1/namespaces', {
        method: 'POST',
        body: { apiVersion: 'v1', kind: 'Namespace', metadata: { name: namespace, labels } },
      });
    } catch (error) {
      return { error: 'Failed to create namespace', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesDeleteNamespace = tool({
  description: 'Delete a namespace and everything in it. Irreversible — confirm with the user first.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().describe('Namespace name to delete'),
  }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, `/api/v1/namespaces/${encodeURIComponent(namespace)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return { error: 'Failed to delete namespace', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
