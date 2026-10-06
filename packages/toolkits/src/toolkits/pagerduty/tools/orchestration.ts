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

export const pagerdutyListEventOrchestrations = tool({
  description: 'List global event orchestrations that route events to services.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/event_orchestrations', { query }),
});

export const pagerdutyGetEventOrchestration = tool({
  description: 'Get one event orchestration with routes and integrations summary.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}`,
    ),
});

export const pagerdutyCreateEventOrchestration = tool({
  description: 'Create a global event orchestration for cross-service event routing.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Orchestration name'),
    description: z.string().optional().describe('Purpose of this orchestration'),
    teamId: z.string().optional().describe('Owning team ID'),
  }),
  execute: ({ pagerdutyApiKey, name, description, teamId }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/event_orchestrations', {
      body: {
        orchestration: {
          name,
          ...(description ? { description } : {}),
          ...(teamId ? { team: { id: teamId, type: 'team_reference' } } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateEventOrchestration = tool({
  description: 'Rename or update an event orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, name, description }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}`,
      {
        body: {
          orchestration: {
            ...(name ? { name } : {}),
            ...(description ? { description } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteEventOrchestration = tool({
  description: 'Delete a global event orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}`,
    ),
});

export const pagerdutyGetOrchestrationRouter = tool({
  description: 'Get the router (ordered route rules) of an event orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/router`,
    ),
});

export const pagerdutyUpdateOrchestrationRouter = tool({
  description: 'Replace the router rules that decide which service receives an event.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    router: z
      .record(z.any())
      .describe(
        'Full router object {sets:[{id,rules:[{id,label,disabled,conditions,actions}]}], catch_all}',
      ),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, router }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/router`,
      { body: router },
    ),
});

export const pagerdutyGetOrchestrationGlobal = tool({
  description: 'Get the global ruleset applied to all events in an orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/global`,
    ),
});

export const pagerdutyUpdateOrchestrationGlobal = tool({
  description: 'Replace the global ruleset of an orchestration (normalization, suppression).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    global: z.record(z.any()).describe('Full global ruleset object'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, global }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/global`,
      { body: global },
    ),
});

export const pagerdutyGetOrchestrationUnrouted = tool({
  description: 'Get the unrouted-catch-all rules for an orchestration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/unrouted`,
    ),
});

export const pagerdutyUpdateOrchestrationUnrouted = tool({
  description: 'Replace the unrouted rules handling events that match nothing.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    unrouted: z.record(z.any()).describe('Full unrouted rules object'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, unrouted }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/unrouted`,
      { body: unrouted },
    ),
});

export const pagerdutyListOrchestrationIntegrations = tool({
  description: 'List integrations feeding an event orchestration (with routing keys).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/integrations`,
    ),
});

export const pagerdutyCreateOrchestrationIntegration = tool({
  description: 'Create an integration key on an orchestration for event ingestion.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    label: z.string().describe('Integration label shown in the UI'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, label }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/integrations`,
      { body: { integration: { label } } },
    ),
});

export const pagerdutyGetOrchestrationIntegration = tool({
  description: 'Get one orchestration integration with its routing key.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    integrationId: z.string().describe('Integration ID'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, integrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/integrations/${encodeURIComponent(integrationId)}`,
    ),
});

export const pagerdutyUpdateOrchestrationIntegration = tool({
  description: 'Rename an orchestration integration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    integrationId: z.string().describe('Integration ID'),
    label: z.string().describe('New label'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, integrationId, label }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/integrations/${encodeURIComponent(integrationId)}`,
      { body: { integration: { label } } },
    ),
});

export const pagerdutyDeleteOrchestrationIntegration = tool({
  description: 'Delete an orchestration integration. Events sent to its key will be rejected.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    orchestrationId: z.string().describe('Orchestration ID'),
    integrationId: z.string().describe('Integration ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, orchestrationId, integrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/event_orchestrations/${encodeURIComponent(orchestrationId)}/integrations/${encodeURIComponent(integrationId)}`,
    ),
});

export const pagerdutyMigrateOrchestrationIntegration = tool({
  description: 'Move an integration (and its key) from one orchestration to another.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    targetOrchestrationId: z.string().describe('Orchestration receiving the integration'),
    sourceOrchestrationId: z.string().describe('Orchestration currently holding the integration'),
    integrationId: z.string().describe('Integration ID to move'),
  }),
  execute: ({ pagerdutyApiKey, targetOrchestrationId, sourceOrchestrationId, integrationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/event_orchestrations/${encodeURIComponent(targetOrchestrationId)}/integrations/migration`,
      {
        body: {
          source_id: sourceOrchestrationId,
          source_type: 'orchestration',
          integration_id: integrationId,
        },
      },
    ),
});

export const pagerdutyGetServiceOrchestration = tool({
  description: 'Get the service-level orchestration (rules applied after routing) for a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}`,
    ),
});

export const pagerdutyUpdateServiceOrchestration = tool({
  description: 'Replace the service-level orchestration rules for a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    orchestration: z.record(z.any()).describe('Full service orchestration object'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, orchestration }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}`,
      { body: orchestration },
    ),
});

export const pagerdutyGetServiceOrchestrationActive = tool({
  description: 'Show which orchestration version (rules vs orchestration) is active for a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
  }),
  execute: ({ pagerdutyApiKey, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/active`,
    ),
});

export const pagerdutySetServiceOrchestrationActive = tool({
  description: 'Switch a service between legacy event rules and the newer orchestration engine.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    serviceId: z.string().describe('Service ID'),
    active: z.boolean().describe('True to use orchestration, false for legacy rules'),
  }),
  execute: ({ pagerdutyApiKey, serviceId, active }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/event_orchestrations/services/${encodeURIComponent(serviceId)}/active`,
      { body: { active } },
    ),
});
