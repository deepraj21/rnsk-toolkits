// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { opsgenieRequest, failedResult, toOpsgenieError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');
const regionField = z.enum(['us', 'eu']).optional().describe('Opsgenie region: us (default) or eu');

export const opsgenieListEscalations = tool({
  description: 'List escalation policies with rules.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/escalations', { region });
      if (!result.ok) return failedResult('Failed to list escalations', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing escalations');
    }
  },
});

export const opsgenieGetEscalation = tool({
  description: 'Get one escalation with rules, repeat, and owner team.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Escalation ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/escalations/${identifier}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get escalation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting escalation');
    }
  },
});

export const opsgenieCreateEscalation = tool({
  description:
    'Create an escalation policy (name, rules with recipients/delays, owner team, repeat).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Escalation name'),
    rules: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe(
        'Rules [{condition, notifyType, delay {timeAmount, timeUnit}, recipient {type, id|name}}]',
      ),
    description: z.string().optional().describe('Escalation description'),
    ownerTeam: z.record(z.string(), z.any()).optional().describe('Owner team {id} or {name}'),
    repeat: z
      .record(z.string(), z.any())
      .optional()
      .describe(
        'Repeat {waitInterval, count, resetRecipientStates, closeAlertAfterAll, loopAfter}',
      ),
  }),
  execute: async ({ opsgenieApiKey, region, name, rules, description, ownerTeam, repeat }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/escalations', {
        method: 'POST',
        region,
        body: {
          name,
          rules,
          ...(description !== undefined ? { description } : {}),
          ...(ownerTeam !== undefined ? { ownerTeam } : {}),
          ...(repeat !== undefined ? { repeat } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create escalation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating escalation');
    }
  },
});

export const opsgenieUpdateEscalation = tool({
  description: 'Partially update an escalation (rules, repeat, owner).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Escalation ID or name'),
    escalation: z.record(z.string(), z.any()).describe('Escalation fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, escalation }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/escalations/${identifier}`, {
        method: 'PATCH',
        region,
        body: escalation,
      });
      if (!result.ok) return failedResult('Failed to update escalation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating escalation');
    }
  },
});

export const opsgenieDeleteEscalation = tool({
  description: 'Delete an escalation policy.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Escalation ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/escalations/${identifier}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete escalation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting escalation');
    }
  },
});

export const opsgenieListIntegrations = tool({
  description: 'List API/email/incoming integrations with types and enabled state.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/integrations', { region });
      if (!result.ok) return failedResult('Failed to list integrations', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing integrations');
    }
  },
});

export const opsgenieGetIntegration = tool({
  description: 'Get one integration with type-specific config.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    integrationId: z.string().describe('Integration ID'),
  }),
  execute: async ({ opsgenieApiKey, region, integrationId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/integrations/${integrationId}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting integration');
    }
  },
});

export const opsgenieCreateIntegration = tool({
  description: 'Create an integration (API, email, or vendor type) with responders and owner team.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Integration name'),
    type: z.string().describe('Integration type, e.g. API, Email, Datadog, Prometheus'),
    ownerTeam: z.record(z.string(), z.any()).optional().describe('Owner team {id} or {name}'),
    enabled: z.boolean().optional().describe('Enable on creation'),
    allowConfigurationAccess: z.boolean().optional().describe('Allow config access (API keys)'),
    responders: z.array(z.record(z.string(), z.any())).optional().describe('Default responders'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    name,
    type,
    ownerTeam,
    enabled,
    allowConfigurationAccess,
    responders,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/integrations', {
        method: 'POST',
        region,
        body: {
          name,
          type,
          ...(ownerTeam !== undefined ? { ownerTeam } : {}),
          ...(enabled !== undefined ? { enabled } : {}),
          ...(allowConfigurationAccess !== undefined ? { allowConfigurationAccess } : {}),
          ...(responders !== undefined ? { responders } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating integration');
    }
  },
});

export const opsgenieUpdateIntegration = tool({
  description: 'Update an integration (name, responders, owner, settings).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    integrationId: z.string().describe('Integration ID'),
    integration: z.record(z.string(), z.any()).describe('Integration fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, integrationId, integration }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/integrations/${integrationId}`, {
        method: 'PUT',
        region,
        body: integration,
      });
      if (!result.ok) return failedResult('Failed to update integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating integration');
    }
  },
});

