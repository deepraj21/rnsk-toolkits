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

export const pagerdutyListIncidentNotes = tool({
  description: 'List timeline notes on an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incidents/${encodeURIComponent(incidentId)}/notes`),
});

export const pagerdutyCreateIncidentNote = tool({
  description: 'Post a note to an incident timeline for responder coordination.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    content: z.string().describe('Note text'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, content }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/incidents/${encodeURIComponent(incidentId)}/notes`, {
      fromEmail,
      body: { note: { content } },
    }),
});

export const pagerdutyUpdateIncidentNote = tool({
  description: 'Edit an existing incident note.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    noteId: z.string().describe('Note ID to update'),
    content: z.string().describe('Replacement note text'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, noteId, content }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incidents/${encodeURIComponent(incidentId)}/notes/${encodeURIComponent(noteId)}`,
      { fromEmail, body: { note: { content } } },
    ),
});

export const pagerdutyDeleteIncidentNote = tool({
  description: 'Delete an incident note.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    noteId: z.string().describe('Note ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, noteId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/incidents/${encodeURIComponent(incidentId)}/notes/${encodeURIComponent(noteId)}`,
    ),
});

export const pagerdutyListIncidentAlerts = tool({
  description: 'List alerts grouped under an incident, filterable by status.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    statuses: z
      .array(z.enum(['triggered', 'acknowledged', 'resolved']))
      .optional()
      .describe('Filter alerts by status'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
    include: z
      .array(z.string())
      .optional()
      .describe('Embed, e.g. ["services","first_trigger_log_entries"]'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incidents/${encodeURIComponent(incidentId)}/alerts`, {
      query,
    }),
});

export const pagerdutyGetIncidentAlert = tool({
  description: 'Get details of one alert within an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    alertId: z.string().describe('Alert ID'),
    include: z.array(z.string()).optional().describe('Embed, e.g. ["services"]'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, alertId, include }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/alerts/${encodeURIComponent(alertId)}`,
      { query: { include } },
    ),
});

export const pagerdutyUpdateIncidentAlert = tool({
  description: 'Acknowledge or resolve a single alert inside an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    alertId: z.string().describe('Alert ID'),
    status: z.enum(['triggered', 'acknowledged', 'resolved']).describe('New alert status'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, alertId, status }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incidents/${encodeURIComponent(incidentId)}/alerts/${encodeURIComponent(alertId)}`,
      { fromEmail, body: { alert: { type: 'alert_reference', status } } },
    ),
});

export const pagerdutyBulkUpdateIncidentAlerts = tool({
  description: 'Acknowledge or resolve many alerts in one incident at once.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    alerts: z
      .array(
        z
          .object({ id: z.string(), status: z.enum(['triggered', 'acknowledged', 'resolved']) })
          .passthrough(),
      )
      .min(1)
      .describe('Alerts with new statuses, e.g. [{id, status}]'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, alerts }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/incidents/${encodeURIComponent(incidentId)}/alerts`, {
      fromEmail,
      body: {
        alerts: alerts.map((a) => ({ id: a.id, type: 'alert_reference', ...a })),
      },
    }),
});

export const pagerdutyListIncidentLogEntries = tool({
  description: 'List the audit log entries (triggers, acks, escalations, resolves) on an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    include: z.array(z.string()).optional().describe('Embed, e.g. ["users","channels"]'),
    isOverview: z.boolean().optional().describe('True for a condensed overview timeline'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  }),
  execute: ({ pagerdutyApiKey, incidentId, isOverview, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/incidents/${encodeURIComponent(incidentId)}/log_entries`, {
      query: { ...query, is_overview: isOverview },
    }),
});

export const pagerdutyRequestResponders = tool({
  description: 'Page additional responders (users or escalation policies) to join an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    requesterId: z.string().describe('User ID making the request'),
    message: z.string().describe('Message sent with the responder request'),
    targets: z
      .array(
        z.object({
          id: z.string().describe('User or escalation policy ID'),
          type: z.enum(['user_reference', 'escalation_policy_reference']).describe('Target type'),
        }),
      )
      .min(1)
      .describe('Who to page'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, requesterId, message, targets }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incidents/${encodeURIComponent(incidentId)}/responder_requests`,
      {
        fromEmail,
        body: {
          requester_id: requesterId,
          message,
          responder_request_targets: targets.map((t) => ({
            responder_request_target: { id: t.id, type: t.type },
          })),
        },
      },
    ),
});

export const pagerdutyCancelResponderRequest = tool({
  description: 'Cancel a pending responder request on an incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    requesterId: z.string().describe('User ID cancelling the request'),
    targets: z
      .array(
        z.object({
          id: z.string().describe('User or escalation policy ID'),
          type: z.enum(['user_reference', 'escalation_policy_reference']).describe('Target type'),
        }),
      )
      .min(1)
      .describe('Responder targets to cancel'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, requesterId, targets }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/incidents/${encodeURIComponent(incidentId)}/responder_requests/cancel`,
      { fromEmail, body: { requester_id: requesterId, responder_request_targets: targets } },
    ),
});

export const pagerdutyPostIncidentStatusUpdate = tool({
  description: 'Publish a stakeholder status update on an incident (optionally custom HTML email).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    fromEmail: fromField,
    incidentId: z.string().describe('Incident ID'),
    message: z.string().describe('Status update message'),
    subject: z.string().optional().describe('Custom HTML email subject (requires htmlMessage)'),
    htmlMessage: z.string().optional().describe('Custom HTML email body (requires subject)'),
  }),
  execute: ({ pagerdutyApiKey, fromEmail, incidentId, message, subject, htmlMessage }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incidents/${encodeURIComponent(incidentId)}/status_updates`,
      {
        fromEmail,
        body: {
          message,
          ...(subject ? { subject } : {}),
          ...(htmlMessage ? { html_message: htmlMessage } : {}),
        },
      },
    ),
});

export const pagerdutyListStatusUpdateSubscribers = tool({
  description: 'List users/teams subscribed to an incident status updates.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
  }),
  execute: ({ pagerdutyApiKey, incidentId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/incidents/${encodeURIComponent(incidentId)}/status_updates/subscribers`,
    ),
});

const subscriberShape = z
  .array(
    z
      .object({ id: z.string(), type: z.string() })
      .passthrough()
      .describe('Subscriber {id, type: user_reference|team_reference, ...}'),
  )
  .min(1);

export const pagerdutyAddStatusUpdateSubscribers = tool({
  description: 'Subscribe users or teams to an incident status updates.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    subscribers: subscriberShape,
  }),
  execute: ({ pagerdutyApiKey, incidentId, subscribers }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incidents/${encodeURIComponent(incidentId)}/status_updates/subscribers`,
      { body: { subscribers } },
    ),
});

export const pagerdutyRemoveStatusUpdateSubscribers = tool({
  description: 'Unsubscribe users or teams from an incident status updates.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    incidentId: z.string().describe('Incident ID'),
    subscribers: subscriberShape,
  }),
  execute: ({ pagerdutyApiKey, incidentId, subscribers }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/incidents/${encodeURIComponent(incidentId)}/status_updates/unsubscribe`,
      { body: { subscribers } },
    ),
});
