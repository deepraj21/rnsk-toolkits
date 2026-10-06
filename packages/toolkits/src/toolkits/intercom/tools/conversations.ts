// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intercomRequest, failedResult, toIntercomError, parseQuery } from './client.js';

export const intercomCreateConversation = tool({
  description:
    'Start a contact-initiated style conversation with a message from a user or contact.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    body: z.string().describe('message content (HTML not supported)'),
    fromUserId: z.string().optional().describe('user contact ID'),
    fromContactId: z.string().optional().describe('contact ID'),
    fromAdminId: z.string().optional().describe('admin creating on behalf (needs a contact too)'),
    subject: z.string().optional().describe('email subject (email messages)'),
    messageType: z.string().optional().describe('inapp or email'),
  }),
  execute: async ({
    intercomCredentials,
    body,
    fromUserId,
    fromContactId,
    fromAdminId,
    subject,
  }) => {
    try {
      const from = fromUserId
        ? { type: 'user', id: fromUserId }
        : fromContactId
          ? { type: 'contact', id: fromContactId }
          : null;
      if (!from) return { error: 'Provide fromUserId or fromContactId to start the conversation.' };
      void fromAdminId;
      const result = await intercomRequest(intercomCredentials, '/conversations', {
        method: 'POST',
        body: { from, body, ...(subject ? { subject } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error creating conversation');
    }
  },
});

export const intercomGetConversation = tool({
  description: 'Retrieve a conversation with messages and details. Prefer this for full context.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string(),
    displayAs: z.string().optional().describe('plaintext or html'),
  }),
  execute: async ({ intercomCredentials, conversationId, displayAs }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}`,
        { method: 'GET', query: { displayAs: displayAs } },
      );
      if (!result.ok) return failedResult('Failed to get conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error getting conversation');
    }
  },
});

export const intercomListConversations = tool({
  description: 'List conversations with cursor pagination. No filtering; use search instead.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    perPage: z.number().int().optional().describe('1-150'),
    startingAfter: z.string().optional().describe('cursor from pages.next'),
  }),
  execute: async ({ intercomCredentials, perPage, startingAfter }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/conversations`, {
        method: 'GET',
        query: { perPage: perPage, startingAfter: startingAfter },
      });
      if (!result.ok) return failedResult('Failed to list conversations', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error listing conversations');
    }
  },
});

export const intercomSearchConversations = tool({
  description: 'Search conversations by state, dates, assignees, tags, and more.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    query: z
      .union([z.string(), z.record(z.any())])
      .describe(
        'filter object or JSON string, e.g. {"field":"state","operator":"=","value":"open"}',
      ),
    perPage: z.number().int().optional().describe('1-150'),
    startingAfter: z.string().optional().describe('pagination cursor'),
    sortField: z.string().optional().describe('created_at, updated_at, or waiting_since'),
    sortOrder: z.string().optional().describe('ascending or descending'),
  }),
  execute: async ({ intercomCredentials, query, perPage, startingAfter, sortField, sortOrder }) => {
    try {
      const result = await intercomRequest(intercomCredentials, `/conversations/search`, {
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
          ...(sortField || sortOrder
            ? { sort: { field: sortField ?? 'updated_at', order: sortOrder ?? 'descending' } }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to search conversations', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error searching conversations');
    }
  },
});

export const intercomReplyToConversation = tool({
  description: 'Send an admin reply (comment or note) to a conversation. Reply before closing.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string(),
    adminId: z.string().describe('replying admin ID'),
    messageBody: z.string().describe('reply content'),
    messageType: z.string().optional().describe('comment or note'),
    attachmentUrls: z.array(z.string()).optional().describe('public image URLs, max 10'),
  }),
  execute: async ({
    intercomCredentials,
    conversationId,
    adminId,
    messageBody,
    messageType,
    attachmentUrls,
  }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/reply`,
        {
          method: 'POST',
          body: {
            message_type: messageType ?? 'comment',
            type: 'admin',
            admin_id: adminId,
            body: messageBody,
            ...(attachmentUrls ? { attachment_urls: attachmentUrls } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to reply to conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error replying to conversation');
    }
  },
});

export const intercomCloseConversation = tool({
  description: 'Close (resolve) a conversation, optionally with a closing message.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string().describe('must be open; verify via get first'),
    adminId: z.string().describe('closing admin ID'),
    body: z.string().optional().describe('closing message'),
  }),
  execute: async ({ intercomCredentials, conversationId, adminId, body }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/parts`,
        {
          method: 'POST',
          body: {
            message_type: 'close',
            type: 'admin',
            admin_id: adminId,
            ...(body ? { body } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to close conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error closing conversation');
    }
  },
});

