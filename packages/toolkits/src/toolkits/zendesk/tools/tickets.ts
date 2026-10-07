// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zendeskRequest, failedResult, toZendeskError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Zendesk credentials JSON with subdomain, plus email+apiToken (API token) or accessToken (OAuth)',
  );
const ticketIdField = z.number().int().describe('Ticket ID');

const ticketField = z
  .record(z.string(), z.any())
  .describe(
    'Ticket object: subject, comment {body, public}, requester_id, submitter_id, assignee_id, group_id, type, priority, status, tags, custom_fields [{id, value}], external_id, organization_id',
  );

export const zendeskListTickets = tool({
  description:
    'List tickets with cursor pagination and sideloads. Use incremental exports for full syncs.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    perPage: z.number().int().min(1).max(100).optional().describe('Tickets per page'),
    pageAfter: z.string().optional().describe('Cursor from previous response links'),
    include: z.string().optional().describe('Sideloads, e.g. users,groups,organizations'),
  }),
  execute: async ({ zendeskCredentials, perPage, pageAfter, include }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/tickets.json', {
        query: { per_page: perPage, 'page[after]': pageAfter, include },
      });
      if (!result.ok) return failedResult('Failed to list tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing tickets');
    }
  },
});

export const zendeskGetTicket = tool({
  description: 'Get one ticket with all fields, tags, and collaborators.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
  }),
  execute: async ({ zendeskCredentials, ticketId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}.json`);
      if (!result.ok) return failedResult('Failed to get ticket', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting ticket');
    }
  },
});

export const zendeskCreateTicket = tool({
  description: 'Create a ticket with subject, requester, comment, priority, and custom fields.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticket: ticketField,
  }),
  execute: async ({ zendeskCredentials, ticket }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/tickets.json', {
        method: 'POST',
        body: { ticket },
      });
      if (!result.ok) return failedResult('Failed to create ticket', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating ticket');
    }
  },
});

export const zendeskUpdateTicket = tool({
  description: 'Update a ticket: status, assignee, tags, custom fields, or add a comment.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
    ticket: ticketField,
  }),
  execute: async ({ zendeskCredentials, ticketId, ticket }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}.json`, {
        method: 'PUT',
        body: { ticket },
      });
      if (!result.ok) return failedResult('Failed to update ticket', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating ticket');
    }
  },
});

export const zendeskDeleteTicket = tool({
  description: 'Delete a ticket (moves to suspended/deleted state per plan).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
  }),
  execute: async ({ zendeskCredentials, ticketId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ticket', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toZendeskError(error, 'Error deleting ticket');
    }
  },
});

export const zendeskCreateManyTickets = tool({
  description: 'Create up to 100 tickets in one call. Use for migrations.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    tickets: z.array(ticketField).min(1).max(100).describe('Tickets to create'),
  }),
  execute: async ({ zendeskCredentials, tickets }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/tickets/create_many.json', {
        method: 'POST',
        body: { tickets },
      });
      if (!result.ok) return failedResult('Failed to create tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating tickets');
    }
  },
});

export const zendeskUpdateManyTickets = tool({
  description: 'Update up to 100 tickets by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('Ticket IDs'),
    ticket: ticketField,
  }),
  execute: async ({ zendeskCredentials, ids, ticket }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/tickets/update_many.json', {
        method: 'PUT',
        query: { ids },
        body: { ticket },
      });
      if (!result.ok) return failedResult('Failed to update tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating tickets');
    }
  },
});

export const zendeskDeleteManyTickets = tool({
  description: 'Delete up to 100 tickets by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('Ticket IDs'),
  }),
  execute: async ({ zendeskCredentials, ids }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/tickets/destroy_many.json', {
        method: 'DELETE',
        query: { ids },
      });
      if (!result.ok) return failedResult('Failed to delete tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting tickets');
    }
  },
});

