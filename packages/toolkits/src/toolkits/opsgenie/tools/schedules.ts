// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { opsgenieRequest, failedResult, toOpsgenieError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');
const regionField = z.enum(['us', 'eu']).optional().describe('Opsgenie region: us (default) or eu');

export const opsgenieCreateIncident = tool({
  description:
    'Create an incident (message, responders, tags, priority, services). Async: returns requestId to poll. Standard/Enterprise plans.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    message: z.string().describe('Incident message (required)'),
    description: z.string().optional().describe('Incident description'),
    responders: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Responders [{type: user|team, id|name}]'),
    tags: z.array(z.string()).optional().describe('Incident tags'),
    details: z.record(z.string(), z.string()).optional().describe('Custom details'),
    priority: z.enum(['P1', 'P2', 'P3', 'P4', 'P5']).optional().describe('Priority'),
    services: z.array(z.string()).optional().describe('Impacted service IDs'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the timeline'),
  }),
  execute: async ({ opsgenieApiKey, region, ...incident }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v1/incidents/create', {
        method: 'POST',
        region,
        body: incident,
      });
      if (!result.ok) return failedResult('Failed to create incident', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating incident');
    }
  },
});

export const opsgenieListIncidents = tool({
  description: 'List incidents with query, sorting, and pagination.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    query: z.string().optional().describe('Search query, e.g. status:open'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    sort: z.string().optional().describe('Sort field'),
    limit: z.number().int().min(1).max(100).optional().describe('Incidents per page'),
    offset: z.number().int().min(0).optional().describe('Incidents to skip'),
  }),
  execute: async ({ opsgenieApiKey, region, query, order, sort, limit, offset }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v1/incidents/', {
        region,
        query: { query, order, sort, limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list incidents', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing incidents');
    }
  },
});

export const opsgenieGetIncident = tool({
  description: 'Get one incident with responders, services, tags, and status.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Incident ID or tiny ID'),
    identifierType: z.enum(['id', 'tiny']).optional().describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/incidents/${identifier}`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to get incident', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting incident');
    }
  },
});

export const opsgenieDeleteIncident = tool({
  description: 'Delete an incident. Async: returns requestId to poll.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Incident ID or tiny ID'),
    identifierType: z.enum(['id', 'tiny']).optional().describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/incidents/${identifier}`, {
        method: 'DELETE',
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to delete incident', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting incident');
    }
  },
});

export const opsgenieCloseIncident = tool({
  description: 'Close an incident with an optional timeline note.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Incident ID or tiny ID'),
    identifierType: z.enum(['id', 'tiny']).optional().describe('Identifier type (default id)'),
    note: z.string().optional().describe('Closing note for the timeline'),
    user: z.string().optional().describe('Display name of the request owner'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, note, user }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/incidents/${identifier}/close`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          ...(note !== undefined ? { note } : {}),
          ...(user !== undefined ? { user } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to close incident', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error closing incident');
    }
  },
});

export const opsgenieResolveIncident = tool({
  description: 'Mark an incident as resolved with an optional timeline note.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Incident ID or tiny ID'),
    identifierType: z.enum(['id', 'tiny']).optional().describe('Identifier type (default id)'),
    note: z.string().optional().describe('Resolution note for the timeline'),
    user: z.string().optional().describe('Display name of the request owner'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, note, user }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/incidents/${identifier}/resolve`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          ...(note !== undefined ? { note } : {}),
          ...(user !== undefined ? { user } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to resolve incident', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error resolving incident');
    }
  },
});

export const opsgenieGetIncidentRequestStatus = tool({
  description: 'Poll an async incident request (create/delete) by request ID.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    requestId: z.string().describe('Request ID from a 202 response'),
  }),
  execute: async ({ opsgenieApiKey, region, requestId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v1/incidents/requests/${requestId}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get incident request status', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting incident request status');
    }
  },
});

export const opsgenieListSchedules = tool({
  description: 'List on-call schedules.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/schedules', { region });
      if (!result.ok) return failedResult('Failed to list schedules', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing schedules');
    }
  },
});

export const opsgenieGetSchedule = tool({
  description: 'Get one schedule with rotations and owner team.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Schedule ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/schedules/${identifier}`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to get schedule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting schedule');
    }
  },
});

