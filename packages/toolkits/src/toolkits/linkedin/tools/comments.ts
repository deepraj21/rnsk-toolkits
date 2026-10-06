// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { linkedInRequest, missingToken, toLinkedInError } from './client.js';

const authField = {
  linkedinToken: z.string().optional().describe('Injected by system; do not provide'),
};

export const linkedinCreateComment = tool({
  description:
    'Comment on a LinkedIn share or UGC post, or reply to an existing comment. Supports @-mentions via attributes and image attachments via image URNs.',
  inputSchema: z.object({
    ...authField,
    targetUrn: z
      .string()
      .describe(
        "Where the comment goes: 'urn:li:share:{id}', 'urn:li:ugcPost:{id}' for top-level, or 'urn:li:comment:({parentUrn},{commentId})' for replies",
      ),
    actor: z
      .string()
      .describe(
        "Comment author: 'urn:li:person:{id}' for personal comments, 'urn:li:organization:{id}' for organization comments",
      ),
    object: z
      .string()
      .describe(
        "Root post URN containing the comment: 'urn:li:share:{id}' or 'urn:li:ugcPost:{id}' (same as targetUrn for top-level comments)",
      ),
    message: z.string().min(1).max(1250).describe('Comment text (1-1250 chars)'),
    mentionAttributes: z
      .array(
        z.object({
          start: z.number().int().min(0).describe('Start position of the mention in the text'),
          length: z.number().int().min(1).describe('Length of the mentioned text span'),
          personUrn: z.string().optional().describe("Mentioned person, e.g. 'urn:li:person:123'"),
          organizationUrn: z
            .string()
            .optional()
            .describe("Mentioned organization, e.g. 'urn:li:organization:456'"),
        }),
      )
      .optional()
      .describe('@-mentions in the comment text'),
    imageUrns: z
      .array(z.string())
      .optional()
      .describe("Image URNs to attach, e.g. ['urn:li:image:C4D00AAAAbBCDEFGhiJ']"),
    parentComment: z
      .string()
      .optional()
      .describe(
        "For replies: parent comment URN 'urn:li:comment:({parentUrn},{commentId})'. Omit for top-level comments",
      ),
  }),
  execute: async ({
    linkedinToken,
    targetUrn,
    actor,
    object,
    message,
    mentionAttributes,
    imageUrns,
    parentComment,
  }) => {
    try {
      if (!linkedinToken) return missingToken();
      const body: Record<string, unknown> = {
        actor,
        object,
        message: {
          text: message,
          ...(mentionAttributes !== undefined
            ? {
                attributes: mentionAttributes.map(
                  ({ start, length, personUrn, organizationUrn }) => ({
                    start,
                    length,
                    value: {
                      ...(personUrn !== undefined ? { person: personUrn } : {}),
                      ...(organizationUrn !== undefined ? { organization: organizationUrn } : {}),
                    },
                  }),
                ),
              }
            : {}),
        },
      };
      if (imageUrns !== undefined) body.content = imageUrns.map((urn) => ({ urn }));
      if (parentComment !== undefined) body.parentComment = parentComment;
      return await linkedInRequest(
        linkedinToken,
        `/v2/socialActions/${encodeURIComponent(targetUrn.trim())}/comments`,
        {
          body,
        },
      );
    } catch (error) {
      return toLinkedInError(error, 'Failed to create comment');
    }
  },
});

export const linkedinListReactions = tool({
  description:
    'List reactions (LIKE, PRAISE, APPRECIATION, EMPATHY, INTEREST, ENTERTAINMENT) on a share, post, or comment. Use to see who reacted and how.',
  inputSchema: z.object({
    ...authField,
    entity: z
      .string()
      .describe(
        "Entity URN: 'urn:li:share:{id}', 'urn:li:ugcPost:{id}', 'urn:li:activity:{id}', or a comment URN. Do not pre-encode",
      ),
    sort: z
      .enum(['CHRONOLOGICAL', 'REVERSE_CHRONOLOGICAL', 'RELEVANCE'])
      .optional()
      .describe('Order: oldest first, newest first (default), or most relevant'),
    count: z.number().int().min(1).max(100).optional().describe('Reactions per page (max 100)'),
    start: z.number().int().min(0).optional().describe('Pagination offset (reactions to skip)'),
  }),
  execute: async ({ linkedinToken, entity, sort, count, start }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(
        linkedinToken,
        `/rest/reactions/(entity:${encodeURIComponent(entity.trim())})`,
        {
          query: {
            q: 'entity',
            ...(sort !== undefined ? { sort: `(value:${sort})` } : {}),
            ...(count !== undefined ? { count } : {}),
            ...(start !== undefined ? { start } : {}),
          },
        },
      );
    } catch (error) {
      return toLinkedInError(error, 'Failed to list reactions');
    }
  },
});