export const zendeskMergeTickets = tool({
  description: 'Merge source tickets into a target ticket with audit comments.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
    ids: z.array(z.number().int()).min(1).describe('Source ticket IDs to merge in'),
    targetComment: z.string().optional().describe('Comment added to the target ticket'),
    sourceComment: z.string().optional().describe('Comment added to source tickets'),
  }),
  execute: async ({ zendeskCredentials, ticketId, ids, targetComment, sourceComment }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}/merge.json`, {
        method: 'POST',
        body: {
          ids,
          ...(targetComment !== undefined ? { target_comment: targetComment } : {}),
          ...(sourceComment !== undefined ? { source_comment: sourceComment } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to merge tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error merging tickets');
    }
  },
});

export const zendeskImportTicket = tool({
  description: 'Import a ticket with historical timestamps and archived comments (migration).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticket: ticketField,
  }),
  execute: async ({ zendeskCredentials, ticket }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/imports/tickets.json', {
        method: 'POST',
        body: { ticket },
      });
      if (!result.ok) return failedResult('Failed to import ticket', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error importing ticket');
    }
  },
});

export const zendeskImportManyTickets = tool({
  description: 'Bulk import tickets with history (migration). Returns a job status.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    tickets: z.array(ticketField).min(1).describe('Tickets to import'),
  }),
  execute: async ({ zendeskCredentials, tickets }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/imports/tickets/create_many.json', {
        method: 'POST',
        body: { tickets },
      });
      if (!result.ok) return failedResult('Failed to import tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error importing tickets');
    }
  },
});

export const zendeskListTicketComments = tool({
  description: 'List comments (public replies + internal notes) on a ticket.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
  }),
  execute: async ({ zendeskCredentials, ticketId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}/comments.json`);
      if (!result.ok) return failedResult('Failed to list ticket comments', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing ticket comments');
    }
  },
});

export const zendeskRedactComment = tool({
  description: 'Redact sensitive text (e.g. credit card numbers) from a ticket comment.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
    commentId: z.number().int().describe('Comment ID'),
    text: z.string().describe('Replacement text, e.g. [REDACTED]'),
  }),
  execute: async ({ zendeskCredentials, ticketId, commentId, text }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/tickets/${ticketId}/comments/${commentId}/redact.json`,
        { method: 'PUT', body: { text } },
      );
      if (!result.ok) return failedResult('Failed to redact comment', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error redacting comment');
    }
  },
});

export const zendeskListTicketAudits = tool({
  description: 'List change audits (history) of a ticket.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
  }),
  execute: async ({ zendeskCredentials, ticketId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}/audits.json`);
      if (!result.ok) return failedResult('Failed to list ticket audits', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing ticket audits');
    }
  },
});

export const zendeskGetTicketAudit = tool({
  description: 'Get one ticket audit with events.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    auditId: z.number().int().describe('Audit ID'),
  }),
  execute: async ({ zendeskCredentials, auditId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_audits/${auditId}.json`);
      if (!result.ok) return failedResult('Failed to get ticket audit', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting ticket audit');
    }
  },
});

export const zendeskTrustTicketAudit = tool({
  description: 'Mark an audit record as trusted (verified actor).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    auditId: z.number().int().describe('Audit ID'),
  }),
  execute: async ({ zendeskCredentials, auditId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/ticket_audits/${auditId}/trust.json`,
        {
          method: 'PUT',
        },
      );
      if (!result.ok) return failedResult('Failed to trust ticket audit', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error trusting ticket audit');
    }
  },
});

export const zendeskGetTicketMetrics = tool({
  description: 'Get SLA metrics of a ticket: reply times, resolution, first response.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ticketId: ticketIdField,
  }),
  execute: async ({ zendeskCredentials, ticketId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/tickets/${ticketId}/metrics.json`);
      if (!result.ok) return failedResult('Failed to get ticket metrics', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting ticket metrics');
    }
  },
});

export const zendeskCountTickets = tool({
  description: 'Count tickets, optionally scoped to an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().optional().describe('Organization ID'),
  }),
  execute: async ({ zendeskCredentials, organizationId }) => {
    try {
      const path =
        organizationId !== undefined
          ? `/organizations/${organizationId}/tickets/count.json`
          : '/tickets/count.json';
      const result = await zendeskRequest(zendeskCredentials, path);
      if (!result.ok) return failedResult('Failed to count tickets', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error counting tickets');
    }
  },
});

export const zendeskListTicketFields = tool({
  description: 'List ticket fields (system + custom) with types and options.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/ticket_fields.json');
      if (!result.ok) return failedResult('Failed to list ticket fields', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing ticket fields');
    }
  },
});

export const zendeskGetTicketField = tool({
  description: 'Get one ticket field definition.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    fieldId: z.number().int().describe('Field ID'),
  }),
  execute: async ({ zendeskCredentials, fieldId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_fields/${fieldId}.json`);
      if (!result.ok) return failedResult('Failed to get ticket field', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting ticket field');
    }
  },
});