export const intercomReopenConversation = tool({
  description: 'Reopen a closed conversation, optionally with a message.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string().describe('must be closed; verify via get first'),
    adminId: z.string().describe('reopening admin ID'),
    body: z.string().optional().describe('message to send on reopen'),
  }),
  execute: async ({ intercomCredentials, conversationId, adminId, body }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/parts`,
        {
          method: 'POST',
          body: { message_type: 'open', admin_id: adminId, ...(body ? { body } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to reopen conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error reopening conversation');
    }
  },
});

export const intercomAssignConversation = tool({
  description: 'Assign a conversation to an admin or a team.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string(),
    teamId: z.string().optional().describe('team to assign to'),
    adminId: z.string().optional().describe('admin to assign to'),
    assigneeId: z.string().optional().describe('performing admin ID (defaults to adminId)'),
    body: z.string().optional().describe('message sent on assignment'),
  }),
  execute: async ({ intercomCredentials, conversationId, teamId, adminId, assigneeId, body }) => {
    try {
      const targetId = teamId ?? adminId;
      const performerId = assigneeId ?? adminId;
      if (!targetId) return { error: 'Provide teamId or adminId as the assignment target.' };
      if (!performerId)
        return { error: 'Provide assigneeId (or adminId) as the performing admin.' };
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/parts`,
        {
          method: 'POST',
          body: {
            message_type: 'assignment',
            type: teamId ? 'team' : 'admin',
            admin_id: performerId,
            assignee_id: targetId,
            ...(body ? { body } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to assign conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error assigning conversation');
    }
  },
});

export const intercomAttachContactToConversation = tool({
  description: 'Add a contact participant to a conversation as an admin.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string(),
    adminId: z.string().describe('admin adding the participant'),
    customer: z
      .object({
        id: z.string().optional(),
        email: z.string().optional(),
        userId: z.string().optional(),
        intercomUserId: z.string().optional(),
      })
      .describe('one of id, email, userId, intercomUserId'),
  }),
  execute: async ({ intercomCredentials, conversationId, adminId, customer }) => {
    try {
      const ref: Record<string, string> = {};
      if (customer.id) ref.id = customer.id;
      if (customer.email) ref.email = customer.email;
      if (customer.userId) ref.user_id = customer.userId;
      if (customer.intercomUserId) ref.intercom_user_id = customer.intercomUserId;
      if (Object.keys(ref).length === 0)
        return { error: 'Customer needs one of id, email, userId, or intercomUserId.' };
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/customers`,
        { method: 'POST', body: { admin_id: adminId, customer: ref } },
      );
      if (!result.ok) return failedResult('Failed to attach contact to conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error attaching contact to conversation');
    }
  },
});

export const intercomAttachTagToConversation = tool({
  description: 'Attach a tag to a conversation.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string(),
    tagId: z.string().describe('tag ID'),
    adminId: z.string().describe('acting admin ID'),
  }),
  execute: async ({ intercomCredentials, conversationId, tagId, adminId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/tags`,
        { method: 'POST', body: { id: tagId, admin_id: adminId } },
      );
      if (!result.ok) return failedResult('Failed to attach tag to conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error attaching tag to conversation');
    }
  },
});

export const intercomDetachTagFromConversation = tool({
  description: 'Remove a tag from a conversation.',
  inputSchema: z.object({
    intercomCredentials: z
      .string()
      .describe('Intercom credentials JSON with accessToken and optional baseUrl'),
    conversationId: z.string(),
    tagId: z.string(),
    adminId: z.string().describe('acting admin ID'),
  }),
  execute: async ({ intercomCredentials, conversationId, tagId, adminId }) => {
    try {
      const result = await intercomRequest(
        intercomCredentials,
        `/conversations/${conversationId}/tags/${tagId}`,
        { method: 'DELETE', query: { adminId: adminId } },
      );
      if (!result.ok) return failedResult('Failed to detach tag from conversation', result);
      return result.data;
    } catch (error) {
      return toIntercomError(error, 'Error detaching tag from conversation');
    }
  },
});
