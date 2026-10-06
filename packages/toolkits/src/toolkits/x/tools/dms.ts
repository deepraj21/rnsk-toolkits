// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const eventFields = z
  .array(z.string())
  .optional()
  .describe(
    'DM event fields, e.g. id, text, event_type, dm_conversation_id, created_at, sender_id, attachments, participant_ids',
  );
const expansionsField = z
  .array(z.string())
  .optional()
  .describe(
    'Expansions, e.g. sender_id, participant_ids, referenced_tweets.id, attachments.media_keys',
  );
const userFieldsField = z
  .array(z.string())
  .optional()
  .describe('User fields for expanded participants');
const mediaFieldsField = z
  .array(z.string())
  .optional()
  .describe('Media fields for expanded attachments');
const tweetFieldsField = z
  .array(z.string())
  .optional()
  .describe('Tweet fields for referenced posts');
const eventTypesField = z
  .array(z.string())
  .optional()
  .describe('Event types: MessageCreate, ParticipantsJoin, ParticipantsLeave');
const maxResultsField = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .describe('Results per page (1-100)');
const paginationField = z
  .string()
  .optional()
  .describe('Pagination token from a previous response; omit for the first page');
const attachmentsField = z
  .array(z.object({ mediaId: z.string().describe('Uploaded media ID to attach') }))
  .max(1)
  .optional()
  .describe('Media attachments');

