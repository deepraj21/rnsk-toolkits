// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { opsgenieRequest, failedResult, toOpsgenieError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');
const regionField = z.enum(['us', 'eu']).optional().describe('Opsgenie region: us (default) or eu');
const identifierTypeField = z
  .enum(['id', 'name', 'tiny'])
  .optional()
  .describe('Identifier type (default id)');

const responderField = z
  .object({
    type: z.string().describe('user, team, schedule, or escalation'),
    id: z.string().optional().describe('Responder ID'),
    name: z.string().optional().describe('Responder name/username'),
  })
  .describe('Responder');

export const opsgenieCreateAlert = tool({
  description:
    'Create an alert (message, alias, responders, priority, tags, details). Async: returns requestId to poll. Deduplicates on alias.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    message: z.string().describe('Alert message (required)'),
    alias: z.string().optional().describe('Deduplication alias'),
    description: z.string().optional().describe('Alert description'),
    responders: z
      .array(responderField)
      .optional()
      .describe('Responder users/teams/schedules/escalations'),
    visibleTo: z.array(responderField).optional().describe('Teams/users the alert is visible to'),
    actions: z.array(z.string()).optional().describe('Custom action names'),
    tags: z.array(z.string()).optional().describe('Alert tags'),
    details: z.record(z.string(), z.string()).optional().describe('Custom details map'),
    entity: z.string().optional().describe('Entity the alert relates to'),
    source: z.string().optional().describe('Alert source'),
    priority: z.enum(['P1', 'P2', 'P3', 'P4', 'P5']).optional().describe('Priority (default P3)'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note added at creation'),
  }),
  execute: async ({ opsgenieApiKey, region, ...alert }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/alerts', {
        method: 'POST',
        region,
        body: alert,
      });
      if (!result.ok) return failedResult('Failed to create alert', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating alert');
    }
  },
});

export const opsgenieListAlerts = tool({
  description: 'List alerts with Opsgenie search query, sorting, and pagination.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    query: z.string().optional().describe('Search query, e.g. status:open AND priority:P1'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    sort: z.string().optional().describe('Sort field, e.g. createdAt, updatedAt'),
    limit: z.number().int().min(1).max(100).optional().describe('Alerts per page'),
    offset: z.number().int().min(0).optional().describe('Alerts to skip'),
  }),
  execute: async ({ opsgenieApiKey, region, query, order, sort, limit, offset }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/alerts', {
        region,
        query: { query, order, sort, limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list alerts', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing alerts');
    }
  },
});

export const opsgenieGetAlert = tool({
  description: 'Get one alert with responders, actions, tags, and details.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to get alert', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting alert');
    }
  },
});

export const opsgenieDeleteAlert = tool({
  description: 'Delete an alert. Async: returns requestId to poll.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}`, {
        method: 'DELETE',
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to delete alert', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting alert');
    }
  },
});

export const opsgenieCountAlerts = tool({
  description: 'Count alerts matching a search query.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    query: z.string().optional().describe('Search query (omit to count all open alerts)'),
  }),
  execute: async ({ opsgenieApiKey, region, query }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/alerts/count', {
        region,
        query: { query },
      });
      if (!result.ok) return failedResult('Failed to count alerts', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error counting alerts');
    }
  },
});

