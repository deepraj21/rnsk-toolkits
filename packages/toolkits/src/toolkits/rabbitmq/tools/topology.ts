// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { rabbitmqRequest, seg, failedResult, toRabbitmqError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'RabbitMQ credentials JSON with baseUrl (management URL, e.g. http://localhost:15672), username, password',
  );

export const rabbitmqListConnections = tool({
  description:
    'List client connections with user, vhost, channels count, and throughput. Use to spot leaks.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    page: z.number().int().min(1).optional().describe('Page number'),
    pageSize: z.number().int().min(1).optional().describe('Connections per page'),
  }),
  execute: async ({ rabbitmqCredentials, page, pageSize }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/connections', {
        query: { page, page_size: pageSize },
      });
      if (!result.ok) return failedResult('Failed to list connections', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing connections');
    }
  },
});

export const rabbitmqGetConnection = tool({
  description: 'Get one connection with protocol, peer, auth, and channel details.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    connectionName: z.string().describe('Connection name'),
  }),
  execute: async ({ rabbitmqCredentials, connectionName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/connections/${seg(connectionName)}`,
      );
      if (!result.ok) return failedResult('Failed to get connection', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting connection');
    }
  },
});

export const rabbitmqListConnectionChannels = tool({
  description: 'List channels open on one connection.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    connectionName: z.string().describe('Connection name'),
  }),
  execute: async ({ rabbitmqCredentials, connectionName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/connections/${seg(connectionName)}/channels`,
      );
      if (!result.ok) return failedResult('Failed to list connection channels', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing connection channels');
    }
  },
});

export const rabbitmqCloseConnection = tool({
  description:
    'Force-close a client connection (channels and consumers close too). Use for stuck or leaked connections.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    connectionName: z.string().describe('Connection name'),
    reason: z.string().optional().describe('Reason recorded in logs and notified to the client'),
  }),
  execute: async ({ rabbitmqCredentials, connectionName, reason }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/connections/${seg(connectionName)}`,
        {
          method: 'DELETE',
          headers: reason !== undefined ? { 'X-Reason': reason } : undefined,
        },
      );
      if (!result.ok) return failedResult('Failed to close connection', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error closing connection');
    }
  },
});

export const rabbitmqListChannels = tool({
  description: 'List channels across connections with unacked counts and transactional state.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    page: z.number().int().min(1).optional().describe('Page number'),
    pageSize: z.number().int().min(1).optional().describe('Channels per page'),
  }),
  execute: async ({ rabbitmqCredentials, page, pageSize }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/channels', {
        query: { page, page_size: pageSize },
      });
      if (!result.ok) return failedResult('Failed to list channels', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing channels');
    }
  },
});

export const rabbitmqGetChannel = tool({
  description: 'Get one channel with consumer count, unacked messages, and connection link.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    channelName: z.string().describe('Channel name'),
  }),
  execute: async ({ rabbitmqCredentials, channelName }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/channels/${seg(channelName)}`);
      if (!result.ok) return failedResult('Failed to get channel', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting channel');
    }
  },
});

export const rabbitmqListConsumers = tool({
  description: 'List consumers across all vhosts with queue, ack mode, and prefetch.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    page: z.number().int().min(1).optional().describe('Page number'),
    pageSize: z.number().int().min(1).optional().describe('Consumers per page'),
  }),
  execute: async ({ rabbitmqCredentials, page, pageSize }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/consumers', {
        query: { page, page_size: pageSize },
      });
      if (!result.ok) return failedResult('Failed to list consumers', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing consumers');
    }
  },
});

export const rabbitmqListConsumersInVhost = tool({
  description: 'List consumers in one vhost.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/consumers/${seg(vhost ?? '/')}`);
      if (!result.ok) return failedResult('Failed to list consumers in vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing consumers in vhost');
    }
  },
});

export const rabbitmqListPolicies = tool({
  description: 'List operator-agnostic policies (classic policies) across vhosts.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/policies');
      if (!result.ok) return failedResult('Failed to list policies', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing policies');
    }
  },
});

