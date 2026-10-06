// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');

const metricsFilters = {
  timeZone: z.string().optional().describe('tzdata zone for grouping, e.g. "UTC"'),
  aggregateUnit: z
    .enum(['day', 'week', 'month'])
    .optional()
    .describe('Bucket metrics by day, week, or month'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
  orderBy: z.string().optional().describe('Column to sort by'),
  createdAtStart: z.string().optional().describe('ISO-8601 range start (max 1-year span with end)'),
  createdAtEnd: z.string().optional().describe('ISO-8601 range end'),
  teamIds: z.array(z.string()).optional().describe('Restrict to these teams'),
  serviceIds: z.array(z.string()).optional().describe('Restrict to these services'),
  escalationPolicyIds: z.array(z.string()).optional().describe('Restrict to these policies'),
  priorityIds: z.array(z.string()).optional().describe('Restrict to these priorities'),
  priorityNames: z.array(z.string()).optional().describe('Restrict to these priority names'),
  urgency: z.enum(['high', 'low']).optional().describe('Restrict by urgency'),
  major: z.boolean().optional().describe('True for only major incidents, false to exclude them'),
};

function metricsBody(input: Record<string, unknown>) {
  const {
    timeZone,
    aggregateUnit,
    order,
    orderBy,
    createdAtStart,
    createdAtEnd,
    teamIds,
    serviceIds,
    escalationPolicyIds,
    priorityIds,
    priorityNames,
    urgency,
    major,
    ...rest
  } = input;
  const filters: Record<string, unknown> = {
    ...(createdAtStart ? { created_at_start: createdAtStart } : {}),
    ...(createdAtEnd ? { created_at_end: createdAtEnd } : {}),
    ...(teamIds ? { team_ids: teamIds } : {}),
    ...(serviceIds ? { service_ids: serviceIds } : {}),
    ...(escalationPolicyIds ? { escalation_policy_ids: escalationPolicyIds } : {}),
    ...(priorityIds ? { priority_ids: priorityIds } : {}),
    ...(priorityNames ? { priority_names: priorityNames } : {}),
    ...(urgency ? { urgency } : {}),
    ...(major !== undefined ? { major } : {}),
  };
  return {
    ...(timeZone ? { time_zone: timeZone } : {}),
    ...(aggregateUnit ? { aggregate_unit: aggregateUnit } : {}),
    ...(order ? { order } : {}),
    ...(orderBy ? { order_by: orderBy } : {}),
    ...(Object.keys(filters).length ? { filters } : {}),
    ...rest,
  };
}

export const pagerdutyGetIncidentMetricsAll = tool({
  description:
    'Aggregate MTTA/MTTR, counts, and escalation stats across all incidents with filters. Use for operational reviews.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/incidents/all', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetIncidentMetricsByService = tool({
  description: 'Incident metrics broken down per service for reliability comparisons.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/incidents/services/all', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetIncidentMetricsByTeam = tool({
  description: 'Incident metrics broken down per team for ownership reviews.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/incidents/teams/all', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetIncidentMetricsByEscalationPolicy = tool({
  description:
    'Incident metrics broken down per escalation policy for escalation-effectiveness analysis.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/incidents/escalation_policies/all', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetResponderMetrics = tool({
  description: 'Responder engagement metrics (who responded, how long engaged) across incidents.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/responders/all', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetResponderMetricsByTeam = tool({
  description: 'Responder metrics broken down per team.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/responders/teams', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetUserMetrics = tool({
  description:
    'Per-user analytics: interruptions, engaged time, and off-hours load for burnout review.',
  inputSchema: z.object({ pagerdutyApiKey: keyField, ...metricsFilters }),
  execute: ({ pagerdutyApiKey, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/metrics/users/all', {
      body: metricsBody(filters),
    }),
});

export const pagerdutyGetRawIncidents = tool({
  description:
    'Raw per-incident analytics rows (engaged seconds, ack counts, escalations) for custom reporting.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...metricsFilters,
    limit: z.number().int().min(1).max(100).optional().describe('Rows per page'),
    cursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ pagerdutyApiKey, limit, cursor, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/raw/incidents', {
      body: { ...metricsBody(filters), ...(limit ? { limit } : {}), ...(cursor ? { cursor } : {}) },
    }),
});

export const pagerdutyGetRawIncidentResponses = tool({
  description: 'Raw responder-engagement rows for one incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/analytics/raw/incidents/${encodeURIComponent(incidentId)}/responses`,
    ),
});

export const pagerdutyGetRawUsers = tool({
  description: 'Raw per-user analytics rows for custom on-call load reporting.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    ...metricsFilters,
    limit: z.number().int().min(1).max(100).optional().describe('Rows per page'),
    cursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ pagerdutyApiKey, limit, cursor, ...filters }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/analytics/raw/users', {
      body: { ...metricsBody(filters), ...(limit ? { limit } : {}), ...(cursor ? { cursor } : {}) },
    }),
});

export const pagerdutyGetPausedIncidentAlerts = tool({
  description: 'Alerts suppressed by auto-pause notification rules, for review.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    cursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: ({ pagerdutyApiKey, limit, cursor }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/paused_incident_reports/alerts', {
      query: { limit, cursor },
    }),
});

export const pagerdutyGetPausedIncidentCounts = tool({
  description: 'Counts of auto-paused incidents for suppression auditing.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/paused_incident_reports/counts'),
});
