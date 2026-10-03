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

export const asanaGetSection = tool({
  description: 'Get a section by GID with its project and name.',
  inputSchema: z.object({
    asanaToken: tokenField,
    sectionGid: gid('Section GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, sectionGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/sections/${sectionGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaGetTasksFromSection = tool({
  description: 'List tasks in a section.',
  inputSchema: z.object({
    asanaToken: tokenField,
    sectionGid: gid('Section GID'),
    completedSince: z.string().optional().describe('Only completed tasks since ISO timestamp'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, sectionGid, completedSince, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/sections/${sectionGid}/tasks`, {
      query: {
        completed_since: completedSince,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaAddTaskToSection = tool({
  description: 'Move a task into a section, optionally positioning it relative to another task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    sectionGid: gid('Section GID'),
    taskGid: z.string().describe('Task GID to move into the section'),
    insertAfter: z.string().nullable().optional().describe('Task GID to insert after'),
    insertBefore: z.string().nullable().optional().describe('Task GID to insert before'),
  }),
  execute: ({ asanaToken, sectionGid, taskGid, insertAfter, insertBefore }) =>
    asanaPost(asanaToken, `/sections/${sectionGid}/addTask`, {
      body: { task: taskGid, insert_after: insertAfter, insert_before: insertBefore },
    }),
});

export const asanaUpdateSection = tool({
  description:
    'Rename a section. To move a section, use the insert-section-for-project tool instead.',
  inputSchema: z.object({
    asanaToken: tokenField,
    sectionGid: gid('Section GID to update'),
    name: z.string().describe('New section name'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, sectionGid, name, optFields, optPretty }) =>
    asanaPut(asanaToken, `/sections/${sectionGid}`, {
      body: { name },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteSection = tool({
  description: 'Delete a section. Tasks are kept and become unsectioned.',
  inputSchema: z.object({
    asanaToken: tokenField,
    sectionGid: gid('Section GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, sectionGid, optPretty }) =>
    asanaDelete(asanaToken, `/sections/${sectionGid}`, { query: optQuery(undefined, optPretty) }),
});