export const opsgenieCreateSchedule = tool({
  description: 'Create a schedule (name, timezone, owner team, rotations).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Schedule name'),
    timezone: z.string().optional().describe('IANA timezone, e.g. America/New_York'),
    description: z.string().optional().describe('Schedule description'),
    enabled: z.boolean().optional().describe('Enable the schedule'),
    ownerTeam: z.record(z.string(), z.any()).optional().describe('Owner team {id} or {name}'),
    rotations: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Rotations [{name, startDate, type, participants}]'),
  }),
  execute: async ({ opsgenieApiKey, region, ...schedule }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/schedules', {
        method: 'POST',
        region,
        body: schedule,
      });
      if (!result.ok) return failedResult('Failed to create schedule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating schedule');
    }
  },
});

export const opsgenieUpdateSchedule = tool({
  description: 'Partially update a schedule (name, timezone, enabled, rotations).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Schedule ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
    schedule: z.record(z.string(), z.any()).describe('Schedule fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, schedule }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/schedules/${identifier}`, {
        method: 'PATCH',
        region,
        query: { identifierType },
        body: schedule,
      });
      if (!result.ok) return failedResult('Failed to update schedule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating schedule');
    }
  },
});

export const opsgenieDeleteSchedule = tool({
  description: 'Delete a schedule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Schedule ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/schedules/${identifier}`, {
        method: 'DELETE',
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to delete schedule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting schedule');
    }
  },
});

export const opsgenieGetScheduleTimeline = tool({
  description:
    'Get schedule timeline with on-call recipients per period (expand base/forwarding/override).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Schedule ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
    expand: z.string().optional().describe('Comma-separated: base,forwarding,override'),
    interval: z.number().int().min(1).optional().describe('Length of time to retrieve'),
    intervalUnit: z.enum(['days', 'weeks', 'months']).optional().describe('Interval unit'),
    date: z.string().optional().describe('Start date ISO datetime'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    expand,
    interval,
    intervalUnit,
    date,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/schedules/${identifier}/timeline`, {
        region,
        query: { identifierType, expand, interval, intervalUnit, date },
      });
      if (!result.ok) return failedResult('Failed to get schedule timeline', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting schedule timeline');
    }
  },
});

export const opsgenieListRotations = tool({
  description: 'List rotations of a schedule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    scheduleIdentifierType: z
      .enum(['id', 'name'])
      .optional()
      .describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, scheduleIdentifierType }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/rotations`,
        { region, query: { scheduleIdentifierType } },
      );
      if (!result.ok) return failedResult('Failed to list rotations', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing rotations');
    }
  },
});

export const opsgenieCreateRotation = tool({
  description:
    'Create a rotation (name, start date, hourly/daily/weekly type, participants, time restrictions).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    scheduleIdentifierType: z
      .enum(['id', 'name'])
      .optional()
      .describe('Identifier type (default id)'),
    rotation: z
      .record(z.string(), z.any())
      .describe(
        'Rotation: name, startDate, type (hourly/daily/weekly), length, participants [{type, id/username}], timeRestriction',
      ),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    scheduleIdentifier,
    scheduleIdentifierType,
    rotation,
  }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/rotations`,
        { method: 'POST', region, query: { scheduleIdentifierType }, body: rotation },
      );
      if (!result.ok) return failedResult('Failed to create rotation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating rotation');
    }
  },
});

export const opsgenieGetRotation = tool({
  description: 'Get one rotation with participants and restrictions.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    rotationId: z.string().describe('Rotation ID'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, rotationId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/rotations/${rotationId}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get rotation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting rotation');
    }
  },
});

export const opsgenieUpdateRotation = tool({
  description: 'Partially update a rotation.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    rotationId: z.string().describe('Rotation ID'),
    rotation: z.record(z.string(), z.any()).describe('Rotation fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, rotationId, rotation }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/rotations/${rotationId}`,
        { method: 'PATCH', region, body: rotation },
      );
      if (!result.ok) return failedResult('Failed to update rotation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating rotation');
    }
  },
});

export const opsgenieDeleteRotation = tool({
  description: 'Delete a rotation.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    rotationId: z.string().describe('Rotation ID'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, rotationId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/rotations/${rotationId}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete rotation', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting rotation');
    }
  },
});

export const opsgenieListOverrides = tool({
  description: 'List schedule overrides (temporary on-call swaps).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/overrides`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to list overrides', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing overrides');
    }
  },
});

