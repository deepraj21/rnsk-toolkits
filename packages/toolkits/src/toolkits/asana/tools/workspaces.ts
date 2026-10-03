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

export const asanaListWorkspaces = tool({
  description: 'List workspaces and organizations visible to the authenticated user.',
  inputSchema: z.object({ asanaToken: tokenField, ...paging, optFields, optPretty }),
  execute: ({ asanaToken, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/workspaces', {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetWorkspace = tool({
  description: 'Get a workspace by GID with its name and organization status.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: gid('Workspace GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaGetTags = tool({
  description: 'List tags in a workspace (optionally all workspaces).',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().optional().describe('Workspace GID filter'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, workspace, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/tags', {
      query: { workspace, ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaGetTagsForWorkspace = tool({
  description: 'List tags defined in a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/tags`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetTag = tool({
  description: 'Get a tag by GID with its color and workspace.',
  inputSchema: z.object({ asanaToken: tokenField, tagGid: gid('Tag GID'), optFields, optPretty }),
  execute: ({ asanaToken, tagGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/tags/${tagGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaCreateTag = tool({
  description: 'Create a tag with a full data payload.',
  inputSchema: z.object({
    asanaToken: tokenField,
    data: z
      .record(z.any())
      .describe('Tag fields, e.g. {"name":"urgent","color":"red","workspace":"123"}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/tags', { body: data, query: optQuery(optFields, optPretty) }),
});

export const asanaCreateTagInWorkspace = tool({
  description: 'Create a tag in a specific workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID for the tag'),
    data: z
      .record(z.any())
      .describe('Tag fields, e.g. {"name":"urgent","color":"red","notes":"..."}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/tags', {
      body: { ...data, workspace: workspaceGid },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaUpdateTag = tool({
  description: 'Update a tag name, color, or notes.',
  inputSchema: z.object({
    asanaToken: tokenField,
    tagGid: gid('Tag GID to update'),
    data: z.record(z.any()).describe('Fields to update, e.g. {"name":"critical","color":"red"}'),
  }),
  execute: ({ asanaToken, tagGid, data }) =>
    asanaPut(asanaToken, `/tags/${tagGid}`, { body: data }),
});

export const asanaDeleteTag = tool({
  description: 'Permanently delete a tag.',
  inputSchema: z.object({ asanaToken: tokenField, tagGid: gid('Tag GID to delete'), optPretty }),
  execute: ({ asanaToken, tagGid, optPretty }) =>
    asanaDelete(asanaToken, `/tags/${tagGid}`, { query: optQuery(undefined, optPretty) }),
});

export const asanaGetTasksForTag = tool({
  description: 'List tasks carrying a tag.',
  inputSchema: z.object({
    asanaToken: tokenField,
    tagGid: gid('Tag GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, tagGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/tags/${tagGid}/tasks`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetTypeaheadObjects = tool({
  description: 'Typeahead search across tasks, users, projects, and more within a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    query: z.string().optional().describe('Search text (omit to list recent objects)'),
    resourceType: z
      .string()
      .optional()
      .describe('Type filter, e.g. "task","user","project","portfolio","goal","team"'),
    count: z.number().int().min(1).max(100).optional().describe('Max results (default 20)'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, query, resourceType, count, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/typeahead`, {
      query: { query, resource_type: resourceType, count, ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetEvents = tool({
  description:
    'Poll events (changes) on a task, project, or other resource. Pass the sync token from the last call.',
  inputSchema: z.object({
    asanaToken: tokenField,
    resourceGid: z.string().describe('Resource GID to watch for changes'),
    sync: z
      .string()
      .optional()
      .describe('Sync token from a previous events call (omit on first call)'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, resourceGid, sync, optFields, optPretty }) =>
    asanaGet(asanaToken, '/events', {
      query: { resource: resourceGid, sync, ...optQuery(optFields, optPretty) },
    }),
});
