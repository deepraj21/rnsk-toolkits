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

export const asanaGetProjectStatus = tool({
  description: 'Get a project status update by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectStatusGid: gid('Project status GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectStatusGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/project_statuses/${projectStatusGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetProjectStatusUpdates = tool({
  description: 'List status updates posted on a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/projects/${projectGid}/project_statuses`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaCreateProjectStatusUpdate = tool({
  description: 'Post a status update (on track, at risk, off track) on a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    title: z.string().describe('Status title'),
    text: z.string().describe('Status body text'),
    statusType: z
      .string()
      .optional()
      .describe('Status, e.g. "on_track","at_risk","off_track","complete","on_hold"'),
    color: z.string().optional().describe('Status color, e.g. "green","yellow","red"'),
  }),
  execute: ({ asanaToken, projectGid, title, text, statusType, color }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/project_statuses`, {
      body: { title, text, status_type: statusType, color },
    }),
});

export const asanaDeleteProjectStatus = tool({
  description: 'Delete a project status update.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectStatusGid: gid('Project status GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, projectStatusGid, optPretty }) =>
    asanaDelete(asanaToken, `/project_statuses/${projectStatusGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaGetStatusUpdate = tool({
  description: 'Get a status update on any object (project, portfolio, goal) by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    statusUpdateGid: gid('Status update GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, statusUpdateGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/status_updates/${statusUpdateGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetStatusUpdates = tool({
  description: 'List status updates on a project, portfolio, or goal.',
  inputSchema: z.object({
    asanaToken: tokenField,
    parent: z.string().describe('Parent object GID (project, portfolio, or goal)'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, parent, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/status_updates', {
      query: { parent, ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaCreateStatusForObject = tool({
  description: 'Post a status update on a project, portfolio, or goal.',
  inputSchema: z.object({
    asanaToken: tokenField,
    parent: z.string().describe('Parent object GID (project, portfolio, or goal)'),
    text: z.string().describe('Status body text'),
    statusType: z
      .string()
      .optional()
      .describe('Status, e.g. "on_track","at_risk","off_track","complete"'),
    title: z.string().optional().describe('Status title'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, parent, text, statusType, title, optFields, optPretty }) =>
    asanaPost(asanaToken, '/status_updates', {
      body: { parent, text, status_type: statusType, title },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteStatusUpdate = tool({
  description: 'Delete a status update.',
  inputSchema: z.object({
    asanaToken: tokenField,
    statusUpdateGid: gid('Status update GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, statusUpdateGid, optPretty }) =>
    asanaDelete(asanaToken, `/status_updates/${statusUpdateGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaCreateProjectBrief = tool({
  description: 'Create the project brief (overview document) for a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    htmlText: z.string().describe('Brief content as HTML'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, htmlText, optFields, optPretty }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/project_briefs`, {
      body: { html_text: htmlText },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetProjectBrief = tool({
  description: 'Get a project brief by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectBriefGid: gid('Project brief GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectBriefGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/project_briefs/${projectBriefGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaUpdateProjectBrief = tool({
  description: 'Update project brief content.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectBriefGid: gid('Project brief GID to update'),
    text: z.string().optional().describe('New brief content (HTML)'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectBriefGid, text, optFields, optPretty }) =>
    asanaPut(asanaToken, `/project_briefs/${projectBriefGid}`, {
      body: { html_text: text },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteProjectBrief = tool({
  description: 'Delete a project brief.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectBriefGid: gid('Project brief GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, projectBriefGid, optPretty }) =>
    asanaDelete(asanaToken, `/project_briefs/${projectBriefGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});