function alertAction(name: string, action: string, description: string, extra?: z.ZodRawShape) {
  return tool({
    description,
    inputSchema: z.object({
      opsgenieApiKey: apiKeyField,
      region: regionField,
      identifier: z.string().describe('Alert ID, tiny ID, or alias'),
      identifierType: identifierTypeField,
      user: z.string().optional().describe('Display name of the request owner'),
      note: z.string().optional().describe('Note for the audit log'),
      source: z.string().optional().describe('Source of the action'),
      ...(extra ?? {}),
    }),
    execute: async ({ opsgenieApiKey, region, identifier, identifierType, ...body }: any) => {
      try {
        const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/${action}`, {
          method: 'POST',
          region,
          query: { identifierType },
          body,
        });
        if (!result.ok) return failedResult(`Failed to ${name} alert`, result);
        return result.data;
      } catch (error) {
        return toOpsgenieError(error, `Error ${name}ing alert`);
      }
    },
  });
}

export const opsgenieAcknowledgeAlert = alertAction(
  'acknowledge',
  'acknowledge',
  'Acknowledge an alert (stops escalations until snooze/close).',
);
export const opsgenieUnacknowledgeAlert = alertAction(
  'unacknowledge',
  'unacknowledge',
  'Unacknowledge an alert (resume escalations).',
);
export const opsgenieSnoozeAlert = alertAction(
  'snooze',
  'snooze',
  'Snooze an alert until an end time.',
  {
    endTime: z.string().describe('Snooze end ISO datetime'),
  },
);
export const opsgenieCloseAlert = alertAction(
  'close',
  'close',
  'Close an alert with an optional note.',
);
export const opsgenieAssignAlert = alertAction('assign', 'assign', 'Assign an alert owner.', {
  owner: z.record(z.string(), z.any()).describe('Owner {username} or {id, type}'),
});
export const opsgenieEscalateAlert = alertAction(
  'escalate',
  'escalate',
  'Escalate to the next rule set.',
  {
    escalation: z.record(z.string(), z.any()).optional().describe('Escalation {id} or {name}'),
  },
);

export const opsgenieAddAlertNote = tool({
  description: 'Add a note to an alert timeline.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    note: z.string().describe('Note text'),
    user: z.string().optional().describe('Display name of the request owner'),
    source: z.string().optional().describe('Source of the note'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, note, user, source }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/notes`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          note,
          ...(user !== undefined ? { user } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to add alert note', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error adding alert note');
    }
  },
});

export const opsgenieListAlertNotes = tool({
  description: 'List notes on an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/notes`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to list alert notes', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing alert notes');
    }
  },
});

export const opsgenieAddTags = tool({
  description: 'Add tags to an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    tags: z.array(z.string()).min(1).describe('Tags to add'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    tags,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/tags`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          tags,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to add tags', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error adding tags');
    }
  },
});

export const opsgenieRemoveTags = tool({
  description: 'Remove tags from an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    tags: z.array(z.string()).min(1).describe('Tags to remove (or "all")'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, tags }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/tags`, {
        method: 'DELETE',
        region,
        query: { identifierType, tags },
      });
      if (!result.ok) return failedResult('Failed to remove tags', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error removing tags');
    }
  },
});

export const opsgenieAddDetails = tool({
  description: 'Add custom details entries to an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    details: z.record(z.string(), z.string()).describe('Details to add'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    details,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/details`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          details,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to add details', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error adding details');
    }
  },
});

export const opsgenieRemoveDetails = tool({
  description: 'Remove custom details keys from an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    keys: z.array(z.string()).min(1).describe('Detail keys to remove'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, keys }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/details`, {
        method: 'DELETE',
        region,
        query: { identifierType, keys },
      });
      if (!result.ok) return failedResult('Failed to remove details', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error removing details');
    }
  },
});

export const opsgenieAddResponder = tool({
  description: 'Add a responder (user/team/schedule/escalation) to an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    responder: responderField,
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    responder,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/responders`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          responder,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to add responder', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error adding responder');
    }
  },
});

export const opsgenieAddTeam = tool({
  description: 'Route an alert to another team.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    team: z.record(z.string(), z.any()).describe('Team {id} or {name}'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    team,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/teams`, {
        method: 'POST',
        region,
        query: { identifierType },
        body: {
          team,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to add team', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error adding team');
    }
  },
});

export const opsgenieUpdatePriority = tool({
  description: 'Change alert priority (P1 highest).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    priority: z.enum(['P1', 'P2', 'P3', 'P4', 'P5']).describe('New priority'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    priority,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/priority`, {
        method: 'PUT',
        region,
        query: { identifierType },
        body: {
          priority,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update priority', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating priority');
    }
  },
});

export const opsgenieUpdateMessage = tool({
  description: 'Update the alert message text.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    message: z.string().describe('New message'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    message,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/message`, {
        method: 'PUT',
        region,
        query: { identifierType },
        body: {
          message,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update message', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating message');
    }
  },
});

export const opsgenieUpdateDescription = tool({
  description: 'Update the alert description.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    description: z.string().describe('New description'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    description,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/description`, {
        method: 'PUT',
        region,
        query: { identifierType },
        body: {
          description,
          ...(user !== undefined ? { user } : {}),
          ...(note !== undefined ? { note } : {}),
          ...(source !== undefined ? { source } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update description', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating description');
    }
  },
});