export const rabbitmqListPoliciesInVhost = tool({
  description: 'List policies in one vhost (mirroring, TTL, max-length, ...).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/policies/${seg(vhost ?? '/')}`);
      if (!result.ok) return failedResult('Failed to list policies in vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing policies in vhost');
    }
  },
});

export const rabbitmqGetPolicy = tool({
  description: 'Get one policy with pattern, definition, priority, and apply-to.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
    policyName: z.string().describe('Policy name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, policyName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/policies/${seg(vhost ?? '/')}/${seg(policyName)}`,
      );
      if (!result.ok) return failedResult('Failed to get policy', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting policy');
    }
  },
});

export const rabbitmqSetPolicy = tool({
  description:
    'Create or update a policy: regex pattern, definition (ha-mode, message-ttl, max-length, ...), priority, and apply-to (queues/exchanges/all).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
    policyName: z.string().describe('Policy name'),
    pattern: z.string().describe('Regex matching queue/exchange names, e.g. ^ha\\.'),
    definition: z
      .record(z.string(), z.any())
      .describe('Policy keys, e.g. {"ha-mode":"all","message-ttl":60000}'),
    priority: z.number().int().optional().describe('Higher priority wins on overlap'),
    applyTo: z.enum(['queues', 'exchanges', 'all']).optional().describe('Apply target'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    policyName,
    pattern,
    definition,
    priority,
    applyTo,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/policies/${seg(vhost ?? '/')}/${seg(policyName)}`,
        {
          method: 'PUT',
          body: {
            pattern,
            definition,
            ...(priority !== undefined ? { priority } : {}),
            ...(applyTo !== undefined ? { 'apply-to': applyTo } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to set policy', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting policy');
    }
  },
});

export const rabbitmqDeletePolicy = tool({
  description: 'Delete a policy (matched queues/exchanges revert to defaults).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
    policyName: z.string().describe('Policy name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, policyName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/policies/${seg(vhost ?? '/')}/${seg(policyName)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete policy', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting policy');
    }
  },
});

export const rabbitmqListOperatorPolicies = tool({
  description: 'List operator policies (operator-controlled overrides) across vhosts.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/operator-policies');
      if (!result.ok) return failedResult('Failed to list operator policies', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing operator policies');
    }
  },
});

export const rabbitmqGetOperatorPolicy = tool({
  description: 'Get one operator policy.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
    policyName: z.string().describe('Policy name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, policyName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/operator-policies/${seg(vhost ?? '/')}/${seg(policyName)}`,
      );
      if (!result.ok) return failedResult('Failed to get operator policy', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting operator policy');
    }
  },
});

export const rabbitmqSetOperatorPolicy = tool({
  description: 'Create or update an operator policy override.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
    policyName: z.string().describe('Policy name'),
    pattern: z.string().describe('Regex matching names'),
    definition: z.record(z.string(), z.any()).describe('Override keys'),
    priority: z.number().int().optional().describe('Priority'),
    applyTo: z.enum(['queues', 'exchanges', 'all']).optional().describe('Apply target'),
  }),
  execute: async ({
    rabbitmqCredentials,
    vhost,
    policyName,
    pattern,
    definition,
    priority,
    applyTo,
  }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/operator-policies/${seg(vhost ?? '/')}/${seg(policyName)}`,
        {
          method: 'PUT',
          body: {
            pattern,
            definition,
            ...(priority !== undefined ? { priority } : {}),
            ...(applyTo !== undefined ? { 'apply-to': applyTo } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to set operator policy', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting operator policy');
    }
  },
});

export const rabbitmqDeleteOperatorPolicy = tool({
  description: 'Delete an operator policy override.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().optional().describe('Virtual host (default /)'),
    policyName: z.string().describe('Policy name'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, policyName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/operator-policies/${seg(vhost ?? '/')}/${seg(policyName)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete operator policy', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting operator policy');
    }
  },
});

export const rabbitmqListParameters = tool({
  description: 'List runtime parameters across components (federation, shovel, ...).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/parameters');
      if (!result.ok) return failedResult('Failed to list parameters', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing parameters');
    }
  },
});

export const rabbitmqListComponentParameters = tool({
  description: 'List runtime parameters for one component (e.g. shovel, federation-upstream).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    component: z.string().describe('Component, e.g. shovel, federation-upstream'),
  }),
  execute: async ({ rabbitmqCredentials, component }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/parameters/${seg(component)}`);
      if (!result.ok) return failedResult('Failed to list component parameters', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing component parameters');
    }
  },
});

