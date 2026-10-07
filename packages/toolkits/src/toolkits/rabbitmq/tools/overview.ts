// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { rabbitmqRequest, failedResult, toRabbitmqError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'RabbitMQ credentials JSON with baseUrl (management URL, e.g. http://localhost:15672), username, password',
  );

export const rabbitmqGetOverview = tool({
  description:
    'Get broker overview: version, cluster name, totals (queues, exchanges, connections, channels, consumers), message rates, and listeners. Use for health dashboards.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/overview');
      if (!result.ok) return failedResult('Failed to get overview', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting overview');
    }
  },
});

export const rabbitmqGetClusterName = tool({
  description: 'Get the cluster name.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/cluster-name');
      if (!result.ok) return failedResult('Failed to get cluster name', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting cluster name');
    }
  },
});

export const rabbitmqSetClusterName = tool({
  description: 'Set the cluster name shown in the overview and management UI.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    name: z.string().describe('New cluster name'),
  }),
  execute: async ({ rabbitmqCredentials, name }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/cluster-name', {
        method: 'PUT',
        body: { name },
      });
      if (!result.ok) return failedResult('Failed to set cluster name', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting cluster name');
    }
  },
});

export const rabbitmqListNodes = tool({
  description: 'List cluster nodes with memory, disk, alarms, uptime, and rates.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/nodes');
      if (!result.ok) return failedResult('Failed to list nodes', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing nodes');
    }
  },
});

export const rabbitmqGetNode = tool({
  description: 'Get one node with detailed memory, disk, sockets, and process stats.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    nodeName: z.string().describe('Node name, e.g. rabbit@hostname'),
  }),
  execute: async ({ rabbitmqCredentials, nodeName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/nodes/${encodeURIComponent(nodeName)}`,
      );
      if (!result.ok) return failedResult('Failed to get node', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting node');
    }
  },
});

export const rabbitmqGetWhoAmI = tool({
  description:
    'Get the authenticated user (name and tags). Use to verify credentials and connectivity.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/whoami');
      if (!result.ok) return failedResult('Failed to get current user', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting current user');
    }
  },
});

export const rabbitmqAlivenessTest = tool({
  description:
    'Run an aliveness test on a vhost: declares a test queue, publishes and consumes a message. Returns ok status when the broker works end-to-end.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/aliveness-test/${encodeURIComponent(vhost ?? '/')}`,
      );
      if (!result.ok) return failedResult('Failed aliveness test', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error running aliveness test');
    }
  },
});

export const rabbitmqHealthAlarms = tool({
  description: 'Health check: resource alarms (memory/disk) across nodes.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/health/checks/alarms');
      if (!result.ok) return failedResult('Failed alarms health check', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error checking alarms health');
    }
  },
});

export const rabbitmqHealthLocalAlarms = tool({
  description: 'Health check: resource alarms on the local node.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/health/checks/local-alarms');
      if (!result.ok) return failedResult('Failed local alarms health check', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error checking local alarms health');
    }
  },
});

export const rabbitmqHealthCertificateExpiration = tool({
  description: 'Health check: TLS certificates expiring within a window. Use to catch renewals.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    within: z.number().int().min(1).describe('Time window amount'),
    unit: z.enum(['days', 'weeks', 'months', 'years']).describe('Time window unit'),
  }),
  execute: async ({ rabbitmqCredentials, within, unit }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/health/checks/certificate-expiration/${within}/${unit}`,
      );
      if (!result.ok) return failedResult('Failed certificate expiration health check', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error checking certificate expiration health');
    }
  },
});

export const rabbitmqHealthPortListener = tool({
  description: 'Health check: a TCP listener is active on a port.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    port: z.number().int().min(1).describe('Port number, e.g. 5672 or 15672'),
  }),
  execute: async ({ rabbitmqCredentials, port }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/health/checks/port-listener/${port}`,
      );
      if (!result.ok) return failedResult('Failed port listener health check', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error checking port listener health');
    }
  },
});

export const rabbitmqHealthProtocolListener = tool({
  description: 'Health check: a protocol listener (amqp, mqtt, stomp, ...) is active.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    protocol: z.string().describe('Protocol, e.g. amqp, mqtt, stomp'),
  }),
  execute: async ({ rabbitmqCredentials, protocol }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/health/checks/protocol-listener/${encodeURIComponent(protocol)}`,
      );
      if (!result.ok) return failedResult('Failed protocol listener health check', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error checking protocol listener health');
    }
  },
});

export const rabbitmqExportDefinitions = tool({
  description:
    'Export broker definitions (vhosts, users, permissions, exchanges, queues, bindings, policies, parameters) as JSON for backup or migration.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/definitions');
      if (!result.ok) return failedResult('Failed to export definitions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error exporting definitions');
    }
  },
});

export const rabbitmqExportVhostDefinitions = tool({
  description: 'Export definitions scoped to one vhost.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().describe('Virtual host'),
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/definitions/${encodeURIComponent(vhost)}`,
      );
      if (!result.ok) return failedResult('Failed to export vhost definitions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error exporting vhost definitions');
    }
  },
});

export const rabbitmqImportDefinitions = tool({
  description:
    'Import broker definitions JSON (users, vhosts, permissions, topology, policies). Use for restore or migration.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    definitions: z
      .record(z.string(), z.any())
      .describe('Definitions object from Export Definitions'),
  }),
  execute: async ({ rabbitmqCredentials, definitions }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/definitions', {
        method: 'POST',
        body: definitions,
      });
      if (!result.ok) return failedResult('Failed to import definitions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error importing definitions');
    }
  },
});

export const rabbitmqListFeatureFlags = tool({
  description: 'List feature flags with state and stability. Use to check upgrade readiness.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/feature-flags');
      if (!result.ok) return failedResult('Failed to list feature flags', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing feature flags');
    }
  },
});

export const rabbitmqEnableFeatureFlag = tool({
  description: 'Enable a feature flag cluster-wide. Cannot be undone — flags only move forward.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    flagName: z.string().describe('Feature flag name'),
  }),
  execute: async ({ rabbitmqCredentials, flagName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/feature-flags/${encodeURIComponent(flagName)}`,
        { method: 'PUT', body: {} },
      );
      if (!result.ok) return failedResult('Failed to enable feature flag', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error enabling feature flag');
    }
  },
});
