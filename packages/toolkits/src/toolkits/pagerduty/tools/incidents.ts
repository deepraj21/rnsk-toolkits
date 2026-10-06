// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');
const fromField = z
  .string()
  .optional()
  .describe('Acting user email for the From header (required by some write endpoints)');
const pageFields = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Results per page (1-100, default 25)'),
  offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
  total: z.boolean().optional().describe('Set true to populate the total count (slower)'),
};

export const pagerdutyListIncidents = tool({
  description:
    'List incidents with filters for status, urgency, service, team, assignee, and date range. Start here for incident triage and queue overviews.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    statuses: z
      .array(z.enum(['triggered', 'acknowledged', 'resolved']))
      .optional()
      .describe('Filter by status (default triggered+acknowledged)'),
    urgencies: z
      .array(z.enum(['high', 'low']))
      .optional()
      .describe('Filter by urgency'),
    serviceIds: z.array(z.string()).optional().describe('Only incidents on these services'),
    teamIds: z.array(z.string()).optional().describe('Only incidents for these teams'),
    userIds: z.array(z.string()).optional().describe('Only incidents assigned to these users'),
    escalationPolicyIds: z
      .array(z.string())
      .optional()
      .describe('Only incidents under these policies'),
    since: z.string().optional().describe('ISO-8601 start of created-at range'),
    until: z.string().optional().describe('ISO-8601 end of created-at range'),
    dateRange: z.enum(['all']).optional().describe('Set "all" to ignore since/until'),
    incidentKey: z.string().optional().describe('Filter by de-duplication incident key'),
    include: z
      .array(z.string())
      .optional()
      .describe(
        'Embed: users, services, teams, priorities, escalation_policies, assignees, acknowledgers, first_trigger_log_entries',
      ),
    sortBy: z
      .array(z.string())
      .optional()
      .describe(
        'Sort, e.g. ["created_at:desc"]. Fields: incident_number, created_at, resolved_at, urgency',
      ),
    ...pageFields,
  }),
  execute: ({
    pagerdutyApiKey,
    serviceIds,
    teamIds,
    userIds,
    escalationPolicyIds,
    sortBy,
    ...rest
  }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/incidents', {
      query: {
        ...rest,
        service_ids: serviceIds,
        team_ids: teamIds,
        user_ids: userIds,
        escalation_policy_ids: escalationPolicyIds,
        sort_by: sortBy,
      },
    }),
});

export const pagerdutyGetIncident = tool({
  description: 'Get full details of one incident by ID, with optional embedded relations.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID, e.g. "PT4KHLK"'),
    include: z
      .array(z.string())
      .optional()
      .describe(
        'Embed: users, services, teams, priorities, escalation_policies, assignees, acknowledgers, first_trigger_log_entries, custom_fields',
      ),
  }),
  execute: ({ pagerdutyApiKey, incidentId, include }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incidents/${encodeURIComponent(incidentId)}`, {
      query: { include },
    }),
});

export const pagerdutyCreateIncident = tool({
  description:
    'Trigger a new incident on a service. Requires the acting user email (From header) and a service ID.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: z
      .string()
      .describe('Email of a valid account user creating the incident (From header)'),
    title: z.string().describe('Short title, e.g. "Production DB CPU at 95%"'),
    serviceId: z.string().describe('Service to open the incident on'),
    urgency: z.enum(['high', 'low']).optional().describe('Notification urgency'),
    details: z.string().optional().describe('Full incident body/details text'),
    incidentKey: z
      .string()
      .optional()
      .describe('De-duplication key; repeats update the same incident'),
    priorityId: z.string().optional().describe('Priority ID (see pagerdutyListPriorities)'),
    escalationPolicyId: z.string().optional().describe('Override the service escalation policy'),
    assigneeIds: z.array(z.string()).optional().describe('User IDs to assign immediately'),
    incidentTypeName: z.string().optional().describe('Incident type name, e.g. "major_incident"'),
    conferenceUrl: z.string().optional().describe('Bridge URL (Slack channel, Zoom link)'),
    conferenceNumber: z
      .string()
      .optional()
      .describe('Bridge phone, e.g. "+1 415-555-1212,,,,1234#"'),
  }),
  execute: ({
    pagerdutyApiKey,
    fromEmail,
    title,
    serviceId,
    urgency,
    details,
    incidentKey,
    priorityId,
    escalationPolicyId,
    assigneeIds,
    incidentTypeName,
    conferenceUrl,
    conferenceNumber,
  }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/incidents', {
      fromEmail,
      body: {
        incident: {
          type: 'incident',
          title,
          service: { id: serviceId, type: 'service_reference' },
          ...(urgency ? { urgency } : {}),
          ...(details ? { body: { type: 'incident_body', details } } : {}),
          ...(incidentKey ? { incident_key: incidentKey } : {}),
          ...(priorityId ? { priority: { id: priorityId, type: 'priority_reference' } } : {}),
          ...(escalationPolicyId
            ? { escalation_policy: { id: escalationPolicyId, type: 'escalation_policy_reference' } }
            : {}),
          ...(assigneeIds
            ? {
                assignments: assigneeIds.map((id) => ({
                  assignee: { id, type: 'user_reference' },
                })),
              }
            : {}),
          ...(incidentTypeName ? { incident_type: { name: incidentTypeName } } : {}),
          ...(conferenceUrl || conferenceNumber
            ? {
                conference_bridge: {
                  ...(conferenceNumber ? { conference_number: conferenceNumber } : {}),
                  ...(conferenceUrl ? { conference_url: conferenceUrl } : {}),
                },
              }
            : {}),
        },
      },
    }),
});

export const pagerdutyUpdateIncident = tool({
  description:
    'Acknowledge, resolve, reassign, escalate, or retitle an incident. Resolving accepts an optional resolution note.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID to update'),
    status: z
      .enum(['triggered', 'acknowledged', 'resolved'])
      .optional()
      .describe('New status (resolved closes; triggered/acknowledged reopens)'),
    title: z.string().optional().describe('New title'),
    urgency: z.enum(['high', 'low']).optional().describe('New urgency'),
    resolution: z.string().optional().describe('Resolution note (with status resolved)'),
    assigneeIds: z.array(z.string()).optional().describe('Reassign to these user IDs'),
    escalationLevel: z.number().int().optional().describe('Escalate to this policy level'),
    priorityId: z.string().optional().describe('New priority ID'),
    conferenceUrl: z.string().optional().describe('New bridge URL'),
    conferenceNumber: z.string().optional().describe('New bridge phone number'),
  }),
  execute: ({
    pagerdutyApiKey,
    fromEmail,
    incidentId,
    status,
    title,
    urgency,
    resolution,
    assigneeIds,
    escalationLevel,
    priorityId,
    conferenceUrl,
    conferenceNumber,
  }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/incidents/${encodeURIComponent(incidentId)}`, {
      fromEmail,
      body: {
        incident: {
          type: 'incident_reference',
          ...(status ? { status } : {}),
          ...(title ? { title } : {}),
          ...(urgency ? { urgency } : {}),
          ...(resolution ? { resolution } : {}),
          ...(assigneeIds
            ? {
                assignments: assigneeIds.map((id) => ({
                  assignee: { id, type: 'user_reference' },
                })),
              }
            : {}),
          ...(escalationLevel !== undefined ? { escalation_level: escalationLevel } : {}),
          ...(priorityId ? { priority: { id: priorityId, type: 'priority_reference' } } : {}),
          ...(conferenceUrl || conferenceNumber
            ? {
                conference_bridge: {
                  ...(conferenceNumber ? { conference_number: conferenceNumber } : {}),
                  ...(conferenceUrl ? { conference_url: conferenceUrl } : {}),
                },
              }
            : {}),
        },
      },
    }),
});