export const xCreateDmConversation = tool({
  description:
    'Create a group DM conversation with participants and an opening message. Requires the dm.write scope.',
  inputSchema: z.object({
    xToken: tokenField,
    conversationType: z.string().describe('Group for group conversations'),
    participantIds: z.array(z.string()).min(1).describe('Participant user IDs'),
    message: z
      .object({ text: z.string().optional(), attachments: attachmentsField })
      .describe('Opening message'),
  }),
  execute: async ({ xToken, conversationType, participantIds, message }) => {
    try {
      const attachments = message?.attachments?.map((a) => ({ media_id: a.mediaId }));
      const result = await xRequest(xToken, '/dm_conversations', {
        method: 'POST',
        body: {
          conversation_type: conversationType,
          participant_ids: participantIds,
          message: {
            ...(message?.text ? { text: message.text } : {}),
            ...(attachments ? { attachments } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create DM conversation', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error creating DM conversation');
    }
  },
});

export const xSendDmToConversation = tool({
  description: 'Send a message with optional media to an existing DM conversation.',
  inputSchema: z.object({
    xToken: tokenField,
    dmConversationId: z.string().describe('DM conversation ID'),
    text: z.string().optional().describe('Message text'),
    attachments: attachmentsField,
  }),
  execute: async ({ xToken, dmConversationId, text, attachments }) => {
    try {
      const result = await xRequest(xToken, `/dm_conversations/${dmConversationId}/messages`, {
        method: 'POST',
        body: {
          ...(text ? { text } : {}),
          ...(attachments
            ? { attachments: attachments.map((a) => ({ media_id: a.mediaId })) }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send DM to conversation', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error sending DM to conversation');
    }
  },
});

export const xSendDmToUser = tool({
  description:
    'Send a new one-to-one DM with text and/or media to a user by user ID. Creates the conversation if needed.',
  inputSchema: z.object({
    xToken: tokenField,
    participantId: z.string().describe('Recipient user ID'),
    text: z.string().optional().describe('Message text (up to 10000 chars)'),
    attachments: attachmentsField,
  }),
  execute: async ({ xToken, participantId, text, attachments }) => {
    try {
      const result = await xRequest(xToken, `/dm_conversations/with/${participantId}/messages`, {
        method: 'POST',
        body: {
          ...(text ? { text } : {}),
          ...(attachments
            ? { attachments: attachments.map((a) => ({ media_id: a.mediaId })) }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send DM to user', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error sending DM to user');
    }
  },
});

export const xDmEventsByParticipant = tool({
  description: 'Get DM events for the one-to-one conversation with a participant user ID.',
  inputSchema: z.object({
    xToken: tokenField,
    participantId: z.string().describe('Participant user ID'),
    maxResults: maxResultsField,
    paginationToken: paginationField,
    eventTypes: eventTypesField,
    dmEventFields: eventFields,
    expansions: expansionsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({
    xToken,
    participantId,
    maxResults,
    paginationToken,
    eventTypes,
    dmEventFields,
    expansions,
    userFields,
    mediaFields,
    tweetFields,
  }) => {
    try {
      const result = await xRequest(xToken, `/dm_conversations/with/${participantId}/dm_events`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          event_types: eventTypes,
          'dm_event.fields': dmEventFields,
          expansions,
          'user.fields': userFields,
          'media.fields': mediaFields,
          'tweet.fields': tweetFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get DM events by participant', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting DM events by participant');
    }
  },
});

export const xDmEventsByConversation = tool({
  description: 'Get DM events for a conversation by DM conversation ID (one-to-one or group).',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('DM conversation ID'),
    maxResults: maxResultsField,
    paginationToken: paginationField,
    eventTypes: eventTypesField,
    dmEventFields: eventFields,
    expansions: expansionsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({
    xToken,
    id,
    maxResults,
    paginationToken,
    eventTypes,
    dmEventFields,
    expansions,
    userFields,
    mediaFields,
    tweetFields,
  }) => {
    try {
      const result = await xRequest(xToken, `/dm_conversations/${id}/dm_events`, {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          event_types: eventTypes,
          'dm_event.fields': dmEventFields,
          expansions,
          'user.fields': userFields,
          'media.fields': mediaFields,
          'tweet.fields': tweetFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get DM conversation events', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting DM conversation events');
    }
  },
});

export const xRecentDmEvents = tool({
  description:
    'Get recent DM events across all conversations of the authenticated user (last 30 days).',
  inputSchema: z.object({
    xToken: tokenField,
    maxResults: maxResultsField,
    paginationToken: paginationField,
    eventTypes: eventTypesField,
    dmEventFields: eventFields,
    expansions: expansionsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({
    xToken,
    maxResults,
    paginationToken,
    eventTypes,
    dmEventFields,
    expansions,
    userFields,
    mediaFields,
    tweetFields,
  }) => {
    try {
      const result = await xRequest(xToken, '/dm_events', {
        query: {
          max_results: maxResults,
          pagination_token: paginationToken,
          event_types: eventTypes,
          'dm_event.fields': dmEventFields,
          expansions,
          'user.fields': userFields,
          'media.fields': mediaFields,
          'tweet.fields': tweetFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get recent DM events', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting recent DM events');
    }
  },
});

export const xGetDmEvent = tool({
  description: 'Get a single DM event by event ID.',
  inputSchema: z.object({
    xToken: tokenField,
    eventId: z.string().describe('DM event ID'),
    dmEventFields: eventFields,
    expansions: expansionsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    tweetFields: tweetFieldsField,
  }),
  execute: async ({
    xToken,
    eventId,
    dmEventFields,
    expansions,
    userFields,
    mediaFields,
    tweetFields,
  }) => {
    try {
      const result = await xRequest(xToken, `/dm_events/${eventId}`, {
        query: {
          'dm_event.fields': dmEventFields,
          expansions,
          'user.fields': userFields,
          'media.fields': mediaFields,
          'tweet.fields': tweetFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get DM event', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting DM event');
    }
  },
});

export const xDeleteDm = tool({
  description: 'Delete a DM event you sent by event ID.',
  inputSchema: z.object({
    xToken: tokenField,
    eventId: z.string().describe('DM event ID to delete'),
  }),
  execute: async ({ xToken, eventId }) => {
    try {
      const result = await xRequest(xToken, `/dm_events/${eventId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete DM', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error deleting DM');
    }
  },
});
