// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError, parseQuery } from './client.js';

export const intercomCreateTicket = tool({
  description: 'Create a support ticket for contacts with type, attributes, and assignment.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketTypeId: z.string(),
    contacts: z
      .array(
        z.object({
          id: z.string().optional(),
          email: z.string().optional(),
          externalId: z.string().optional(),
        }),
      )
      .describe('each with id, email, or externalId'),
    ticketAttributes: z
      .record(z.any())
      .optional()
      .describe('use _default_title_ and _default_description_'),
    assignment: z
      .object({ teamAssigneeId: z.string().optional(), adminAssigneeId: z.string().optional() })
      .optional()
      .describe('teamAssigneeId and/or adminAssigneeId'),
    companyId: z.string().optional(),
    createdAt: z.number().int().optional().describe('unix timestamp'),
    conversationToLinkId: z.string().optional(),
  }),
  execute: async ({
    intercomCredentials,
    ticketTypeId,
    contacts,
    ticketAttributes,
    assignment,
    companyId,
    createdAt,
    conversationToLinkId,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets`, {
        method: 'POST',
        body: {
          ticketTypeId,
          contacts,
          ticketAttributes,
          assignment,
          companyId,
          createdAt,
          conversationToLinkId,
        },
      });
      if (!result.ok) return failedResult('Failed to create ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating ticket');
    }
  },
});

export const intercomEnqueueCreateTicket = tool({
  description: 'Enqueue ticket creation for async processing with validation first.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketTypeId: z.string(),
    contacts: z.array(
      z.object({
        id: z.string().optional(),
        email: z.string().optional(),
        externalId: z.string().optional(),
      }),
    ),
    ticketAttributes: z.record(z.any()).optional(),
    assignment: z
      .object({ teamAssigneeId: z.string().optional(), adminAssigneeId: z.string().optional() })
      .optional(),
    companyId: z.string().optional(),
    createdAt: z.number().int().optional(),
    conversationToLinkId: z.string().optional(),
    skipNotifications: z.boolean().optional().describe('suppress notifications'),
  }),
  execute: async ({
    intercomCredentials,
    ticketTypeId,
    contacts,
    ticketAttributes,
    assignment,
    companyId,
    createdAt,
    conversationToLinkId,
    skipNotifications,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets/enqueue`, {
        method: 'POST',
        body: {
          ticketTypeId,
          contacts,
          ticketAttributes,
          assignment,
          companyId,
          createdAt,
          conversationToLinkId,
          skipNotifications,
        },
      });
      if (!result.ok) return failedResult('Failed to enqueue create ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error enqueue create ticket');
    }
  },
});

export const intercomGetTicket = tool({
  description: 'Fetch a ticket with state, type, attributes, and contacts.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketId: z.string().describe('internal id, not the inbox number'),
  }),
  execute: async ({ intercomCredentials, ticketId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets/${ticketId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to get ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting ticket');
    }
  },
});

export const intercomUpdateTicket = tool({
  description: 'Update ticket attributes, state, assignment, sharing, or snooze.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketId: z.string(),
    open: z.boolean().optional().describe('false closes and unsnoozes'),
    isShared: z.boolean().optional().describe('customer visibility'),
    companyId: z.string().optional().describe('empty string removes association'),
    assigneeId: z.string().optional().describe('admin/team ID, 0 unassigns'),
    snoozedUntil: z.number().int().optional().describe('reopen timestamp'),
    ticketStateId: z.string().optional(),
    ticketAttributes: z.record(z.any()).optional(),
    adminId: z.number().int().optional().describe('acting admin, needed for workflows'),
  }),
  execute: async ({
    intercomCredentials,
    ticketId,
    open,
    isShared,
    companyId,
    assigneeId,
    snoozedUntil,
    ticketStateId,
    ticketAttributes,
    adminId,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets/${ticketId}`, {
        method: 'PUT',
        body: {
          ticketId,
          open,
          isShared,
          companyId,
          assigneeId,
          snoozedUntil,
          ticketStateId,
          ticketAttributes,
          adminId,
        },
      });
      if (!result.ok) return failedResult('Failed to update ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating ticket');
    }
  },
});

export const intercomDeleteTicket = tool({
  description: 'Permanently delete a ticket.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketId: z.string(),
  }),
  execute: async ({ intercomCredentials, ticketId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error deleting ticket');
    }
  },
});

export const intercomSearchTickets = tool({
  description: 'Search tickets by state, dates, assignees, or custom attributes.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    query: z.union([z.string(), z.record(z.any())]).describe('filter object or JSON string'),
    perPage: z.number().int().optional().describe('max 150'),
    startingAfter: z.string().optional().describe('pagination cursor'),
  }),
  execute: async ({ intercomCredentials, query, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets/search`, {
        method: 'POST',
        body: {
          query: parseQuery(query),
          ...(perPage !== undefined || startingAfter
            ? {
                pagination: {
                  ...(perPage !== undefined ? { per_page: perPage } : {}),
                  ...(startingAfter ? { starting_after: startingAfter } : {}),
                },
              }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to search tickets', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error searching tickets');
    }
  },
});