export const zendeskCreateTicketField = tool({
  description: 'Create a custom ticket field (text, tagger, checkbox, date, ...).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    field: z
      .record(z.string(), z.any())
      .describe('Field: type, title, custom_field_options for tagger'),
  }),
  execute: async ({ zendeskCredentials, field }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/ticket_fields.json', {
        method: 'POST',
        body: { ticket_field: field },
      });
      if (!result.ok) return failedResult('Failed to create ticket field', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating ticket field');
    }
  },
});

export const zendeskUpdateTicketField = tool({
  description: 'Update a custom ticket field.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    fieldId: z.number().int().describe('Field ID'),
    field: z.record(z.string(), z.any()).describe('Field attributes to update'),
  }),
  execute: async ({ zendeskCredentials, fieldId, field }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_fields/${fieldId}.json`, {
        method: 'PUT',
        body: { ticket_field: field },
      });
      if (!result.ok) return failedResult('Failed to update ticket field', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating ticket field');
    }
  },
});

export const zendeskDeleteTicketField = tool({
  description: 'Delete a custom ticket field.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    fieldId: z.number().int().describe('Field ID'),
  }),
  execute: async ({ zendeskCredentials, fieldId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_fields/${fieldId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ticket field', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting ticket field');
    }
  },
});

export const zendeskListTicketForms = tool({
  description: 'List ticket forms for structured intake.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/ticket_forms.json');
      if (!result.ok) return failedResult('Failed to list ticket forms', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing ticket forms');
    }
  },
});

export const zendeskGetTicketForm = tool({
  description: 'Get one ticket form with end-user field visibility.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    formId: z.number().int().describe('Form ID'),
  }),
  execute: async ({ zendeskCredentials, formId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_forms/${formId}.json`);
      if (!result.ok) return failedResult('Failed to get ticket form', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting ticket form');
    }
  },
});

export const zendeskCreateTicketForm = tool({
  description: 'Create a ticket form (name + ticket field IDs).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    form: z.record(z.string(), z.any()).describe('Form: name, ticket_field_ids, active'),
  }),
  execute: async ({ zendeskCredentials, form }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/ticket_forms.json', {
        method: 'POST',
        body: { ticket_form: form },
      });
      if (!result.ok) return failedResult('Failed to create ticket form', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating ticket form');
    }
  },
});

export const zendeskUpdateTicketForm = tool({
  description: 'Update a ticket form.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    formId: z.number().int().describe('Form ID'),
    form: z.record(z.string(), z.any()).describe('Form attributes to update'),
  }),
  execute: async ({ zendeskCredentials, formId, form }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_forms/${formId}.json`, {
        method: 'PUT',
        body: { ticket_form: form },
      });
      if (!result.ok) return failedResult('Failed to update ticket form', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating ticket form');
    }
  },
});

export const zendeskDeleteTicketForm = tool({
  description: 'Delete a ticket form.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    formId: z.number().int().describe('Form ID'),
  }),
  execute: async ({ zendeskCredentials, formId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/ticket_forms/${formId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ticket form', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting ticket form');
    }
  },
});

export const zendeskSearch = tool({
  description:
    'Search tickets, users, organizations, and articles with Zendesk query syntax (status:open, requester:x, ...).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    query: z
      .string()
      .describe('Search query, e.g. "status:open priority:urgent" (type: prefix scopes the type)'),
    sortBy: z.string().optional().describe('Sort field, e.g. created_at, updated_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    perPage: z.number().int().min(1).max(100).optional().describe('Results per page'),
    page: z.number().int().min(1).optional().describe('Page number'),
  }),
  execute: async ({ zendeskCredentials, query, sortBy, sortOrder, perPage, page }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/search.json', {
        query: { query, sort_by: sortBy, sort_order: sortOrder, per_page: perPage, page },
      });
      if (!result.ok) return failedResult('Failed to search', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error searching');
    }
  },
});

export const zendeskExportSearch = tool({
  description: 'Export large search result sets with cursor pagination (1000+ results).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    query: z.string().describe('Search query'),
    filterType: z.string().optional().describe('Result type filter, e.g. ticket, user'),
    pageSize: z.number().int().min(1).max(1000).optional().describe('Results per page'),
    pageAfter: z.string().optional().describe('Cursor from previous response meta'),
  }),
  execute: async ({ zendeskCredentials, query, filterType, pageSize, pageAfter }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/search/export.json', {
        query: {
          query,
          'filter[type]': filterType,
          'page[size]': pageSize,
          'page[after]': pageAfter,
        },
      });
      if (!result.ok) return failedResult('Failed to export search', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error exporting search');
    }
  },
});
