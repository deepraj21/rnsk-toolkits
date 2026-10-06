// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');
const fromField = z.string().optional().describe('Acting user email for the From header');
const pageFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Pagination offset'),
  total: z.boolean().optional().describe('Populate the total count (slower)'),
};

export const pagerdutyListAutomationActions = tool({
  description: 'List automation actions (runbook/script jobs) available for incidents.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/automation_actions/actions', { query }),
});

export const pagerdutyGetAutomationAction = tool({
  description: 'Get one automation action with its script/job configuration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
  }),
  execute: ({ pagerdutyApiKey, actionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/automation_actions/actions/${encodeURIComponent(actionId)}`,
    ),
});

export const pagerdutyCreateAutomationAction = tool({
  description:
    'Create an automation action (script or process-automation job) for incident response.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    action: z
      .record(z.any())
      .describe(
        'Action object with action_type "script" or "process_automation" plus name, runner, script, etc.',
      ),
  }),
  execute: ({ pagerdutyApiKey, action }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/automation_actions/actions', {
      body: { action },
    }),
});

export const pagerdutyUpdateAutomationAction = tool({
  description: 'Update an automation action configuration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
    action: z.record(z.any()).describe('Replacement action object'),
  }),
  execute: ({ pagerdutyApiKey, actionId, action }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/automation_actions/actions/${encodeURIComponent(actionId)}`,
      {
        body: { action },
      },
    ),
});

export const pagerdutyDeleteAutomationAction = tool({
  description: 'Delete an automation action.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, actionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/automation_actions/actions/${encodeURIComponent(actionId)}`,
    ),
});

export const pagerdutyInvokeAutomationAction = tool({
  description: 'Run an automation action against an incident (optionally a specific alert).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    actionId: z.string().describe('Automation action ID to invoke'),
    incidentId: z.string().describe('Incident to act on'),
    alertId: z.string().optional().describe('Specific alert to act on'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, actionId, incidentId, alertId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/invocations`,
      {
        fromEmail,
        body: {
          invocation: {
            metadata: {
              incident_id: incidentId,
              ...(alertId ? { alert_id: alertId } : {}),
            },
          },
        },
      },
    ),
});

export const pagerdutyListAutomationInvocations = tool({
  description: 'List automation action invocations with status, filterable by action or incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().optional().describe('Only invocations of this action'),
    incidentId: z.string().optional().describe('Only invocations on this incident'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, actionId, incidentId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/automation_actions/invocations', {
      query: { ...query, action_id: actionId, incident_id: incidentId },
    }),
});

export const pagerdutyGetAutomationInvocation = tool({
  description: 'Get one automation invocation with execution output and status.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    invocationId: z.string().describe('Invocation ID'),
  }),
  execute: ({ pagerdutyApiKey, invocationId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/automation_actions/invocations/${encodeURIComponent(invocationId)}`,
    ),
});

export const pagerdutyListActionServices = tool({
  description: 'List services an automation action is associated with.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
  }),
  execute: ({ pagerdutyApiKey, actionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/services`,
    ),
});

export const pagerdutyAssociateActionService = tool({
  description: 'Allow an automation action to run on incidents of a service.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
    serviceId: z.string().describe('Service ID to associate'),
  }),
  execute: ({ pagerdutyApiKey, actionId, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/services`,
      { body: { service: { id: serviceId, type: 'service_reference' } } },
    ),
});

export const pagerdutyRemoveActionService = tool({
  description: 'Remove a service association from an automation action.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
    serviceId: z.string().describe('Service ID to remove'),
  }),
  execute: ({ pagerdutyApiKey, actionId, serviceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/services/${encodeURIComponent(serviceId)}`,
    ),
});

export const pagerdutyListActionTeams = tool({
  description: 'List teams allowed to use an automation action.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
  }),
  execute: ({ pagerdutyApiKey, actionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/teams`,
    ),
});

export const pagerdutyAssociateActionTeam = tool({
  description: 'Grant a team permission to use an automation action.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
    teamId: z.string().describe('Team ID to associate'),
  }),
  execute: ({ pagerdutyApiKey, actionId, teamId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/teams`,
      { body: { team: { id: teamId, type: 'team_reference' } } },
    ),
});

export const pagerdutyRemoveActionTeam = tool({
  description: 'Revoke a team permission to use an automation action.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    actionId: z.string().describe('Automation action ID'),
    teamId: z.string().describe('Team ID to remove'),
  }),
  execute: ({ pagerdutyApiKey, actionId, teamId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/automation_actions/actions/${encodeURIComponent(actionId)}/teams/${encodeURIComponent(teamId)}`,
    ),
});

export const pagerdutyListAutomationRunners = tool({
  description: 'List automation runners (execution hosts: sidecar or runbook).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/automation_actions/runners', { query }),
});

export const pagerdutyGetAutomationRunner = tool({
  description: 'Get one automation runner with status and type.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runnerId: z.string().describe('Runner ID'),
  }),
  execute: ({ pagerdutyApiKey, runnerId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/automation_actions/runners/${encodeURIComponent(runnerId)}`,
    ),
});

export const pagerdutyCreateAutomationRunner = tool({
  description: 'Register an automation runner (sidecar agent or runbook host).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runner: z.record(z.any()).describe('Runner object with runner_type plus name and config'),
  }),
  execute: ({ pagerdutyApiKey, runner }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/automation_actions/runners', {
      body: { runner },
    }),
});

export const pagerdutyUpdateAutomationRunner = tool({
  description: 'Update an automation runner name or configuration.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runnerId: z.string().describe('Runner ID'),
    runner: z.record(z.any()).describe('Replacement runner object'),
  }),
  execute: ({ pagerdutyApiKey, runnerId, runner }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/automation_actions/runners/${encodeURIComponent(runnerId)}`,
      { body: { runner } },
    ),
});

export const pagerdutyDeleteAutomationRunner = tool({
  description: 'Delete an automation runner.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runnerId: z.string().describe('Runner ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, runnerId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/automation_actions/runners/${encodeURIComponent(runnerId)}`,
    ),
});

export const pagerdutyListRunnerTeams = tool({
  description: 'List teams associated with an automation runner.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runnerId: z.string().describe('Runner ID'),
  }),
  execute: ({ pagerdutyApiKey, runnerId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/automation_actions/runners/${encodeURIComponent(runnerId)}/teams`,
    ),
});

export const pagerdutyAssociateRunnerTeam = tool({
  description: 'Associate a team with an automation runner.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runnerId: z.string().describe('Runner ID'),
    teamId: z.string().describe('Team ID to associate'),
  }),
  execute: ({ pagerdutyApiKey, runnerId, teamId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/automation_actions/runners/${encodeURIComponent(runnerId)}/teams`,
      { body: { team: { id: teamId, type: 'team_reference' } } },
    ),
});

export const pagerdutyRemoveRunnerTeam = tool({
  description: 'Remove a team association from an automation runner.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    runnerId: z.string().describe('Runner ID'),
    teamId: z.string().describe('Team ID to remove'),
  }),
  execute: ({ pagerdutyApiKey, runnerId, teamId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/automation_actions/runners/${encodeURIComponent(runnerId)}/teams/${encodeURIComponent(teamId)}`,
    ),
});
