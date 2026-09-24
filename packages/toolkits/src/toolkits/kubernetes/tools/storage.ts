// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

export const kubernetesListPersistentVolumeClaims = tool({
  description: 'List PersistentVolumeClaims with bound volumes, storage class, capacity and phase. Use to debug Pending pods waiting on storage.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(
        kubernetesCredentials,
        collectionPath('', 'v1', 'persistentvolumeclaims', namespace),
      )) as {
        items?: Array<{
          metadata?: { name?: string; namespace?: string };
          spec?: { storageClassName?: string; volumeName?: string };
          status?: { phase?: string; capacity?: Record<string, string> };
        }>;
      };
      const claims = (data.items ?? []).map((c) => ({
        name: c.metadata?.name,
        namespace: c.metadata?.namespace,
        phase: c.status?.phase,
        volume: c.spec?.volumeName,
        storageClass: c.spec?.storageClassName,
        capacity: c.status?.capacity?.storage,
      }));
      return { count: claims.length, persistentVolumeClaims: claims };
    } catch (error) {
      return { error: 'Failed to list PersistentVolumeClaims', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetPersistentVolumeClaim = tool({
  description: 'Get a PersistentVolumeClaim including access modes, resources, selectors and bound volume details.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    claimName: z.string().describe('PersistentVolumeClaim name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, claimName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('', 'v1', 'persistentvolumeclaims', claimName, ns));
    } catch (error) {
      return { error: 'Failed to get PersistentVolumeClaim', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListPersistentVolumes = tool({
  description: 'List cluster PersistentVolumes with capacity, reclaim policy, storage class and claim binding. Use for storage capacity planning.',
  inputSchema: z.object({ kubernetesCredentials: authField }),
  execute: async ({ kubernetesCredentials }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, '/api/v1/persistentvolumes')) as {
        items?: Array<{
          metadata?: { name?: string };
          spec?: { storageClassName?: string; persistentVolumeReclaimPolicy?: string; claimRef?: { name?: string; namespace?: string } };
          status?: { phase?: string };
        }>;
      };
      const volumes = (data.items ?? []).map((v) => ({
        name: v.metadata?.name,
        phase: v.status?.phase,
        storageClass: v.spec?.storageClassName,
        reclaimPolicy: v.spec?.persistentVolumeReclaimPolicy,
        claim: v.spec?.claimRef ? `${v.spec.claimRef.namespace}/${v.spec.claimRef.name}` : undefined,
      }));
      return { count: volumes.length, persistentVolumes: volumes };
    } catch (error) {
      return { error: 'Failed to list PersistentVolumes', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
