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

export const pagerdutyListEscalationPolicies = tool({
  description: 'List escalation policies with optional team and name filters.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by policy name substring'),
    teamIds: z.array(z.string()).optional().describe('Only policies owned by these teams'),
    include: z.array(z.string()).optional().describe('Embed: services, teams, targets'),
    sortBy: z.string().optional().describe('Sort field, e.g. "name"'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamIds, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/escalation_policies', {
      query: { ...query, team_ids: teamIds },
    }),
});

export const pagerdutyGetEscalationPolicy = tool({
  description: 'Get one escalation policy with its rules, targets, and services.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    policyId: z.string().describe('Escalation policy ID'),
    include: z.array(z.string()).optional().describe('Embed: services, teams, targets'),
  }),
  execute: ({ pagerdutyApiKey, policyId, include }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/escalation_policies/${encodeURIComponent(policyId)}`, {
      query: { include },
    }),
});

export const pagerdutyCreateEscalationPolicy = tool({
  description:
    'Create an escalation policy: ordered rules of users/schedules with delays and loop count.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Policy name'),
    rules: z
      .array(
        z.object({
          delayMinutes: z
            .number()
            .int()
            .min(0)
            .describe('Minutes before escalating to the next rule'),
          targets: z
            .array(z.object({ id: z.string(), type: z.string() }).passthrough())
            .min(1)
            .describe('Targets [{id, type: user_reference|schedule_reference}]'),
        }),
      )
      .min(1)
      .describe('Ordered escalation rules'),
    description: z.string().optional().describe('Policy description'),
    numLoops: z
      .number()
      .int()
      .min(0)
      .max(5)
      .optional()
      .describe('Repeat count after last rule (0-5)'),
    teamIds: z.array(z.string()).optional().describe('Owning team IDs'),
  }),
  execute: ({ pagerdutyApiKey, name, rules, description, numLoops, teamIds }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/escalation_policies', {
      body: {
        escalation_policy: {
          type: 'escalation_policy',
          name,
          escalation_rules: rules.map((r) => ({
            escalation_delay_in_minutes: r.delayMinutes,
            targets: r.targets.map((t) => ({ id: t.id, type: t.type })),
          })),
          ...(description ? { description } : {}),
          ...(numLoops !== undefined ? { num_loops: numLoops } : {}),
          ...(teamIds ? { teams: teamIds.map((id) => ({ id, type: 'team_reference' })) } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateEscalationPolicy = tool({
  description: 'Update an escalation policy name, rules, targets, or loop count.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    policyId: z.string().describe('Escalation policy ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    numLoops: z.number().int().min(0).max(5).optional().describe('New loop count'),
    rules: z
      .array(
        z
          .object({ delayMinutes: z.number().int().min(0), targets: z.array(z.record(z.any())) })
          .passthrough(),
      )
      .optional()
      .describe('Replacement rules [{delayMinutes, targets:[{id,type}]}]'),
  }),
  execute: ({ pagerdutyApiKey, policyId, name, description, numLoops, rules }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/escalation_policies/${encodeURIComponent(policyId)}`, {
      body: {
        escalation_policy: {
          type: 'escalation_policy',
          ...(name ? { name } : {}),
          ...(description ? { description } : {}),
          ...(numLoops !== undefined ? { num_loops: numLoops } : {}),
          ...(rules
            ? {
                escalation_rules: rules.map((r: any) => ({
                  escalation_delay_in_minutes: r.delayMinutes ?? r.escalation_delay_in_minutes,
                  targets: r.targets,
                })),
              }
            : {}),
        },
      },
    }),
});

export const pagerdutyDeleteEscalationPolicy = tool({
  description: 'Delete an escalation policy. Services using it must be reassigned first.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    policyId: z.string().describe('Escalation policy ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, policyId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/escalation_policies/${encodeURIComponent(policyId)}`),
});

export const pagerdutyGetEscalationPolicyAudit = tool({
  description: 'Audit history of changes to an escalation policy.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    policyId: z.string().describe('Escalation policy ID'),
    since: z.string().optional().describe('ISO-8601 start'),
    until: z.string().optional().describe('ISO-8601 end'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, policyId, ...query }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/escalation_policies/${encodeURIComponent(policyId)}/audit/records`,
      { query },
    ),
});

export const pagerdutyListTeams = tool({
  description: 'List account teams with optional name filter.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by team name substring'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/teams', { query }),
});