export const rabbitmqGetParameter = tool({
  description: 'Get one runtime parameter value (shovel/federation definitions).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    component: z.string().describe('Component'),
    vhost: z.string().optional().describe('Virtual host (default /)'),
    parameterName: z.string().describe('Parameter name'),
  }),
  execute: async ({ rabbitmqCredentials, component, vhost, parameterName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/parameters/${seg(component)}/${seg(vhost ?? '/')}/${seg(parameterName)}`,
      );
      if (!result.ok) return failedResult('Failed to get parameter', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting parameter');
    }
  },
});

export const rabbitmqSetParameter = tool({
  description:
    'Create or update a runtime parameter (shovel, federation upstream/policy). Value holds the component config.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    component: z.string().describe('Component, e.g. shovel'),
    vhost: z.string().optional().describe('Virtual host (default /)'),
    parameterName: z.string().describe('Parameter name'),
    value: z.record(z.string(), z.any()).describe('Parameter value object'),
  }),
  execute: async ({ rabbitmqCredentials, component, vhost, parameterName, value }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/parameters/${seg(component)}/${seg(vhost ?? '/')}/${seg(parameterName)}`,
        { method: 'PUT', body: { value } },
      );
      if (!result.ok) return failedResult('Failed to set parameter', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting parameter');
    }
  },
});

export const rabbitmqDeleteParameter = tool({
  description: 'Delete a runtime parameter (stops the shovel/federation link).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    component: z.string().describe('Component'),
    vhost: z.string().optional().describe('Virtual host (default /)'),
    parameterName: z.string().describe('Parameter name'),
  }),
  execute: async ({ rabbitmqCredentials, component, vhost, parameterName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/parameters/${seg(component)}/${seg(vhost ?? '/')}/${seg(parameterName)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete parameter', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting parameter');
    }
  },
});

export const rabbitmqListGlobalParameters = tool({
  description: 'List global runtime parameters.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/global-parameters');
      if (!result.ok) return failedResult('Failed to list global parameters', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing global parameters');
    }
  },
});

export const rabbitmqGetGlobalParameter = tool({
  description: 'Get one global parameter.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    parameterName: z.string().describe('Parameter name'),
  }),
  execute: async ({ rabbitmqCredentials, parameterName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/global-parameters/${seg(parameterName)}`,
      );
      if (!result.ok) return failedResult('Failed to get global parameter', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting global parameter');
    }
  },
});

export const rabbitmqSetGlobalParameter = tool({
  description: 'Create or update a global runtime parameter.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    parameterName: z.string().describe('Parameter name'),
    value: z.record(z.string(), z.any()).describe('Parameter value object'),
  }),
  execute: async ({ rabbitmqCredentials, parameterName, value }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/global-parameters/${seg(parameterName)}`,
        { method: 'PUT', body: { value } },
      );
      if (!result.ok) return failedResult('Failed to set global parameter', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting global parameter');
    }
  },
});

export const rabbitmqDeleteGlobalParameter = tool({
  description: 'Delete a global runtime parameter.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    parameterName: z.string().describe('Parameter name'),
  }),
  execute: async ({ rabbitmqCredentials, parameterName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/global-parameters/${seg(parameterName)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete global parameter', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting global parameter');
    }
  },
});