export const intercomReplyTicket = tool({
  description: 'Reply to a ticket as an admin (comment/note) or on behalf of a contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketId: z.string(),
    messageType: z.string().describe('comment, note, or quick_reply'),
    body: z.string().describe('reply content'),
    adminId: z.string().optional().describe('required for admin replies'),
    email: z.string().optional().describe('contact email for contact replies'),
    userId: z.string().optional().describe('contact user_id'),
    intercomUserId: z.string().optional().describe('Intercom contact ID'),
    createdAt: z.number().int().optional(),
    attachmentUrls: z.array(z.string()).optional(),
  }),
  execute: async ({
    intercomCredentials,
    ticketId,
    messageType,
    body,
    adminId,
    email,
    userId,
    intercomUserId,
    createdAt,
    attachmentUrls,
  }) => {
    try {
      const replyBody: Record<string, any> = adminId
        ? { message_type: messageType, type: 'admin', admin_id: adminId, body }
        : { message_type: messageType, type: 'user', body };
      if (!adminId) {
        if (email) replyBody.email = email;
        if (userId) replyBody.user_id = userId;
        if (intercomUserId) replyBody.intercom_user_id = intercomUserId;
        if (createdAt !== undefined) replyBody.created_at = createdAt;
      }
      if (attachmentUrls) replyBody.attachment_urls = attachmentUrls;
      const result = await intercomRequest(intercomCredentials, `/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: replyBody,
      });
      if (!result.ok) return failedResult('Failed to reply to ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error replying to ticket');
    }
  },
});

export const intercomCreateTicketType = tool({
  description: 'Create a ticket type defining structure and workflow for tickets.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    name: z.string(),
    category: z.string().describe('Customer, Back-office, or Tracker'),
    description: z.string().optional(),
    icon: z.string().optional().describe('emoji'),
    isInternal: z.boolean().optional().describe('internal-only tickets'),
  }),
  execute: async ({ intercomCredentials, name, category, description, icon, isInternal }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ticket_types`, {
        method: 'POST',
        body: { name, category, description, icon, isInternal },
      });
      if (!result.ok) return failedResult('Failed to create ticket type', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating ticket type');
    }
  },
});

export const intercomGetTicketType = tool({
  description: 'Fetch a ticket type with attributes and states.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketTypeId: z.string(),
  }),
  execute: async ({ intercomCredentials, ticketTypeId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ticket_types/${ticketTypeId}`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to get ticket type', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting ticket type');
    }
  },
});

export const intercomListTicketTypes = tool({
  description: 'List all ticket types in the workspace.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ticket_types`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to list ticket types', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing ticket types');
    }
  },
});

