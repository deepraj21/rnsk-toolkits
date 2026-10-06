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

export const pagerdutyListSchedules = tool({
  description: 'List on-call schedules with optional name and time-zone handling.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by schedule name substring'),
    timeZone: z.string().optional().describe('Render in this tzdata zone, e.g. "America/New_York"'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, timeZone, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/schedules', {
      query: { ...query, time_zone: timeZone },
    }),
});

export const pagerdutyGetSchedule = tool({
  description: 'Get a schedule with layers, rotations, and final-schedule entries for a window.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID'),
    since: z.string().optional().describe('ISO-8601 window start for rendered entries'),
    until: z.string().optional().describe('ISO-8601 window end for rendered entries'),
    timeZone: z.string().optional().describe('Render entries in this zone'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId, since, until, timeZone }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/schedules/${encodeURIComponent(scheduleId)}`, {
      query: { since, until, time_zone: timeZone },
    }),
});

export const pagerdutyCreateSchedule = tool({
  description: 'Create an on-call schedule with rotation layers.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Schedule name'),
    timeZone: z.string().describe('IANA zone, e.g. "America/New_York"'),
    layers: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Rotation layers [{name, start, rotation_virtual_start, rotation_turn_length_seconds, users:[{user:{id,type}}], restrictions, ...}]',
      ),
    description: z.string().optional().describe('Schedule purpose'),
  }),
  execute: ({ pagerdutyApiKey, name, timeZone, layers, description }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/schedules', {
      body: {
        schedule: {
          type: 'schedule',
          name,
          time_zone: timeZone,
          schedule_layers: layers,
          ...(description ? { description } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateSchedule = tool({
  description: 'Update a schedule name, zone, description, or rotation layers.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID'),
    name: z.string().optional().describe('New name'),
    timeZone: z.string().optional().describe('New IANA zone'),
    description: z.string().optional().describe('New description'),
    layers: z.array(z.record(z.any())).optional().describe('Replacement schedule_layers'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId, name, timeZone, description, layers }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/schedules/${encodeURIComponent(scheduleId)}`, {
      body: {
        schedule: {
          type: 'schedule',
          ...(name ? { name } : {}),
          ...(timeZone ? { time_zone: timeZone } : {}),
          ...(description ? { description } : {}),
          ...(layers ? { schedule_layers: layers } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteSchedule = tool({
  description: 'Delete a schedule. Remove it from escalation policies first.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/schedules/${encodeURIComponent(scheduleId)}`),
});

export const pagerdutyPreviewSchedule = tool({
  description: 'Preview how a schedule renders (final timetable) without saving it.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    schedule: z.record(z.any()).describe('Full schedule object to preview (same shape as create)'),
    since: z.string().optional().describe('ISO-8601 window start'),
    until: z.string().optional().describe('ISO-8601 window end'),
  }),
  execute: ({ pagerdutyApiKey, schedule, since, until }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/schedules/preview', {
      query: { since, until },
      body: { schedule },
    }),
});

export const pagerdutyListScheduleOverrides = tool({
  description: 'List overrides (OOO cover, swaps) on a schedule within a window.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID'),
    since: z.string().describe('ISO-8601 window start'),
    until: z.string().describe('ISO-8601 window end'),
    editable: z.boolean().optional().describe('Only overrides editable by the caller'),
    overflow: z.boolean().optional().describe('Include overrides outside the window edges'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId, since, until, editable, overflow }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/schedules/${encodeURIComponent(scheduleId)}/overrides`, {
      query: { since, until, editable, overflow },
    }),
});

export const pagerdutyCreateScheduleOverride = tool({
  description: 'Create schedule overrides for vacations, swaps, or temporary cover.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID'),
    overrides: z
      .array(z.record(z.any()))
      .min(1)
      .describe('Overrides [{start, end, user:{id,type}, time_zone?}]'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId, overrides }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/schedules/${encodeURIComponent(scheduleId)}/overrides`, {
      body: { overrides },
    }),
});

export const pagerdutyDeleteScheduleOverride = tool({
  description: 'Delete a schedule override to restore the normal rotation.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID'),
    overrideId: z.string().describe('Override ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId, overrideId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/schedules/${encodeURIComponent(scheduleId)}/overrides/${encodeURIComponent(overrideId)}`,
    ),
});

export const pagerdutyListScheduleUsers = tool({
  description: 'List all users participating in a schedule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    scheduleId: z.string().describe('Schedule ID'),
    since: z.string().optional().describe('ISO-8601 window start'),
    until: z.string().optional().describe('ISO-8601 window end'),
  }),
  execute: ({ pagerdutyApiKey, scheduleId, since, until }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/schedules/${encodeURIComponent(scheduleId)}/users`, {
      query: { since, until },
    }),
});

export const pagerdutyListOncalls = tool({
  description:
    'Who is on call now (or in a window), filterable by user, schedule, policy, or team. Use for "who do I page" questions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    since: z.string().optional().describe('Window start (default now)'),
    until: z.string().optional().describe('Window end (default now)'),
    userIds: z.array(z.string()).optional().describe('Filter to these users'),
    scheduleIds: z.array(z.string()).optional().describe('Filter to these schedules'),
    escalationPolicyIds: z.array(z.string()).optional().describe('Filter to these policies'),
    earliest: z
      .boolean()
      .optional()
      .describe('Only the earliest on-call per policy/level/user (next-on-call lookup)'),
    timeZone: z.string().optional().describe('Render in this zone'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, userIds, scheduleIds, escalationPolicyIds, timeZone, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/oncalls', {
      query: {
        ...query,
        user_ids: userIds,
        schedule_ids: scheduleIds,
        escalation_policy_ids: escalationPolicyIds,
        time_zone: timeZone,
      },
    }),
});
