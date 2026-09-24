// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

export const kubernetesListConfigMaps = tool({
  description: 'List ConfigMaps. Returns names and data keys only (never values) for config auditing.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'configmaps', namespace))) as {
        items?: Array<{ metadata?: { name?: string; namespace?: string }; data?: Record<string, string> }>;
      };
      const configMaps = (data.items ?? []).map((cm) => ({
        name: cm.metadata?.name,
        namespace: cm.metadata?.namespace,
        keys: Object.keys(cm.data ?? {}),
      }));
      return { count: configMaps.length, configMaps };
    } catch (error) {
      return { error: 'Failed to list ConfigMaps', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetConfigMap = tool({
  description: 'Get a ConfigMap including its data. Use to inspect application configuration mounted into pods.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    configMapName: z.string().describe('ConfigMap name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, configMapName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('', 'v1', 'configmaps', configMapName, ns));
    } catch (error) {
      return { error: 'Failed to get ConfigMap', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesCreateConfigMap = tool({
  description: 'Create a ConfigMap from key/value pairs. Use to add non-sensitive configuration for pods to consume.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    configMapName: z.string().describe('ConfigMap name'),
    data: z.record(z.string()).describe('Config data as key/value pairs'),
  }),
  execute: async ({ kubernetesCredentials, namespace, configMapName, data }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'configmaps', ns), {
        method: 'POST',
        body: { apiVersion: 'v1', kind: 'ConfigMap', metadata: { name: configMapName, namespace: ns }, data },
      });
    } catch (error) {
      return { error: 'Failed to create ConfigMap', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListSecrets = tool({
  description: 'List secrets returning metadata and data keys only — values are never exposed. Use to audit secret presence and types.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'secrets', namespace))) as {
        items?: Array<{ metadata?: { name?: string; namespace?: string }; type?: string; data?: Record<string, string> }>;
      };
      const secrets = (data.items ?? []).map((s) => ({
        name: s.metadata?.name,
        namespace: s.metadata?.namespace,
        type: s.type,
        keys: Object.keys(s.data ?? {}),
      }));
      return { count: secrets.length, secrets };
    } catch (error) {
      return { error: 'Failed to list secrets', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