export const opsgenieDeleteIntegration = tool({
  description: 'Delete an integration (its API key stops working).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    integrationId: z.string().describe('Integration ID'),
  }),
  execute: async ({ opsgenieApiKey, region, integrationId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/integrations/${integrationId}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting integration');
    }
  },
});

export const opsgenieEnableIntegration = tool({
  description: 'Enable an integration.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    integrationId: z.string().describe('Integration ID'),
  }),
  execute: async ({ opsgenieApiKey, region, integrationId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/integrations/${integrationId}/enable`,
        {
          method: 'POST',
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to enable integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error enabling integration');
    }
  },
});

export const opsgenieDisableIntegration = tool({
  description: 'Disable an integration (stops alert intake, keeps config).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    integrationId: z.string().describe('Integration ID'),
  }),
  execute: async ({ opsgenieApiKey, region, integrationId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/integrations/${integrationId}/disable`,
        {
          method: 'POST',
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to disable integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error disabling integration');
    }
  },
});

export const opsgenieAuthenticateIntegration = tool({
  description: 'Authenticate an integration (validate key/permissions).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/integrations/authenticate', {
        method: 'POST',
        region,
      });
      if (!result.ok) return failedResult('Failed to authenticate integration', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error authenticating integration');
    }
  },
});

export const opsgenieListMaintenance = tool({
  description: 'List maintenance windows (muted alerts).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v1/maintenance', { region });
      if (!result.ok) return failedResult('Failed to list maintenance windows', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing maintenance windows');
    }
  },
});

export const opsgenieGetMaintenance = tool({
  description: 'Get one maintenance window with rules and time range.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    maintenanceId: z.string().describe('Maintenance ID'),
  }),
  execute: async ({ opsgenieApiKey, region, maintenanceId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/maintenance/${maintenanceId}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get maintenance window', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting maintenance window');
    }
  },
});

export const opsgenieCreateMaintenance = tool({
  description: 'Create a maintenance window muting matching alerts (entities, tags, time range).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    description: z.string().describe('Maintenance description'),
    time: z.record(z.string(), z.any()).describe('Time {type: schedule, startDate, endDate}'),
    rules: z
      .array(z.record(z.string(), z.any()))
      .describe('Rules [{entity {id|name, type}, state}]'),
  }),
  execute: async ({ opsgenieApiKey, region, description, time, rules }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v1/maintenance', {
        method: 'POST',
        region,
        body: { description, time, rules },
      });
      if (!result.ok) return failedResult('Failed to create maintenance window', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating maintenance window');
    }
  },
});

export const opsgenieUpdateMaintenance = tool({
  description: 'Update a maintenance window.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    maintenanceId: z.string().describe('Maintenance ID'),
    maintenance: z.record(z.string(), z.any()).describe('Maintenance fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, maintenanceId, maintenance }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/maintenance/${maintenanceId}`, {
        method: 'PUT',
        region,
        body: maintenance,
      });
      if (!result.ok) return failedResult('Failed to update maintenance window', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating maintenance window');
    }
  },
});

export const opsgenieDeleteMaintenance = tool({
  description: 'Delete a maintenance window.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    maintenanceId: z.string().describe('Maintenance ID'),
  }),
  execute: async ({ opsgenieApiKey, region, maintenanceId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/maintenance/${maintenanceId}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete maintenance window', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting maintenance window');
    }
  },
});

export const opsgenieCancelMaintenance = tool({
  description: 'Cancel an active maintenance window early.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    maintenanceId: z.string().describe('Maintenance ID'),
  }),
  execute: async ({ opsgenieApiKey, region, maintenanceId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v1/maintenance/${maintenanceId}/cancel`,
        {
          method: 'POST',
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to cancel maintenance window', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error canceling maintenance window');
    }
  },
});

export const opsgenieListServices = tool({
  description:
    'List services (business components for incident impact). Standard/Enterprise plans.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v1/services/', { region });
      if (!result.ok) return failedResult('Failed to list services', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing services');
    }
  },
});

export const opsgenieGetService = tool({
  description: 'Get one service with team and tags.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Service ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/services/${identifier}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get service', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting service');
    }
  },
});

export const opsgenieCreateService = tool({
  description: 'Create a service owned by a team (name, description, tags).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Service name'),
    teamId: z.string().describe('Owner team ID'),
    description: z.string().optional().describe('Service description'),
    tags: z.array(z.string()).optional().describe('Service tags'),
  }),
  execute: async ({ opsgenieApiKey, region, name, teamId, description, tags }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v1/services', {
        method: 'POST',
        region,
        body: {
          name,
          teamId,
          ...(description !== undefined ? { description } : {}),
          ...(tags !== undefined ? { tags } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create service', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating service');
    }
  },
});

export const opsgenieUpdateService = tool({
  description: 'Partially update a service.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Service ID or name'),
    service: z.record(z.string(), z.any()).describe('Service fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, service }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/services/${identifier}`, {
        method: 'PATCH',
        region,
        body: service,
      });
      if (!result.ok) return failedResult('Failed to update service', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating service');
    }
  },
});

