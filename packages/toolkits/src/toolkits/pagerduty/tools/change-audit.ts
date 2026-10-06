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

export const pagerdutyListChangeEvents = tool({
  description: 'List change events (deploys, config changes) across services for correlation.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    teamIds: z.array(z.string()).optional().describe('Only events for these teams services'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamIds, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/change_events', {
      query: { ...query, team_ids: teamIds },
    }),
});

export const pagerdutyCreateChangeEvent = tool({
  description: 'Record a change event (deploy, release, config change) for incident correlation.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    summary: z.string().describe('Short summary, e.g. "Deployed api v2.14.1 to prod"'),
    source: z.string().optional().describe('System identifier, e.g. hostname or pipeline name'),
    timestamp: z.string().optional().describe('ISO-8601 time of the change (default now)'),
    serviceId: z.string().optional().describe('Service this change applies to'),
    integrationId: z.string().optional().describe('Service integration ID to attach to'),
    customDetails: z
      .record(z.any())
      .optional()
      .describe('Extra context (build number, commit, runbook link)'),
    links: z
      .array(z.object({ href: z.string(), text: z.string().optional() }))
      .optional()
      .describe('Related links (pipeline run, dashboard)'),
  }),
  execute: ({
    pagerdutyApiKey,
    summary,
    source,
    timestamp,
    serviceId,
    integrationId,
    customDetails,
    links,
  }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/change_events', {
      body: {
        change_event: {
          summary,
          ...(source ? { source } : {}),
          ...(timestamp ? { timestamp } : {}),
          ...(serviceId ? { service: { id: serviceId, type: 'service_reference' } } : {}),
          ...(integrationId
            ? { integration: { id: integrationId, type: 'integration_reference' } }
            : {}),
          ...(customDetails ? { custom_details: customDetails } : {}),
          ...(links ? { links } : {}),
        },
      },
    }),
});

export const pagerdutyGetChangeEvent = tool({
  description: 'Get one change event with details.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    changeEventId: z.string().describe('Change event ID'),
  }),
  execute: ({ pagerdutyApiKey, changeEventId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/change_events/${encodeURIComponent(changeEventId)}`),
});

export const pagerdutyUpdateChangeEvent = tool({
  description: 'Update a change event summary or details.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    changeEventId: z.string().describe('Change event ID'),
    summary: z.string().optional().describe('New summary'),
    customDetails: z.record(z.any()).optional().describe('New custom details'),
  }),
  execute: ({ pagerdutyApiKey, changeEventId, summary, customDetails }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/change_events/${encodeURIComponent(changeEventId)}`, {
      body: {
        change_event: {
          ...(summary ? { summary } : {}),
          ...(customDetails ? { custom_details: customDetails } : {}),
        },
      },
    }),
});

export const pagerdutyListAuditRecords = tool({
  description: 'Account-wide audit trail of configuration changes.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    since: z.string().optional().describe('ISO-8601 start'),
    until: z.string().optional().describe('ISO-8601 end'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/audit/records', { query }),
});

export const pagerdutyListLogEntries = tool({
  description:
    'Account-wide incident log entries (triggers, acks, escalations) for timeline review.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    since: z.string().optional().describe('ISO-8601 start'),
    until: z.string().optional().describe('ISO-8601 end'),
    isOverview: z.boolean().optional().describe('Condensed overview entries'),
    include: z.array(z.string()).optional().describe('Embed, e.g. ["users","channels"]'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, isOverview, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/log_entries', {
      query: { ...query, is_overview: isOverview },
    }),
});

export const pagerdutyGetLogEntry = tool({
  description: 'Get one log entry by ID.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    logEntryId: z.string().describe('Log entry ID'),
    incidentId: z.string().optional().describe('Scope to this incident'),
    include: z.array(z.string()).optional().describe('Embed related objects'),
  }),
  execute: ({ pagerdutyApiKey, logEntryId, incidentId, include }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/log_entries/${encodeURIComponent(logEntryId)}`, {
      query: { incident_id: incidentId, include },
    }),
});

export const pagerdutyUpdateLogEntryChannel = tool({
  description: 'Update the channel info on a log entry (e.g. conference bridge details).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    logEntryId: z.string().describe('Log entry ID'),
    incidentId: z.string().describe('Parent incident ID'),
    channel: z.record(z.any()).describe('Channel object, e.g. {conference_number, conference_url}'),
  }),
  execute: ({ pagerdutyApiKey, logEntryId, incidentId, channel }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/log_entries/${encodeURIComponent(logEntryId)}/channel`, {
      query: { incident_id: incidentId },
      body: { channel },
    }),
});

export const pagerdutyListStandards = tool({
  description: 'List service standards (recommended configuration practices).',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/standards'),
});

export const pagerdutyGetStandardScores = tool({
  description: 'Get standards compliance scores for services or teams.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    resourceType: z.enum(['technical_services', 'teams']).describe('Resource kind to score'),
    resourceId: z.string().optional().describe('Score one resource; omit for all'),
  }),
  execute: ({ pagerdutyApiKey, resourceType, resourceId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      resourceId
        ? `/standards/scores/${resourceType}/${encodeURIComponent(resourceId)}`
        : `/standards/scores/${resourceType}`,
    ),
});

export const pagerdutyUpdateStandard = tool({
  description: 'Activate/deactivate a standard or adjust its scope and description.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    standardId: z.string().describe('Standard ID'),
    active: z.boolean().optional().describe('Enable or disable the standard'),
    description: z.string().optional().describe('New description'),
    inclusions: z.array(z.record(z.any())).optional().describe('Inclusion rules'),
    exclusions: z.array(z.record(z.any())).optional().describe('Exclusion rules'),
  }),
  execute: ({ pagerdutyApiKey, standardId, active, description, inclusions, exclusions }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/standards/${encodeURIComponent(standardId)}`, {
      body: {
        ...(active !== undefined ? { active } : {}),
        ...(description ? { description } : {}),
        ...(inclusions ? { inclusions } : {}),
        ...(exclusions ? { exclusions } : {}),
      },
    }),
});