export const opsgenieCreateOverride = tool({
  description:
    'Create an override: swap the on-call user for a time range (optionally per rotation).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    alias: z.string().optional().describe('Override alias'),
    user: z.record(z.string(), z.any()).describe('Replacement user {id|username, type: user}'),
    startDate: z.string().describe('Override start ISO datetime'),
    endDate: z.string().describe('Override end ISO datetime'),
    rotations: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Rotations to override [{name}] (omit for all)'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    scheduleIdentifier,
    alias,
    user,
    startDate,
    endDate,
    rotations,
  }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/overrides`,
        {
          method: 'POST',
          region,
          body: {
            ...(alias !== undefined ? { alias } : {}),
            user,
            startDate,
            endDate,
            ...(rotations !== undefined ? { rotations } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create override', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating override');
    }
  },
});

export const opsgenieGetOverride = tool({
  description: 'Get one schedule override by alias.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    alias: z.string().describe('Override alias'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, alias }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/overrides/${alias}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get override', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting override');
    }
  },
});

export const opsgenieUpdateOverride = tool({
  description: 'Update a schedule override (user, dates, rotations).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    alias: z.string().describe('Override alias'),
    override: z.record(z.string(), z.any()).describe('Override fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, alias, override }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/overrides/${alias}`,
        { method: 'PUT', region, body: override },
      );
      if (!result.ok) return failedResult('Failed to update override', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating override');
    }
  },
});

export const opsgenieDeleteOverride = tool({
  description: 'Delete a schedule override.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    alias: z.string().describe('Override alias'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, alias }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/overrides/${alias}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete override', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting override');
    }
  },
});

export const opsgenieGetOnCalls = tool({
  description: 'Get current on-call participants of a schedule. The core who-is-on-call query.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    scheduleIdentifierType: z
      .enum(['id', 'name'])
      .optional()
      .describe('Identifier type (default id)'),
    flat: z.boolean().optional().describe('Return only participant names'),
    date: z.string().optional().describe('On-call at this ISO datetime (default now)'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    scheduleIdentifier,
    scheduleIdentifierType,
    flat,
    date,
  }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/on-calls`,
        { region, query: { scheduleIdentifierType, flat, date } },
      );
      if (!result.ok) return failedResult('Failed to get on-calls', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting on-calls');
    }
  },
});

export const opsgenieListOnCalls = tool({
  description: 'List current on-call participants across all schedules.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    flat: z.boolean().optional().describe('Return only participant names'),
  }),
  execute: async ({ opsgenieApiKey, region, flat }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/schedules/on-calls', {
        region,
        query: { flat },
      });
      if (!result.ok) return failedResult('Failed to list on-calls', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing on-calls');
    }
  },
});

export const opsgenieGetNextOnCalls = tool({
  description: 'Get next on-call participants of a schedule (upcoming rotation).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    scheduleIdentifier: z.string().describe('Schedule ID or name'),
    scheduleIdentifierType: z
      .enum(['id', 'name'])
      .optional()
      .describe('Identifier type (default id)'),
    flat: z.boolean().optional().describe('Return only participant names'),
  }),
  execute: async ({ opsgenieApiKey, region, scheduleIdentifier, scheduleIdentifierType, flat }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/schedules/${scheduleIdentifier}/next-on-calls`,
        { region, query: { scheduleIdentifierType, flat } },
      );
      if (!result.ok) return failedResult('Failed to get next on-calls', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting next on-calls');
    }
  },
});

export const opsgenieExportSchedule = tool({
  description: 'Export a schedule as .ics text (iCalendar).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Schedule ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      if (!opsgenieApiKey) {
        return {
          error: 'Failed to export schedule',
          statusCode: 401,
          details: { error: 'Opsgenie API key is required.' },
        };
      }
      const base = region === 'eu' ? 'https://api.eu.opsgenie.com' : 'https://api.opsgenie.com';
      const response = await fetch(`${base}/v2/schedules/${identifier}.ics`, {
        headers: { Authorization: `GenieKey ${opsgenieApiKey}` },
      });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        return { error: 'Failed to export schedule', statusCode: response.status, details };
      }
      return { ics: await response.text() };
    } catch (error) {
      return toOpsgenieError(error, 'Error exporting schedule');
    }
  },
});