export const opsgenieDeleteService = tool({
  description: 'Delete a service.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Service ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/services/${identifier}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete service', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting service');
    }
  },
});

export const opsgenieListAlertPolicies = tool({
  description: 'List alert policies (filtering, deduplication, auto-close rules).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/policies/alert', { region });
      if (!result.ok) return failedResult('Failed to list alert policies', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing alert policies');
    }
  },
});

export const opsgenieListNotificationPolicies = tool({
  description: 'List notification policies (routing delay/suppression rules).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/policies/notification', { region });
      if (!result.ok) return failedResult('Failed to list notification policies', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing notification policies');
    }
  },
});

export const opsgenieCreatePolicy = tool({
  description: 'Create an alert or notification policy (name, filter, actions, time restrictions).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Policy name'),
    policyType: z.string().optional().describe('Policy type hint for the payload'),
    filter: z.record(z.string(), z.any()).optional().describe('Match filter {type, conditions}'),
    actions: z.array(z.string()).optional().describe('Policy actions'),
    policy: z.record(z.string(), z.any()).optional().describe('Full policy object override'),
  }),
  execute: async ({ opsgenieApiKey, region, name, policyType, filter, actions, policy }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/policies', {
        method: 'POST',
        region,
        body: {
          ...(policy ?? {
            name,
            ...(policyType !== undefined ? { policyType } : {}),
            ...(filter !== undefined ? { filter } : {}),
            ...(actions !== undefined ? { actions } : {}),
          }),
        },
      });
      if (!result.ok) return failedResult('Failed to create policy', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating policy');
    }
  },
});

export const opsgenieGetPolicy = tool({
  description: 'Get one policy with filter and actions.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    policyId: z.string().describe('Policy ID'),
  }),
  execute: async ({ opsgenieApiKey, region, policyId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/policies/${policyId}`, { region });
      if (!result.ok) return failedResult('Failed to get policy', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting policy');
    }
  },
});

export const opsgenieUpdatePolicy = tool({
  description: 'Update a policy (filter, actions, enabled state).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    policyId: z.string().describe('Policy ID'),
    policy: z.record(z.string(), z.any()).describe('Policy fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, policyId, policy }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/policies/${policyId}`, {
        method: 'PUT',
        region,
        body: policy,
      });
      if (!result.ok) return failedResult('Failed to update policy', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating policy');
    }
  },
});

export const opsgenieDeletePolicy = tool({
  description: 'Delete a policy.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    policyId: z.string().describe('Policy ID'),
  }),
  execute: async ({ opsgenieApiKey, region, policyId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/policies/${policyId}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete policy', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting policy');
    }
  },
});

export const opsgenieEnablePolicy = tool({
  description: 'Enable a policy.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    policyId: z.string().describe('Policy ID'),
  }),
  execute: async ({ opsgenieApiKey, region, policyId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/policies/${policyId}/enable`, {
        method: 'POST',
        region,
      });
      if (!result.ok) return failedResult('Failed to enable policy', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error enabling policy');
    }
  },
});

export const opsgenieDisablePolicy = tool({
  description: 'Disable a policy (keeps config, stops evaluation).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    policyId: z.string().describe('Policy ID'),
  }),
  execute: async ({ opsgenieApiKey, region, policyId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/policies/${policyId}/disable`, {
        method: 'POST',
        region,
      });
      if (!result.ok) return failedResult('Failed to disable policy', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error disabling policy');
    }
  },
});