export const opsgenieExecuteCustomAction = tool({
  description: 'Run a custom action defined on the alert (e.g. Restart, Scale).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    actionName: z.string().describe('Custom action name from the alert actions list'),
    user: z.string().optional().describe('Display name of the request owner'),
    note: z.string().optional().describe('Note for the audit log'),
    source: z.string().optional().describe('Source of the action'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    identifierType,
    actionName,
    user,
    note,
    source,
  }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/alerts/${identifier}/actions/${actionName}`,
        {
          method: 'POST',
          region,
          query: { identifierType },
          body: {
            ...(user !== undefined ? { user } : {}),
            ...(note !== undefined ? { note } : {}),
            ...(source !== undefined ? { source } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to execute custom action', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error executing custom action');
    }
  },
});

export const opsgenieListAlertLogs = tool({
  description: 'List alert activity logs (state changes, notifications).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/logs`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to list alert logs', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing alert logs');
    }
  },
});

export const opsgenieListAlertRecipients = tool({
  description: 'List who was notified for an alert (users, schedules, escalations).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/recipients`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to list alert recipients', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing alert recipients');
    }
  },
});

export const opsgenieListAlertAttachments = tool({
  description: 'List file attachments on an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/${identifier}/attachments`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to list alert attachments', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing alert attachments');
    }
  },
});

export const opsgenieDeleteAlertAttachment = tool({
  description: 'Delete a file attachment from an alert.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Alert ID, tiny ID, or alias'),
    identifierType: identifierTypeField,
    attachmentId: z.string().describe('Attachment ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, attachmentId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/alerts/${identifier}/attachments/${attachmentId}`,
        { method: 'DELETE', region, query: { identifierType } },
      );
      if (!result.ok) return failedResult('Failed to delete alert attachment', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting alert attachment');
    }
  },
});

export const opsgenieGetAlertRequestStatus = tool({
  description: 'Poll an async alert request (create/delete/action) by request ID.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    requestId: z.string().describe('Request ID from a 202 response'),
  }),
  execute: async ({ opsgenieApiKey, region, requestId }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/alerts/requests/${requestId}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get alert request status', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting alert request status');
    }
  },
});

export const opsgenieCreateSavedSearch = tool({
  description: 'Save an alert search query for reuse.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Search name'),
    query: z.string().describe('Alert search query'),
  }),
  execute: async ({ opsgenieApiKey, region, name, query }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/alerts/saved-searches', {
        method: 'POST',
        region,
        body: { name, query },
      });
      if (!result.ok) return failedResult('Failed to create saved search', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating saved search');
    }
  },
});

export const opsgenieListSavedSearches = tool({
  description: 'List saved alert searches.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/alerts/saved-searches', { region });
      if (!result.ok) return failedResult('Failed to list saved searches', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing saved searches');
    }
  },
});

export const opsgenieGetSavedSearch = tool({
  description: 'Get one saved search.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    searchId: z.string().describe('Saved search ID'),
  }),
  execute: async ({ opsgenieApiKey, region, searchId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/alerts/saved-searches/${searchId}`,
        {
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to get saved search', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting saved search');
    }
  },
});

export const opsgenieUpdateSavedSearch = tool({
  description: 'Update a saved search name or query.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    searchId: z.string().describe('Saved search ID'),
    name: z.string().optional().describe('New name'),
    query: z.string().optional().describe('New query'),
  }),
  execute: async ({ opsgenieApiKey, region, searchId, name, query }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/alerts/saved-searches/${searchId}`,
        {
          method: 'PATCH',
          region,
          body: {
            ...(name !== undefined ? { name } : {}),
            ...(query !== undefined ? { query } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update saved search', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating saved search');
    }
  },
});

export const opsgenieDeleteSavedSearch = tool({
  description: 'Delete a saved search.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    searchId: z.string().describe('Saved search ID'),
  }),
  execute: async ({ opsgenieApiKey, region, searchId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/alerts/saved-searches/${searchId}`,
        {
          method: 'DELETE',
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to delete saved search', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting saved search');
    }
  },
});
