// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );

export const databricksListClusterPolicies = tool({
  description: 'List cluster policies that constrain cluster creation. Use to discover policy IDs.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/policies/clusters/list');
      if (!result.ok) return failedResult('Failed to list cluster policies', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing cluster policies');
    }
  },
});

export const databricksGetClusterPolicy = tool({
  description: 'Get one cluster policy with its rules definition.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    policyId: z.string().describe('Policy ID'),
  }),
  execute: async ({ databricksCredentials, policyId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/policies/clusters/get', {
        query: { policy_id: policyId },
      });
      if (!result.ok) return failedResult('Failed to get cluster policy', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting cluster policy');
    }
  },
});

export const databricksCreateClusterPolicy = tool({
  description:
    'Create a cluster policy (name + rules JSON) to enforce compliant cluster configs. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    name: z.string().describe('Policy name'),
    definition: z
      .record(z.string(), z.any())
      .describe('Policy rules, e.g. {"spark_version":{"type":"fixed","value":"13.3.x-scala2.12"}}'),
  }),
  execute: async ({ databricksCredentials, name, definition }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/policies/clusters/create',
        {
          method: 'POST',
          body: { name, definition: JSON.stringify(definition) },
        },
      );
      if (!result.ok) return failedResult('Failed to create cluster policy', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating cluster policy');
    }
  },
});

export const databricksEditClusterPolicy = tool({
  description: 'Edit a cluster policy name or rules. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    policyId: z.string().describe('Policy ID'),
    name: z.string().optional().describe('New policy name'),
    definition: z.record(z.string(), z.any()).optional().describe('New policy rules object'),
  }),
  execute: async ({ databricksCredentials, policyId, name, definition }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/policies/clusters/edit', {
        method: 'POST',
        body: {
          policy_id: policyId,
          ...(name !== undefined ? { name } : {}),
          ...(definition !== undefined ? { definition: JSON.stringify(definition) } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to edit cluster policy', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error editing cluster policy');
    }
  },
});

export const databricksDeleteClusterPolicy = tool({
  description: 'Delete a cluster policy. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    policyId: z.string().describe('Policy ID'),
  }),
  execute: async ({ databricksCredentials, policyId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/policies/clusters/delete',
        {
          method: 'POST',
          body: { policy_id: policyId },
        },
      );
      if (!result.ok) return failedResult('Failed to delete cluster policy', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting cluster policy');
    }
  },
});

export const databricksListInstancePools = tool({
  description: 'List instance pools for faster, cost-efficient cluster startup.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/instance-pools/list');
      if (!result.ok) return failedResult('Failed to list instance pools', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing instance pools');
    }
  },
});

export const databricksGetInstancePool = tool({
  description: 'Get one instance pool with node type, size bounds, and idle config.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    instancePoolId: z.string().describe('Instance pool ID'),
  }),
  execute: async ({ databricksCredentials, instancePoolId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/instance-pools/get', {
        query: { instance_pool_id: instancePoolId },
      });
      if (!result.ok) return failedResult('Failed to get instance pool', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting instance pool');
    }
  },
});

export const databricksCreateInstancePool = tool({
  description:
    'Create an instance pool (name, node_type_id, min/max idle instances). Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    pool: z
      .record(z.string(), z.any())
      .describe(
        'Pool spec: instance_pool_name, node_type_id, min_idle_instances, max_capacity, idle_instance_autotermination_minutes, aws/azure/gcp_attributes',
      ),
  }),
  execute: async ({ databricksCredentials, pool }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/instance-pools/create', {
        method: 'POST',
        body: pool,
      });
      if (!result.ok) return failedResult('Failed to create instance pool', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating instance pool');
    }
  },
});

export const databricksEditInstancePool = tool({
  description: 'Edit an instance pool (name, size bounds, idle termination). Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    instancePoolId: z.string().describe('Instance pool ID'),
    pool: z.record(z.string(), z.any()).describe('Pool fields to update'),
  }),
  execute: async ({ databricksCredentials, instancePoolId, pool }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/instance-pools/edit', {
        method: 'POST',
        body: { instance_pool_id: instancePoolId, ...pool },
      });
      if (!result.ok) return failedResult('Failed to edit instance pool', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error editing instance pool');
    }
  },
});

export const databricksDeleteInstancePool = tool({
  description: 'Delete an idle instance pool. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    instancePoolId: z.string().describe('Instance pool ID'),
  }),
  execute: async ({ databricksCredentials, instancePoolId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/instance-pools/delete', {
        method: 'POST',
        body: { instance_pool_id: instancePoolId },
      });
      if (!result.ok) return failedResult('Failed to delete instance pool', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting instance pool');
    }
  },
});

export const databricksListInitScripts = tool({
  description: 'List global init scripts run on every cluster at startup.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/global-init-scripts/list',
      );
      if (!result.ok) return failedResult('Failed to list init scripts', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing init scripts');
    }
  },
});

export const databricksGetInitScript = tool({
  description: 'Get one global init script with its base64 source.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scriptId: z.string().describe('Init script ID'),
  }),
  execute: async ({ databricksCredentials, scriptId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/global-init-scripts/get',
        {
          query: { script_id: scriptId },
        },
      );
      if (!result.ok) return failedResult('Failed to get init script', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting init script');
    }
  },
});

export const databricksCreateInitScript = tool({
  description: 'Create a global init script (name + base64 shell script). Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    name: z.string().describe('Script name'),
    scriptBase64: z.string().describe('Shell script content base64-encoded'),
    position: z.number().int().optional().describe('Execution order position'),
    enabled: z.boolean().optional().describe('Enable immediately'),
  }),
  execute: async ({ databricksCredentials, name, scriptBase64, position, enabled }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/global-init-scripts/create',
        {
          method: 'POST',
          body: {
            name,
            script: scriptBase64,
            ...(position !== undefined ? { position } : {}),
            ...(enabled !== undefined ? { enabled } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create init script', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating init script');
    }
  },
});

export const databricksUpdateInitScript = tool({
  description: 'Update a global init script (name, content, position, enabled). Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scriptId: z.string().describe('Init script ID'),
    name: z.string().optional().describe('New script name'),
    scriptBase64: z.string().optional().describe('New script content base64-encoded'),
    position: z.number().int().optional().describe('New execution order position'),
    enabled: z.boolean().optional().describe('Enable or disable'),
  }),
  execute: async ({ databricksCredentials, scriptId, name, scriptBase64, position, enabled }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/global-init-scripts/update',
        {
          method: 'POST',
          body: {
            script_id: scriptId,
            ...(name !== undefined ? { name } : {}),
            ...(scriptBase64 !== undefined ? { script: scriptBase64 } : {}),
            ...(position !== undefined ? { position } : {}),
            ...(enabled !== undefined ? { enabled } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update init script', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating init script');
    }
  },
});

export const databricksDeleteInitScript = tool({
  description: 'Delete a global init script. Requires admin.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    scriptId: z.string().describe('Init script ID'),
  }),
  execute: async ({ databricksCredentials, scriptId }) => {
    try {
      const result = await databricksRequest(
        databricksCredentials,
        '/2.0/global-init-scripts/delete',
        {
          method: 'POST',
          body: { script_id: scriptId },
        },
      );
      if (!result.ok) return failedResult('Failed to delete init script', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting init script');
    }
  },
});