export const opsgenieChangePolicyOrder = tool({
  description: 'Move a policy to a new evaluation position.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    policyId: z.string().describe('Policy ID'),
    order: z.number().int().min(0).describe('New zero-based order'),
  }),
  execute: async ({ opsgenieApiKey, region, policyId, order }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/policies/${policyId}/change-order`,
        {
          method: 'POST',
          region,
          body: { order },
        },
      );
      if (!result.ok) return failedResult('Failed to change policy order', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error changing policy order');
    }
  },
});

export const opsgenieListHeartbeats = tool({
  description: 'List heartbeat monitors with expiry and alert state.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/heartbeats', { region });
      if (!result.ok) return failedResult('Failed to list heartbeats', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing heartbeats');
    }
  },
});

export const opsgenieGetHeartbeat = tool({
  description: 'Get one heartbeat with interval and recipients.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    heartbeatName: z.string().describe('Heartbeat name'),
  }),
  execute: async ({ opsgenieApiKey, region, heartbeatName }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/heartbeats/${heartbeatName}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting heartbeat');
    }
  },
});

export const opsgenieCreateHeartbeat = tool({
  description: 'Create a heartbeat monitor (name, interval, unit, owner team, alert message).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Heartbeat name'),
    interval: z.number().int().min(1).describe('Expected ping interval'),
    intervalUnit: z.enum(['minutes', 'hours', 'days']).describe('Interval unit'),
    description: z.string().optional().describe('Heartbeat description'),
    ownerTeam: z.record(z.string(), z.any()).optional().describe('Owner team {id} or {name}'),
    alertMessage: z.string().optional().describe('Alert message on expiry'),
    alertTags: z.array(z.string()).optional().describe('Alert tags on expiry'),
    alertPriority: z
      .enum(['P1', 'P2', 'P3', 'P4', 'P5'])
      .optional()
      .describe('Alert priority on expiry'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    name,
    interval,
    intervalUnit,
    description,
    ownerTeam,
    alertMessage,
    alertTags,
    alertPriority,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/heartbeats', {
        method: 'POST',
        region,
        body: {
          name,
          interval,
          intervalUnit,
          ...(description !== undefined ? { description } : {}),
          ...(ownerTeam !== undefined ? { ownerTeam } : {}),
          ...(alertMessage !== undefined ? { alertMessage } : {}),
          ...(alertTags !== undefined ? { alertTags } : {}),
          ...(alertPriority !== undefined ? { alertPriority } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating heartbeat');
    }
  },
});

export const opsgenieUpdateHeartbeat = tool({
  description: 'Partially update a heartbeat (interval, owner, alert template).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    heartbeatName: z.string().describe('Heartbeat name'),
    heartbeat: z.record(z.string(), z.any()).describe('Heartbeat fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, heartbeatName, heartbeat }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/heartbeats/${heartbeatName}`, {
        method: 'PATCH',
        region,
        body: heartbeat,
      });
      if (!result.ok) return failedResult('Failed to update heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating heartbeat');
    }
  },
});

export const opsgenieDeleteHeartbeat = tool({
  description: 'Delete a heartbeat monitor.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    heartbeatName: z.string().describe('Heartbeat name'),
  }),
  execute: async ({ opsgenieApiKey, region, heartbeatName }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/heartbeats/${heartbeatName}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting heartbeat');
    }
  },
});

export const opsgeniePingHeartbeat = tool({
  description: 'Send a heartbeat ping (keeps the monitor green). Use from cron/jobs.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    heartbeatName: z.string().describe('Heartbeat name'),
  }),
  execute: async ({ opsgenieApiKey, region, heartbeatName }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/heartbeats/${heartbeatName}/ping`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to ping heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error pinging heartbeat');
    }
  },
});

export const opsgenieEnableHeartbeat = tool({
  description: 'Enable a heartbeat monitor.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    heartbeatName: z.string().describe('Heartbeat name'),
  }),
  execute: async ({ opsgenieApiKey, region, heartbeatName }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/heartbeats/${heartbeatName}/enable`,
        {
          method: 'POST',
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to enable heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error enabling heartbeat');
    }
  },
});

export const opsgenieDisableHeartbeat = tool({
  description: 'Disable a heartbeat monitor (pauses expiry alerts).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    heartbeatName: z.string().describe('Heartbeat name'),
  }),
  execute: async ({ opsgenieApiKey, region, heartbeatName }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/heartbeats/${heartbeatName}/disable`,
        {
          method: 'POST',
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to disable heartbeat', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error disabling heartbeat');
    }
  },
});

export const opsgenieGetAccountInfo = tool({
  description: 'Get account info (name, plan, user count). Use to verify the API key.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/account', { region });
      if (!result.ok) return failedResult('Failed to get account info', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting account info');
    }
  },
});
