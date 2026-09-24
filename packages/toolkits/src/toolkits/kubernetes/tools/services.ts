// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

interface ServiceItem {
  metadata?: { name?: string; namespace?: string };
  spec?: { type?: string; clusterIP?: string; ports?: Array<{ port?: number; targetPort?: number | string }> };
}

function summarizeService(svc: ServiceItem) {
  return {
    name: svc.metadata?.name,
    namespace: svc.metadata?.namespace,
    type: svc.spec?.type,
    clusterIP: svc.spec?.clusterIP,
    ports: svc.spec?.ports,
  };
}

export const kubernetesListServices = tool({
  description: 'List services in a namespace or across all namespaces. Returns type, cluster IP and ports for service discovery.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'services', namespace))) as {
        items?: ServiceItem[];
      };
      const services = (data.items ?? []).map(summarizeService);
      return { count: services.length, services };
    } catch (error) {
      return { error: 'Failed to list services', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetService = tool({
  description: 'Get full details of a service including selector, ports, endpoints-ready status and load balancer ingress.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    serviceName: z.string().describe('Service name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, serviceName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('', 'v1', 'services', serviceName, ns));
    } catch (error) {
      return { error: 'Failed to get service', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesCreateService = tool({
  description: 'Create a ClusterIP, NodePort or LoadBalancer service for a set of pods. Use to expose a deployment inside or outside the cluster.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    serviceName: z.string().describe('Service name'),
    selector: z.record(z.string()).describe('Pod selector labels, e.g. {"app": "web"}'),
    ports: z
      .array(z.object({ port: z.number().int().min(1).max(65535).describe('Service port'), targetPort: z.number().int().min(1).max(65535).optional().describe('Container port (defaults to port)') }))
      .min(1)
      .describe('Exposed ports'),
    type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer']).optional().describe('Service type (default ClusterIP)'),
  }),
  execute: async ({ kubernetesCredentials, namespace, serviceName, selector, ports, type }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, collectionPath('', 'v1', 'services', ns), {
        method: 'POST',
        body: {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: serviceName, namespace: ns },
          spec: {
            type: type ?? 'ClusterIP',
            selector,
            ports: ports.map((p) => ({ port: p.port, targetPort: p.targetPort ?? p.port, protocol: 'TCP' })),
          },
        },
      });
    } catch (error) {
      return { error: 'Failed to create service', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesDeleteService = tool({
  description: 'Delete a service. Pods keep running but lose the stable endpoint — confirm with the user first.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    serviceName: z.string().describe('Service name to delete'),
  }),
  execute: async ({ kubernetesCredentials, namespace, serviceName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('', 'v1', 'services', serviceName, ns), {
        method: 'DELETE',
      });
    } catch (error) {
      return { error: 'Failed to delete service', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListIngresses = tool({
  description: 'List ingresses with hosts, paths and backend services. Use to audit external HTTP routing into the cluster.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(
        kubernetesCredentials,
        collectionPath('networking.k8s.io', 'v1', 'ingresses', namespace),
      )) as {
        items?: Array<{
          metadata?: { name?: string; namespace?: string };
          spec?: { ingressClassName?: string; rules?: Array<{ host?: string }> };
        }>;
      };
      const ingresses = (data.items ?? []).map((ing) => ({
        name: ing.metadata?.name,
        namespace: ing.metadata?.namespace,
        ingressClass: ing.spec?.ingressClassName,
        hosts: (ing.spec?.rules ?? []).map((r) => r.host),
      }));
      return { count: ingresses.length, ingresses };
    } catch (error) {
      return { error: 'Failed to list ingresses', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesGetIngress = tool({
  description: 'Get full ingress details including TLS config, rules, paths and load balancer status.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    ingressName: z.string().describe('Ingress name'),
  }),
  execute: async ({ kubernetesCredentials, namespace, ingressName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(
        kubernetesCredentials,
        itemPath('networking.k8s.io', 'v1', 'ingresses', ingressName, ns),
      );
    } catch (error) {
      return { error: 'Failed to get ingress', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
