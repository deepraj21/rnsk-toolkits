// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotGetBlogPost = tool({
  description: 'Retrieves one HubSpot CMS blog post by post ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    postId: z.string().describe('Unique HubSpot ID of the blog post to retrieve.'),
    archived: z
      .boolean()
      .optional()
      .describe('Whether to retrieve the archived version of the blog post.'),
    property: z.string().optional().describe('A blog post property to include in the response.'),
  }),
  execute: async ({ hubspotToken, postId, archived, property }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/cms/v3/blogs/posts/${encodeURIComponent(String(postId))}`, {
      query: pickDefined({ archived, properties: property }),
    });
  },
});

export const hubspotListConversationThreads = tool({
  description: 'Lists HubSpot conversation threads with filtering and forward pagination.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    sort: z
      .array(z.string())
      .optional()
      .describe(
        'Sort expressions to apply in order; prefix a field with `-` for descending order.',
      ),
    after: z
      .string()
      .optional()
      .describe("Cursor from a previous response's `paging.next.after` value."),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of conversation threads to return on this page.'),
    inboxId: z
      .array(z.string())
      .optional()
      .describe(
        'Return threads from any of these conversations inbox IDs, represented as strings to preserve 64-bit values.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe('Whether to return only archived conversation threads.'),
    property: z
      .string()
      .optional()
      .describe('Conversation thread property to include in the response.'),
    association: z
      .array(z.string())
      .optional()
      .describe('Association types to include. HubSpot currently supports `TICKET`.'),
    threadStatus: z
      .enum(['CLOSED', 'OPEN'])
      .optional()
      .describe('Return only conversation threads with this status.'),
    associatedTicketId: z
      .string()
      .optional()
      .describe(
        'Return threads associated with this HubSpot ticket ID, represented as a string to preserve 64-bit values.',
      ),
    associatedContactId: z
      .string()
      .optional()
      .describe(
        'Return threads associated with this HubSpot contact ID, represented as a string to preserve 64-bit values.',
      ),
    latestMessageTimestampAfter: z
      .string()
      .optional()
      .describe('Return threads whose latest message is after this ISO 8601 timestamp.'),
  }),
  execute: async ({
    hubspotToken,
    sort,
    after,
    limit,
    inboxId,
    archived,
    property,
    association,
    threadStatus,
    associatedTicketId,
    associatedContactId,
    latestMessageTimestampAfter,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/conversations/v3/conversations/threads`, {
      query: pickDefined({
        sort: sort,
        after: after,
        limit: limit,
        inboxId: inboxId,
        archived: archived,
        property: property,
        association: association,
        threadStatus: threadStatus,
        associatedTicketId: associatedTicketId,
        associatedContactId: associatedContactId,
        latestMessageTimestampAfter: latestMessageTimestampAfter,
      }),
    });
  },
});

export const hubspotListSequences = tool({
  description: 'Lists automation sequences for a specific HubSpot user.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z.string().optional().describe('Sequence name used to filter the results.'),
    after: z
      .string()
      .optional()
      .describe("Cursor from a previous response's `paging.next.after` value."),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of sequences to return on this page.'),
    userId: z.string().describe('HubSpot user ID whose sequences should be returned.'),
  }),
  execute: async ({ hubspotToken, name, after, limit, userId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/automation/v4/sequences/`, {
      query: pickDefined({ name: name, after: after, limit: limit, userId: userId }),
    });
  },
});

export const hubspotListSitePages = tool({
  description: 'Return one cursor-controlled page of HubSpot website pages.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    sort: z
      .array(z.string())
      .optional()
      .describe(
        'Sort expressions using name, createdAt, updatedAt, createdBy, or updatedBy; prefix a field with - for descending order.',
      ),
    after: z
      .string()
      .optional()
      .describe('Cursor from paging.next.after in the previous response; omit for the first page.'),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum pages in this response. HubSpot documents a default of 100 and no numeric maximum.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe('Return archived (deleted) pages instead of active pages.'),
    property: z
      .string()
      .optional()
      .describe('Optional page property selector accepted by HubSpot.'),
    createdAt: z
      .string()
      .optional()
      .describe('Return pages created at this exact ISO 8601 date-time.'),
    updatedAt: z
      .string()
      .optional()
      .describe('Return pages updated at this exact ISO 8601 date-time.'),
    createdAfter: z
      .string()
      .optional()
      .describe('Return pages created after this ISO 8601 date-time.'),
    updatedAfter: z
      .string()
      .optional()
      .describe('Return pages updated after this ISO 8601 date-time.'),
    createdBefore: z
      .string()
      .optional()
      .describe('Return pages created before this ISO 8601 date-time.'),
    updatedBefore: z
      .string()
      .optional()
      .describe('Return pages updated before this ISO 8601 date-time.'),
  }),
  execute: async ({
    hubspotToken,
    sort,
    after,
    limit,
    archived,
    property,
    createdAt,
    updatedAt,
    createdAfter,
    updatedAfter,
    createdBefore,
    updatedBefore,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/cms/v3/pages/site-pages`, {
      query: pickDefined({
        sort: sort,
        after: after,
        limit: limit,
        archived: archived,
        property: property,
        created_at: createdAt,
        updated_at: updatedAt,
        created_after: createdAfter,
        updated_after: updatedAfter,
        created_before: createdBefore,
        updated_before: updatedBefore,
      }),
    });
  },
});
