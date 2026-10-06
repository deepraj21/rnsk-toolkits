// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');

export const pagerdutyListRulesets = tool({
  description: 'List legacy event rulesets.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/rulesets'),
});

export const pagerdutyGetRuleset = tool({
  description: 'Get one event ruleset with creator and team info.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/rulesets/${encodeURIComponent(rulesetId)}`),
});

export const pagerdutyCreateRuleset = tool({
  description: 'Create a legacy event ruleset for a team.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Ruleset name'),
    teamId: z.string().optional().describe('Owning team ID'),
  }),
  execute: ({ pagerdutyApiKey, name, teamId }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/rulesets', {
      body: {
        ruleset: {
          type: 'ruleset',
          name,
          ...(teamId ? { team: { id: teamId, type: 'team_reference' } } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateRuleset = tool({
  description: 'Rename a legacy event ruleset.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
    name: z.string().describe('New name'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId, name }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/rulesets/${encodeURIComponent(rulesetId)}`, {
      body: { ruleset: { type: 'ruleset', name } },
    }),
});

export const pagerdutyDeleteRuleset = tool({
  description: 'Delete a legacy event ruleset and its rules.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/rulesets/${encodeURIComponent(rulesetId)}`),
});

export const pagerdutyListRulesetRules = tool({
  description: 'List rules inside a legacy ruleset.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/rulesets/${encodeURIComponent(rulesetId)}/rules`),
});

export const pagerdutyGetRulesetRule = tool({
  description: 'Get one legacy ruleset rule with conditions and actions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/rulesets/${encodeURIComponent(rulesetId)}/rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyCreateRulesetRule = tool({
  description: 'Create a rule in a legacy ruleset with conditions and actions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
    rule: z
      .record(z.any())
      .describe('Full rule object {position, disabled, conditions, actions, ...}'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId, rule }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/rulesets/${encodeURIComponent(rulesetId)}/rules`, {
      body: { rule },
    }),
});

export const pagerdutyUpdateRulesetRule = tool({
  description: 'Update a legacy ruleset rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
    ruleId: z.string().describe('Rule ID'),
    rule: z.record(z.any()).describe('Full replacement rule object'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId, ruleId, rule }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/rulesets/${encodeURIComponent(rulesetId)}/rules/${encodeURIComponent(ruleId)}`,
      { body: { rule } },
    ),
});

export const pagerdutyDeleteRulesetRule = tool({
  description: 'Delete a rule from a legacy ruleset.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    rulesetId: z.string().describe('Ruleset ID'),
    ruleId: z.string().describe('Rule ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, rulesetId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/rulesets/${encodeURIComponent(rulesetId)}/rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyListWorkflows = tool({
  description: 'List incident workflows (automated multi-step responders for incidents).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by workflow name substring'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/incident_workflows', { query }),
});

export const pagerdutyGetWorkflow = tool({
  description: 'Get one incident workflow with its steps.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    workflowId: z.string().describe('Workflow ID'),
  }),
  execute: ({ pagerdutyApiKey, workflowId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incident_workflows/${encodeURIComponent(workflowId)}`),
});

export const pagerdutyCreateWorkflow = tool({
  description: 'Create an incident workflow with steps and team ownership.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Workflow name'),
    description: z.string().optional().describe('What the workflow does'),
    teamId: z.string().optional().describe('Owning team ID'),
    steps: z
      .array(z.record(z.any()))
      .optional()
      .describe('Workflow steps [{name, action_id, inputs}]'),
  }),
  execute: ({ pagerdutyApiKey, name, description, teamId, steps }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/incident_workflows', {
      body: {
        incident_workflow: {
          name,
          ...(description ? { description } : {}),
          ...(teamId ? { team: { id: teamId } } : {}),
          ...(steps ? { steps } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateWorkflow = tool({
  description: 'Update an incident workflow name, steps, or enabled state.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    workflowId: z.string().describe('Workflow ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    enabled: z.boolean().optional().describe('Enable or disable the workflow'),
    steps: z.array(z.record(z.any())).optional().describe('Replacement steps'),
  }),
  execute: ({ pagerdutyApiKey, workflowId, name, description, enabled, steps }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/incident_workflows/${encodeURIComponent(workflowId)}`, {
      body: {
        incident_workflow: {
          ...(name ? { name } : {}),
          ...(description ? { description } : {}),
          ...(enabled !== undefined ? { is_enabled: enabled } : {}),
          ...(steps ? { steps } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteWorkflow = tool({
  description: 'Delete an incident workflow and its triggers.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    workflowId: z.string().describe('Workflow ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, workflowId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/incident_workflows/${encodeURIComponent(workflowId)}`),
});

export const pagerdutyRunWorkflowInstance = tool({
  description: 'Manually start an incident workflow on an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    workflowId: z.string().describe('Workflow ID to run'),
    incidentId: z.string().describe('Incident to run the workflow on'),
  }),
  execute: ({ pagerdutyApiKey, workflowId, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incident_workflows/${encodeURIComponent(workflowId)}/instances`,
      {
        body: {
          incident_workflow_instance: {
            incident: { id: incidentId, type: 'incident_reference' },
          },
        },
      },
    ),
});

export const pagerdutyListWorkflowActions = tool({
  description: 'List reusable workflow actions available as incident workflow steps.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    cursor: z.string().optional().describe('Cursor for next page'),
  }),
  execute: ({ pagerdutyApiKey, limit, cursor }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/incident_workflows/actions', {
      query: { limit, cursor },
    }),
});

export const pagerdutyGetWorkflowAction = tool({
  description: 'Get one reusable workflow action with its inputs.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Workflow action ID'),
  }),
  execute: ({ pagerdutyApiKey, actionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incident_workflows/actions/${encodeURIComponent(actionId)}`,
    ),
});

export const pagerdutyListWorkflowTriggers = tool({
  description: 'List incident workflow triggers, filterable by workflow, service, or incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    workflowId: z.string().optional().describe('Only triggers starting this workflow'),
    serviceId: z.string().optional().describe('Only triggers firing for this service'),
    incidentId: z
      .string()
      .optional()
      .describe('Manual triggers available for this incident service'),
    triggerType: z.string().optional().describe('Filter by type, e.g. "manual", "conditional"'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    cursor: z.string().optional().describe('Cursor for next page'),
  }),
  execute: ({ pagerdutyApiKey, workflowId, serviceId, incidentId, triggerType, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/incident_workflows/triggers', {
      query: {
        ...query,
        workflow_id: workflowId,
        service_id: serviceId,
        incident_id: incidentId,
        trigger_type: triggerType,
      },
    }),
});

export const pagerdutyGetWorkflowTrigger = tool({
  description: 'Get one incident workflow trigger with services and condition.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    triggerId: z.string().describe('Trigger ID'),
  }),
  execute: ({ pagerdutyApiKey, triggerId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incident_workflows/triggers/${encodeURIComponent(triggerId)}`,
    ),
});

export const pagerdutyCreateWorkflowTrigger = tool({
  description:
    'Create a trigger that starts a workflow manually, conditionally, or per incident type.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    workflowId: z.string().describe('Workflow to start'),
    triggerType: z.enum(['manual', 'conditional', 'incident_type']).describe('Trigger kind'),
    services: z.array(z.string()).optional().describe('Service IDs this trigger applies to'),
    allServices: z
      .boolean()
      .optional()
      .describe('Fire for incidents on all services (services must be empty)'),
    condition: z
      .string()
      .optional()
      .describe('PCL condition for conditional triggers, e.g. "incident.priority matches \'P1\'"'),
  }),
  execute: ({ pagerdutyApiKey, workflowId, triggerType, services, allServices, condition }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/incident_workflows/triggers', {
      body: {
        trigger: {
          trigger_type: triggerType,
          workflow: { id: workflowId },
          ...(services ? { services: services.map((id) => ({ id })) } : {}),
          ...(allServices !== undefined ? { is_subscribed_to_all_services: allServices } : {}),
          ...(condition ? { condition } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateWorkflowTrigger = tool({
  description: 'Update a workflow trigger condition, services, or permissions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    triggerId: z.string().describe('Trigger ID'),
    condition: z.string().optional().describe('New PCL condition'),
    services: z.array(z.string()).optional().describe('New service ID list'),
    allServices: z.boolean().optional().describe('Subscribe to all services'),
  }),
  execute: ({ pagerdutyApiKey, triggerId, condition, services, allServices }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incident_workflows/triggers/${encodeURIComponent(triggerId)}`,
      {
        body: {
          trigger: {
            ...(condition ? { condition } : {}),
            ...(services ? { services: services.map((id) => ({ id })) } : {}),
            ...(allServices !== undefined ? { is_subscribed_to_all_services: allServices } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteWorkflowTrigger = tool({
  description: 'Delete an incident workflow trigger.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    triggerId: z.string().describe('Trigger ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, triggerId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/incident_workflows/triggers/${encodeURIComponent(triggerId)}`,
    ),
});

export const pagerdutyAddServiceToWorkflowTrigger = tool({
  description: 'Subscribe one more service to an existing workflow trigger.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    triggerId: z.string().describe('Trigger ID'),
    serviceId: z.string().describe('Service ID to add'),
  }),
  execute: ({ pagerdutyApiKey, triggerId, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incident_workflows/triggers/${encodeURIComponent(triggerId)}/services`,
      { body: { service: { id: serviceId } } },
    ),
});

export const pagerdutyRemoveServiceFromWorkflowTrigger = tool({
  description: 'Remove a service from a workflow trigger.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    triggerId: z.string().describe('Trigger ID'),
    serviceId: z.string().describe('Service ID to remove'),
  }),
  execute: ({ pagerdutyApiKey, triggerId, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/incident_workflows/triggers/${encodeURIComponent(triggerId)}/services/${encodeURIComponent(serviceId)}`,
    ),
});
