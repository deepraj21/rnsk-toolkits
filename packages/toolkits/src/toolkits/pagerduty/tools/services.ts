// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');
const pageFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Pagination offset'),
  total: z.boolean().optional().describe('Populate the total count (slower)'),
};

export const pagerdutyListServices = tool({
  description: 'List monitored services with optional team, name, and status filters.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamIds: z.array(z.string()).optional().describe('Only services owned by these teams'),
    query: z.string().optional().describe('Filter by service name substring'),
    status: z
      .enum(['active', 'warning', 'critical', 'maintenance', 'disabled'])
      .optional()
      .describe('Filter by status'),
    include: z
      .array(z.string())
      .optional()
      .describe(
        'Embed: escalation_policies, teams, integrations, auto_pause_notifications_parameters',
      ),
    sortBy: z.string().optional().describe('Sort field, e.g. "name"'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamIds, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/services', {
      query: { ...query, team_ids: teamIds },
    }),
});

export const pagerdutyGetService = tool({
  description: 'Get one service with its escalation policy, integrations, and urgency rules.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    include: z.array(z.string()).optional().describe('Embed related objects'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, include }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/services/${encodeURIComponent(serviceId)}`, {
      query: { include },
    }),
});

export const pagerdutyCreateService = tool({
  description: 'Create a monitored service with an escalation policy and urgency rules.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Service name'),
    escalationPolicyId: z.string().describe('Escalation policy ID for new incidents'),
    description: z.string().optional().describe('What this service monitors'),
    urgency: z.enum(['high', 'low']).optional().describe('Default incident urgency (default high)'),
    alertCreation: z
      .enum(['create_alerts_and_incidents', 'create_incidents'])
      .optional()
      .describe('Whether inbound events create standalone alerts'),
    autoResolveTimeout: z
      .number()
      .int()
      .optional()
      .describe('Auto-resolve resolved alerts after seconds (0 disables)'),
    acknowledgementTimeout: z
      .number()
      .int()
      .optional()
      .describe('Re-escalate unacknowledged incidents after seconds (0 disables)'),
    teamIds: z.array(z.string()).optional().describe('Owning team IDs'),
  }),
  execute: ({
    pagerdutyApiKey,
    name,
    escalationPolicyId,
    description,
    urgency,
    alertCreation,
    autoResolveTimeout,
    acknowledgementTimeout,
    teamIds,
  }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/services', {
      body: {
        service: {
          type: 'service',
          name,
          escalation_policy: { id: escalationPolicyId, type: 'escalation_policy_reference' },
          ...(description ? { description } : {}),
          ...(urgency ? { incident_urgency_rule: { type: 'constant', urgency } } : {}),
          ...(alertCreation ? { alert_creation: alertCreation } : {}),
          ...(autoResolveTimeout !== undefined ? { auto_resolve_timeout: autoResolveTimeout } : {}),
          ...(acknowledgementTimeout !== undefined
            ? { acknowledgement_timeout: acknowledgementTimeout }
            : {}),
          ...(teamIds ? { teams: teamIds.map((id) => ({ id, type: 'team_reference' })) } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateService = tool({
  description: 'Update a service name, policies, urgency rules, or team ownership.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID to update'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    status: z
      .enum(['active', 'warning', 'critical', 'maintenance', 'disabled'])
      .optional()
      .describe('New status'),
    escalationPolicyId: z.string().optional().describe('New escalation policy ID'),
    urgency: z.enum(['high', 'low']).optional().describe('New default urgency'),
    autoResolveTimeout: z.number().int().optional().describe('Auto-resolve timeout seconds'),
    acknowledgementTimeout: z.number().int().optional().describe('Acknowledgement timeout seconds'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, escalationPolicyId, urgency, ...patch }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/services/${encodeURIComponent(serviceId)}`, {
      body: {
        service: {
          type: 'service',
          ...patch,
          ...(escalationPolicyId
            ? { escalation_policy: { id: escalationPolicyId, type: 'escalation_policy_reference' } }
            : {}),
          ...(urgency ? { incident_urgency_rule: { type: 'constant', urgency } } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteService = tool({
  description: 'Delete a service. Incidents on it become orphaned — reassign first if needed.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/services/${encodeURIComponent(serviceId)}`),
});

export const pagerdutyCreateServiceIntegration = tool({
  description:
    'Add an inbound integration (Events API, email, monitoring tool) to a service. Returns routing/integration keys.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    name: z.string().optional().describe('Integration name/label'),
    vendorId: z
      .string()
      .optional()
      .describe('Vendor ID for a known tool (see pagerdutyListVendors? use type+name otherwise)'),
    type: z
      .string()
      .optional()
      .describe('Integration type, e.g. "events_api_v2_inbound_integration"'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, name, vendorId, type }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/services/${encodeURIComponent(serviceId)}/integrations`, {
      body: {
        integration: {
          type: type ?? 'events_api_v2_inbound_integration',
          ...(name ? { name } : {}),
          ...(vendorId ? { vendor: { id: vendorId, type: 'vendor_reference' } } : {}),
        },
      },
    }),
});

export const pagerdutyGetServiceIntegration = tool({
  description: 'Get one service integration including its keys and vendor details.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    integrationId: z.string().describe('Integration ID'),
    include: z.array(z.string()).optional().describe('Embed, e.g. ["vendor"]'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, integrationId, include }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/services/${encodeURIComponent(serviceId)}/integrations/${encodeURIComponent(integrationId)}`,
      { query: { include } },
    ),
});

export const pagerdutyUpdateServiceIntegration = tool({
  description: 'Rename or reconfigure a service integration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    integrationId: z.string().describe('Integration ID'),
    name: z.string().optional().describe('New integration name'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, integrationId, name }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/services/${encodeURIComponent(serviceId)}/integrations/${encodeURIComponent(integrationId)}`,
      {
        body: {
          integration: { type: 'generic_email_inbound_integration', ...(name ? { name } : {}) },
        },
      },
    ),
});

export const pagerdutyListServiceEventRules = tool({
  description: 'List event rules that route/transform events for a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/services/${encodeURIComponent(serviceId)}/rules`),
});

export const pagerdutyGetServiceEventRule = tool({
  description: 'Get one service event rule with its conditions and actions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/services/${encodeURIComponent(serviceId)}/rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyCreateServiceEventRule = tool({
  description: 'Create a service event rule with conditions and routing/suppression actions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    rule: z
      .record(z.any())
      .describe('Full rule object: {position, disabled, conditions, actions, ...}'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, rule }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/services/${encodeURIComponent(serviceId)}/rules`, {
      body: { rule },
    }),
});

export const pagerdutyUpdateServiceEventRule = tool({
  description: 'Update a service event rule conditions, actions, or position.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ruleId: z.string().describe('Rule ID'),
    rule: z.record(z.any()).describe('Full replacement rule object'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, ruleId, rule }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/services/${encodeURIComponent(serviceId)}/rules/${encodeURIComponent(ruleId)}`,
      { body: { rule } },
    ),
});

export const pagerdutyDeleteServiceEventRule = tool({
  description: 'Delete a service event rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ruleId: z.string().describe('Rule ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/services/${encodeURIComponent(serviceId)}/rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyConvertServiceEventRule = tool({
  description: 'Convert a service event ruleset to the newer event orchestration format.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID whose ruleset should be converted'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/services/${encodeURIComponent(serviceId)}/rules/convert`),
});

export const pagerdutyListServiceChangeEvents = tool({
  description: 'List change events (deploys, releases) recorded against a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, serviceId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/services/${encodeURIComponent(serviceId)}/change_events`, {
      query,
    }),
});

export const pagerdutyGetServiceAuditRecords = tool({
  description: 'Audit history of configuration changes on a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    since: z.string().optional().describe('ISO-8601 start'),
    until: z.string().optional().describe('ISO-8601 end'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, serviceId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/services/${encodeURIComponent(serviceId)}/audit/records`, {
      query,
    }),
});