export const intercomUpdateTicketType = tool({
  description: 'Update a ticket type name, description, category, icon, or archive flag.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketTypeId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    icon: z.string().optional(),
    isInternal: z.boolean().optional(),
    archived: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    ticketTypeId,
    name,
    description,
    category,
    icon,
    isInternal,
    archived,
  }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ticket_types/${ticketTypeId}`, {
        method: 'PUT',
        body: { name, description, category, icon, isInternal, archived },
      });
      if (!result.ok) return failedResult('Failed to update ticket type', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating ticket type');
    }
  },
});

export const intercomCreateTicketTypeAttribute = tool({
  description: 'Add a custom attribute field to a ticket type.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketTypeId: z.string(),
    name: z.string(),
    description: z.string(),
    dataType: z.string().describe('string, list, integer, decimal, boolean, datetime, files'),
    multiline: z.boolean().optional().describe('string only'),
    listItems: z.string().optional().describe('comma-delimited, list only'),
    visibleOnCreate: z.boolean().optional(),
    requiredToCreate: z.boolean().optional(),
    visibleToContacts: z.boolean().optional(),
    allowMultipleValues: z.boolean().optional().describe('files only'),
    requiredToCreateForContacts: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    ticketTypeId,
    name,
    description,
    dataType,
    multiline,
    listItems,
    visibleOnCreate,
    requiredToCreate,
    visibleToContacts,
    allowMultipleValues,
    requiredToCreateForContacts,
  }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/ticket_types/${ticketTypeId}/attributes`,
        {
          method: 'POST',
          body: {
            name,
            description,
            dataType,
            multiline,
            listItems,
            visibleOnCreate,
            requiredToCreate,
            visibleToContacts,
            allowMultipleValues,
            requiredToCreateForContacts,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create ticket type attribute', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating ticket type attribute');
    }
  },
});

export const intercomUpdateTicketTypeAttribute = tool({
  description: 'Update a ticket type attribute description, visibility, or requirements.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketTypeId: z.string(),
    attributeId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    multiline: z.boolean().optional(),
    listItems: z.string().optional(),
    visibleOnCreate: z.boolean().optional(),
    requiredToCreate: z.boolean().optional(),
    visibleToContacts: z.boolean().optional(),
    allowMultipleValues: z.boolean().optional(),
    requiredToCreateForContacts: z.boolean().optional(),
  }),
  execute: async ({
    intercomCredentials,
    ticketTypeId,
    attributeId,
    name,
    description,
    multiline,
    listItems,
    visibleOnCreate,
    requiredToCreate,
    visibleToContacts,
    allowMultipleValues,
    requiredToCreateForContacts,
  }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/ticket_types/${ticketTypeId}/attributes/${attributeId}`,
        {
          method: 'PUT',
          body: {
            name,
            description,
            multiline,
            listItems,
            visibleOnCreate,
            requiredToCreate,
            visibleToContacts,
            allowMultipleValues,
            requiredToCreateForContacts,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update ticket type attribute', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error updating ticket type attribute');
    }
  },
});

export const intercomListTicketStates = tool({
  description: 'Fetch all ticket states including archived ones.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
  }),
  execute: async ({ intercomCredentials }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/ticket_states`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to list ticket states', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing ticket states');
    }
  },
});

export const intercomAttachTagToTicket = tool({
  description: 'Attach a tag to a ticket.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketId: z.string(),
    tagId: z.string(),
    adminId: z.string().describe('acting admin ID'),
  }),
  execute: async ({ intercomCredentials, ticketId, tagId, adminId }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/tickets/${ticketId}/tags`, {
        method: 'POST',
        body: { id: tagId, admin_id: adminId },
      });
      if (!result.ok) return failedResult('Failed to attach tag to ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error attaching tag to ticket');
    }
  },
});

export const intercomDetachTagFromTicket = tool({
  description: 'Remove a tag from a ticket.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    ticketId: z.string(),
    tagId: z.string(),
    adminId: z.string().describe('acting admin ID'),
  }),
  execute: async ({ intercomCredentials, ticketId, tagId, adminId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/tickets/${ticketId}/tags/${tagId}`,
        { method: 'DELETE', query: { adminId: adminId } },
      );
      if (!result.ok) return failedResult('Failed to detach tag from ticket', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error detaching tag from ticket');
    }
  },
});
