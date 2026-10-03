// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaDelete, asanaGet, asanaPost, asanaPut, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');
const paging = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.string().optional().describe('Pagination offset token'),
};

export const asanaGetStoriesForTask = tool({
  description: 'List comments and activity stories on a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, taskGid, limit, offset, optFields }) =>
    asanaGet(asanaToken, `/tasks/${taskGid}/stories`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaGetStory = tool({
  description: 'Get a story (comment or activity record) by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    storyGid: gid('Story GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, storyGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/stories/${storyGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaCreateTaskComment = tool({
  description: 'Post a comment on a task. Use for status updates, questions, and discussion.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskId: z.string().describe('Task GID to comment on'),
    text: z.string().describe('Comment text (supports @mentions and rich text)'),
  }),
  execute: ({ asanaToken, taskId, text }) =>
    asanaPost(asanaToken, `/tasks/${taskId}/stories`, { body: { text } }),
});

export const asanaUpdateStory = tool({
  description: 'Edit a comment story text.',
  inputSchema: z.object({
    asanaToken: tokenField,
    storyGid: gid('Story GID to update'),
    data: z.record(z.any()).describe('Fields to update, e.g. {"text":"Corrected comment"}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, storyGid, data, optFields, optPretty }) =>
    asanaPut(asanaToken, `/stories/${storyGid}`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteStory = tool({
  description: 'Delete a story (comment) from a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    storyGid: gid('Story GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, storyGid, optPretty }) =>
    asanaDelete(asanaToken, `/stories/${storyGid}`, { query: optQuery(undefined, optPretty) }),
});

export const asanaGetReactions = tool({
  description: 'List emoji reactions on a task, story, or other object.',
  inputSchema: z.object({
    asanaToken: tokenField,
    target: z.string().describe('GID of the object to list reactions for'),
    emojiBase: z.string().describe('Emoji filter, e.g. "heart","thumbsup","tada"'),
    ...paging,
    optPretty,
  }),
  execute: ({ asanaToken, target, emojiBase, limit, offset, optPretty }) =>
    asanaGet(asanaToken, '/reactions', {
      query: {
        target,
        emoji_base: emojiBase,
        ...pageQuery(limit, offset),
        ...optQuery(undefined, optPretty),
      },
    }),
});