export const pagerdutyMergeIncidents = tool({
  description:
    'Merge source incidents into a target incident; sources are resolved. Use for duplicate/alert-storm cleanup.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    targetIncidentId: z.string().describe('Incident that survives the merge'),
    sourceIncidentIds: z
      .array(z.string())
      .min(1)
      .describe('Incidents to fold in (will be resolved)'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, targetIncidentId, sourceIncidentIds }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/incidents/${encodeURIComponent(targetIncidentId)}/merge`, {
      fromEmail,
      body: {
        source_incidents: sourceIncidentIds.map((id) => ({ id, type: 'incident_reference' })),
      },
    }),
});

export const pagerdutySnoozeIncident = tool({
  description:
    'Snooze a triggered incident for a duration; it returns to triggered when the timer elapses.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID to snooze'),
    durationSeconds: z
      .number()
      .int()
      .min(1)
      .max(604800)
      .describe('Snooze duration in seconds (max 7 days)'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, durationSeconds }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/incidents/${encodeURIComponent(incidentId)}/snooze`, {
      fromEmail,
      body: { duration: durationSeconds },
    }),
});

export const pagerdutyGetIncidentOutlier = tool({
  description:
    'Get the outlier incident most similar to this one, useful for finding related past work.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/outlier_incident`,
    ),
});

export const pagerdutyGetPastIncidents = tool({
  description: 'List past incidents on the same service, useful for recurrence and context checks.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Reference incident ID (uses its service)'),
    limit: z.number().int().min(1).max(100).optional().describe('Max past incidents (default 5)'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, limit }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/past_incidents`,
      {
        query: { limit },
      },
    ),
});

export const pagerdutyGetRelatedIncidents = tool({
  description: 'List incidents related to this one via alert grouping or recent-merge links.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/related_incidents`,
    ),
});

export const pagerdutyGetRelatedChangeEvents = tool({
  description:
    'List recent change events (deploys, config changes) related to an incident for blast-radius analysis.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/related_change_events`,
    ),
});

export const pagerdutyGetIncidentBusinessImpacts = tool({
  description: 'Show which business services an incident is impacting.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/business_services/impacts`,
    ),
});

export const pagerdutySetIncidentBusinessImpact = tool({
  description:
    'Mark a business service as impacted (or not) by an incident for status-page accuracy.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    businessServiceId: z.string().describe('Business service ID'),
    relation: z.enum(['impacted', 'not_impacted']).describe('Impact relation to set'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, businessServiceId, relation }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incidents/${encodeURIComponent(incidentId)}/business_services/${encodeURIComponent(businessServiceId)}/impacts`,
      { body: { relation } },
    ),
});