export const pagerdutyGetTeam = tool({
  description: 'Get one team with its roles and contact details.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
  }),
  execute: ({ pagerdutyApiKey, teamId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/teams/${encodeURIComponent(teamId)}`),
});

export const pagerdutyCreateTeam = tool({
  description: 'Create a team with a name, description, and default roles.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Team name'),
    description: z.string().optional().describe('Team purpose/responsibilities'),
  }),
  execute: ({ pagerdutyApiKey, name, description }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/teams', {
      body: {
        team: {
          type: 'team',
          name,
          ...(description ? { description } : {}),
          default_roles: [
            { type: 'team_role', name: 'Observer' },
            { type: 'team_role', name: 'Responder' },
          ],
        },
      },
    }),
});

export const pagerdutyUpdateTeam = tool({
  description: 'Rename or update a team description.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
  }),
  execute: ({ pagerdutyApiKey, teamId, name, description }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/teams/${encodeURIComponent(teamId)}`, {
      body: {
        team: { type: 'team', ...(name ? { name } : {}), ...(description ? { description } : {}) },
      },
    }),
});

export const pagerdutyDeleteTeam = tool({
  description: 'Delete a team. Members and services are unlinked, not deleted.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, teamId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/teams/${encodeURIComponent(teamId)}`),
});

export const pagerdutyListTeamMembers = tool({
  description: 'List users belonging to a team with their roles.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/teams/${encodeURIComponent(teamId)}/members`, { query }),
});

export const pagerdutyAddUserToTeam = tool({
  description: 'Add a user to a team with a responder-role assignment.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    userId: z.string().describe('User ID to add'),
    role: z
      .enum(['observer', 'responder', 'manager'])
      .optional()
      .describe('Team role (default responder)'),
  }),
  execute: ({ pagerdutyApiKey, teamId, userId, role }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/teams/${encodeURIComponent(teamId)}/users/${encodeURIComponent(userId)}`,
      { body: { role: role ?? 'responder' } },
    ),
});

export const pagerdutyRemoveUserFromTeam = tool({
  description: 'Remove a user from a team.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    userId: z.string().describe('User ID to remove'),
  }),
  execute: ({ pagerdutyApiKey, teamId, userId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/teams/${encodeURIComponent(teamId)}/users/${encodeURIComponent(userId)}`,
    ),
});

export const pagerdutyAddEscalationPolicyToTeam = tool({
  description: 'Associate an escalation policy with a team.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    policyId: z.string().describe('Escalation policy ID to associate'),
  }),
  execute: ({ pagerdutyApiKey, teamId, policyId }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/teams/${encodeURIComponent(teamId)}/escalation_policies/${encodeURIComponent(policyId)}`,
    ),
});

export const pagerdutyRemoveEscalationPolicyFromTeam = tool({
  description: 'Disassociate an escalation policy from a team.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    policyId: z.string().describe('Escalation policy ID to remove'),
  }),
  execute: ({ pagerdutyApiKey, teamId, policyId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/teams/${encodeURIComponent(teamId)}/escalation_policies/${encodeURIComponent(policyId)}`,
    ),
});

export const pagerdutyListTeamNotificationSubscriptions = tool({
  description: 'List what a team is subscribed to (services/incidents) for notifications.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamId, ...query }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/teams/${encodeURIComponent(teamId)}/notification_subscriptions`,
      { query },
    ),
});

export const pagerdutyCreateTeamNotificationSubscription = tool({
  description: 'Subscribe a team to notifications for a service or incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    subscribableId: z.string().describe('Service or incident ID to subscribe to'),
    subscribableType: z.enum(['service', 'incident']).describe('What is being subscribed to'),
  }),
  execute: ({ pagerdutyApiKey, teamId, subscribableId, subscribableType }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/teams/${encodeURIComponent(teamId)}/notification_subscriptions`,
      {
        body: {
          subscribable: {
            id: subscribableId,
            type: subscribableType === 'service' ? 'service_reference' : 'incident_reference',
          },
        },
      },
    ),
});

export const pagerdutyUnsubscribeTeamNotifications = tool({
  description: 'Unsubscribe a team from one or more notification subscriptions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamId: z.string().describe('Team ID'),
    subscribables: z
      .array(z.object({ id: z.string(), type: z.string() }).passthrough())
      .min(1)
      .describe('Subscriptions to remove [{id, type}]'),
  }),
  execute: ({ pagerdutyApiKey, teamId, subscribables }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/teams/${encodeURIComponent(teamId)}/notification_subscriptions/unsubscribe`,
      { body: { subscribables } },
    ),
});
