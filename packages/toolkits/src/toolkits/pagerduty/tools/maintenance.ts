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

export const pagerdutyListMaintenanceWindows = tool({
  description: 'List maintenance windows (planned downtime suppressing notifications).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by description substring'),
    teamIds: z.array(z.string()).optional().describe('Only windows for these teams'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamIds, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/maintenance_windows', {
      query: { ...query, team_ids: teamIds },
    }),
});

export const pagerdutyGetMaintenanceWindow = tool({
  description: 'Get one maintenance window with its services and time range.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    windowId: z.string().describe('Maintenance window ID'),
  }),
  execute: ({ pagerdutyApiKey, windowId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/maintenance_windows/${encodeURIComponent(windowId)}`),
});

export const pagerdutyCreateMaintenanceWindow = tool({
  description: 'Schedule planned downtime on services to suppress notifications.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    description: z.string().optional().describe('Window purpose, e.g. "DB migration"'),
    startTime: z.string().describe('ISO-8601 start'),
    endTime: z.string().describe('ISO-8601 end'),
    serviceIds: z.array(z.string()).min(1).describe('Services under maintenance'),
    teamIds: z.array(z.string()).optional().describe('Teams owning the window'),
  }),
  execute: ({ pagerdutyApiKey, description, startTime, endTime, serviceIds, teamIds }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/maintenance_windows', {
      body: {
        maintenance_window: {
          type: 'maintenance_window',
          start_time: startTime,
          end_time: endTime,
          services: serviceIds.map((id) => ({ id, type: 'service_reference' })),
          ...(description ? { description } : {}),
          ...(teamIds ? { teams: teamIds.map((id) => ({ id, type: 'team_reference' })) } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateMaintenanceWindow = tool({
  description: 'Reschedule or re-scope a maintenance window.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    windowId: z.string().describe('Maintenance window ID'),
    description: z.string().optional().describe('New description'),
    startTime: z.string().optional().describe('New ISO-8601 start'),
    endTime: z.string().optional().describe('New ISO-8601 end'),
    serviceIds: z.array(z.string()).optional().describe('New service list'),
  }),
  execute: ({ pagerdutyApiKey, windowId, description, startTime, endTime, serviceIds }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/maintenance_windows/${encodeURIComponent(windowId)}`, {
      body: {
        maintenance_window: {
          type: 'maintenance_window',
          ...(description ? { description } : {}),
          ...(startTime ? { start_time: startTime } : {}),
          ...(endTime ? { end_time: endTime } : {}),
          ...(serviceIds
            ? { services: serviceIds.map((id) => ({ id, type: 'service_reference' })) }
            : {}),
        },
      },
    }),
});

export const pagerdutyDeleteMaintenanceWindow = tool({
  description: 'Delete a maintenance window, re-enabling notifications immediately.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    windowId: z.string().describe('Maintenance window ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, windowId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/maintenance_windows/${encodeURIComponent(windowId)}`),
});

export const pagerdutyListTags = tool({
  description: 'List tags used across services, teams, and policies.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by label substring'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) => pdRequest(pagerdutyApiKey, 'GET', '/tags', { query }),
});

export const pagerdutyCreateTag = tool({
  description: 'Create a new tag label.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    label: z.string().describe('Tag label, e.g. "prod"'),
  }),
  execute: ({ pagerdutyApiKey, label }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/tags', {
      body: { label, type: 'tag' },
    }),
});

export const pagerdutyGetTag = tool({
  description: 'Get a tag by ID.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    tagId: z.string().describe('Tag ID'),
  }),
  execute: ({ pagerdutyApiKey, tagId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/tags/${encodeURIComponent(tagId)}`),
});

export const pagerdutyDeleteTag = tool({
  description: 'Delete a tag label from the account.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    tagId: z.string().describe('Tag ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, tagId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/tags/${encodeURIComponent(tagId)}`),
});

export const pagerdutyListEntityTags = tool({
  description: 'List tags on services, teams, or escalation policies.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    entityType: z.enum(['services', 'teams', 'escalation_policies']).describe('Entity collection'),
    entityId: z.string().describe('Entity ID'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, entityType, entityId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/tags/${entityType}/${encodeURIComponent(entityId)}`, {
      query,
    }),
});

export const pagerdutySetEntityTags = tool({
  description: 'Replace all tags on services, teams, or escalation policies.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    entityType: z.enum(['services', 'teams', 'escalation_policies']).describe('Entity collection'),
    entityId: z.string().describe('Entity ID'),
    add: z.array(z.string()).optional().describe('Tag labels to add'),
    remove: z.array(z.string()).optional().describe('Tag labels to remove'),
  }),
  execute: ({ pagerdutyApiKey, entityType, entityId, add, remove }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/tags/${entityType}/${encodeURIComponent(entityId)}`, {
      body: {
        ...(add ? { add: add.map((label) => ({ label, type: 'tag' })) } : {}),
        ...(remove ? { remove: remove.map((label) => ({ label, type: 'tag' })) } : {}),
      },
    }),
});

export const pagerdutyListPriorities = tool({
  description: 'List incident priorities (P1-P5) with IDs needed for incident creation.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/priorities'),
});

export const pagerdutyListAbilities = tool({
  description: 'List account abilities/feature flags (e.g. SSO, audit, event orchestration).',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/abilities'),
});

export const pagerdutyGetAbility = tool({
  description: 'Check whether one ability is enabled on the account.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    abilityId: z.string().describe('Ability ID from pagerdutyListAbilities'),
  }),
  execute: ({ pagerdutyApiKey, abilityId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/abilities/${encodeURIComponent(abilityId)}`),
});

export const pagerdutyListLicenses = tool({
  description: 'List license types available on the account.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/licenses'),
});

export const pagerdutyListLicenseAllocations = tool({
  description: 'List how licenses are allocated across the account.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/license_allocations'),
});

export const pagerdutyListNotifications = tool({
  description: 'List notifications sent to users (pages, emails, pushes) for review.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    since: z.string().optional().describe('ISO-8601 start'),
    until: z.string().optional().describe('ISO-8601 end'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/notifications', { query }),
});
