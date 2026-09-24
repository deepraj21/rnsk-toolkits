// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, k8sRequest, missingCredentialsError } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

export const kubernetesGetClusterVersion = tool({
  description: 'Get the Kubernetes server version, git commit and platform. Use to check upgrade status and API compatibility.',
  inputSchema: z.object({ kubernetesCredentials: authField }),
  execute: async ({ kubernetesCredentials }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      return await k8sRequest(kubernetesCredentials, '/version');
    } catch (error) {
      return { error: 'Failed to get cluster version', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListApiGroups = tool({
  description: 'Discover available API groups and versions (apps/v1, batch/v1, networking.k8s.io/v1...). Use to check feature support before other calls.',
  inputSchema: z.object({ kubernetesCredentials: authField }),
  execute: async ({ kubernetesCredentials }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const [core, groups] = await Promise.all([
        k8sRequest(kubernetesCredentials, '/api'),
        k8sRequest(kubernetesCredentials, '/apis'),
      ]);
      const coreVersions = (core as { versions?: string[] }).versions ?? [];
      const apiGroups = ((groups as { groups?: Array<{ name?: string; versions?: Array<{ version?: string }> }> }).groups ?? []).map(
        (g) => ({ name: g.name, versions: (g.versions ?? []).map((v) => v.version) }),
      );
      return { coreVersions, apiGroups };
    } catch (error) {
      return { error: 'Failed to list API groups', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListEvents = tool({
  description: 'List cluster events (warnings, scheduling failures, image pulls). Use first when debugging unhealthy resources.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (omit for all namespaces)'),
    fieldSelector: z.string().optional().describe('Filter, e.g. "type=Warning" or "involvedObject.name=my-pod"'),
    limit: z.number().int().min(1).max(1000).optional().describe('Max events to return (default 100)'),
  }),
  execute: async ({ kubernetesCredentials, namespace, fieldSelector, limit }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'events', namespace), {
        query: { fieldSelector, limit: limit ?? 100 },
      })) as {
        items?: Array<{
          metadata?: { name?: string; namespace?: string; creationTimestamp?: string };
          type?: string;
          reason?: string;
          message?: string;
          involvedObject?: { kind?: string; name?: string };
          count?: number;
          lastTimestamp?: string;
        }>;
      };
      const events = (data.items ?? []).map((e) => ({
        name: e.metadata?.name,
        namespace: e.metadata?.namespace,
        type: e.type,
        reason: e.reason,
        message: e.message,
        involvedObject: e.involvedObject ? `${e.involvedObject.kind}/${e.involvedObject.name}` : undefined,
        count: e.count,
        lastSeen: e.lastTimestamp ?? e.metadata?.creationTimestamp,
      }));
      return { count: events.length, events };
    } catch (error) {
      return { error: 'Failed to list events', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
