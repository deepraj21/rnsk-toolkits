// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaDelete, asanaGet, asanaPost, asanaPut, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z
  .array(z.string())
  .optional()
  .describe('Extra fields to include, e.g. ["notes","assignee","due_on"]');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');

export const asanaGetTask = tool({
  description: 'Get a single task by GID with its name, assignee, dates, projects, and notes.',
  inputSchema: z.object({ asanaToken: tokenField, taskGid: gid('Task GID'), optFields, optPretty }),
  execute: ({ asanaToken, taskGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/tasks/${taskGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaListTasks = tool({
  description:
    'List tasks filtered by project, section, tag, assignee, or workspace. Use to browse task collections.',
  inputSchema: z.object({
    asanaToken: tokenField,
    project: z.string().optional().describe('Project GID to list tasks from'),
    section: z.string().optional().describe('Section GID to list tasks from'),
    tag: z.string().optional().describe('Tag GID to list tasks for'),
    assignee: z.string().optional().describe('User GID or "me" to filter by assignee'),
    workspace: z
      .string()
      .optional()
      .describe('Workspace GID (required when filtering by assignee)'),
    userTaskList: z.string().optional().describe('User task list GID to list assigned tasks from'),
    completedSince: z
      .string()
      .optional()
      .describe('Only completed tasks since ISO timestamp, e.g. "2024-01-01T00:00:00Z"'),
    modifiedSince: z.string().optional().describe('Only tasks modified since ISO timestamp'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
    offset: z.string().optional().describe('Pagination offset token from a previous response'),
    optFields,
    optPretty,
  }),
  execute: ({
    asanaToken,
    project,
    section,
    tag,
    assignee,
    workspace,
    userTaskList,
    completedSince,
    modifiedSince,
    limit,
    offset,
    optFields,
    optPretty,
  }) =>
    asanaGet(asanaToken, '/tasks', {
      query: {
        project,
        section,
        tag,
        assignee,
        workspace,
        user_task_list: userTaskList,
        completed_since: completedSince,
        modified_since: modifiedSince,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaCreateTask = tool({
  description:
    'Create a task in a workspace (and optionally projects/sections) with name, notes, assignee, and dates.',
  inputSchema: z.object({
    asanaToken: tokenField,
    data: z
      .record(z.any())
      .describe(
        'Task fields, e.g. {"name":"Launch review","workspace":"123","projects":["456"],"notes":"...","assignee":"me","due_on":"2026-10-15"}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/tasks', { body: data, query: optQuery(optFields, optPretty) }),
});

export const asanaUpdateTask = tool({
  description: 'Update a task name, notes, assignee, dates, completion, or custom fields.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID to update'),
    data: z
      .record(z.any())
      .describe(
        'Fields to update, e.g. {"name":"New name","completed":true,"due_on":"2026-11-01"}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, data, optFields, optPretty }) =>
    asanaPut(asanaToken, `/tasks/${taskGid}`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteTask = tool({
  description: 'Permanently delete a task and remove it from all projects.',
  inputSchema: z.object({ asanaToken: tokenField, taskGid: gid('Task GID to delete'), optPretty }),
  execute: ({ asanaToken, taskGid, optPretty }) =>
    asanaDelete(asanaToken, `/tasks/${taskGid}`, { query: optQuery(undefined, optPretty) }),
});

export const asanaDuplicateTask = tool({
  description:
    'Duplicate a task, optionally including attachments, subtasks, followers, and projects.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID to duplicate'),
    name: z.string().optional().describe('Name for the duplicated task'),
    include: z
      .array(z.string())
      .optional()
      .describe(
        'Parts to copy, e.g. ["attachments","subtasks","assignee","followers","projects","dates"]',
      ),
  }),
  execute: ({ asanaToken, taskGid, name, include }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/duplicate`, { body: { name, include } }),
});

export const asanaAddProjectToTask = tool({
  description:
    'Add a task to a project, optionally positioning it within a section or relative to another task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    project: z.string().describe('Project GID to add the task to'),
    section: z.string().optional().describe('Section GID to insert the task into'),
    insertAfter: z
      .string()
      .nullable()
      .optional()
      .describe('Task GID to insert after, or null for start of list/section'),
    insertBefore: z
      .string()
      .nullable()
      .optional()
      .describe('Task GID to insert before, or null for end of list/section'),
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, project, section, insertAfter, insertBefore, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/addProject`, {
      body: { project, section, insert_after: insertAfter, insert_before: insertBefore },
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaRemoveProjectFromTask = tool({
  description: 'Remove a task from a project (the task itself is kept).',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    project: z.string().describe('Project GID to remove the task from'),
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, project, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/removeProject`, {
      body: { project },
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaAddFollowersToTask = tool({
  description: 'Add followers to a task so they are notified of updates.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    followers: z.array(z.string()).describe('User GIDs to add as followers, e.g. ["123","456"]'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, followers, optFields, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/addFollowers`, {
      body: { followers },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRemoveFollowersFromTask = tool({
  description: 'Remove followers from a task so they stop receiving updates.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    followers: z.array(z.string()).describe('User GIDs to remove from followers'),
  }),
  execute: ({ asanaToken, taskGid, followers }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/removeFollowers`, { body: { followers } }),
});

export const asanaAddTagToTask = tool({
  description: 'Attach an existing tag to a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    tagGid: z.string().describe('Tag GID to attach'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, tagGid, optFields, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/addTag`, {
      body: { tag: tagGid },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRemoveTagFromTask = tool({
  description: 'Detach a tag from a task (the tag itself is kept).',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    tag: z.string().describe('Tag GID to detach'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, tag, optFields, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/removeTag`, {
      body: { tag },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaAddTaskDependencies = tool({
  description: 'Mark other tasks as dependencies that must finish before this task (blocked-by).',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID that is blocked'),
    dependencies: z.array(z.string()).describe('Task GIDs this task depends on'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, dependencies, optFields, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/addDependencies`, {
      body: { dependencies },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaSetTaskParent = tool({
  description: 'Make a task a subtask of another task (or top-level by re-parenting).',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID to re-parent'),
    parent: z.string().describe('Parent task GID'),
    insertAfter: z.string().nullable().optional().describe('Sibling GID to insert after'),
    insertBefore: z.string().nullable().optional().describe('Sibling GID to insert before'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, parent, insertAfter, insertBefore, optFields, optPretty }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/setParent`, {
      body: { parent, insert_after: insertAfter, insert_before: insertBefore },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetTaskSubtasks = tool({
  description: 'List the subtasks of a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Parent task GID'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.string().optional().describe('Pagination offset token'),
    optFields,
  }),
  execute: ({ asanaToken, taskGid, limit, offset, optFields }) =>
    asanaGet(asanaToken, `/tasks/${taskGid}/subtasks`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaCreateSubtask = tool({
  description: 'Create a subtask under an existing task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Parent task GID'),
    name: z.string().describe('Subtask name'),
    notes: z.string().optional().describe('Subtask notes'),
    assignee: z.string().optional().describe('Assignee user GID or "me"'),
    dueOn: z.string().optional().describe('Due date YYYY-MM-DD'),
    dueAt: z.string().optional().describe('Due datetime ISO 8601'),
    completed: z.boolean().optional().describe('Create already completed'),
    followers: z.array(z.string()).optional().describe('Follower user GIDs'),
  }),
  execute: ({ asanaToken, taskGid, name, notes, assignee, dueOn, dueAt, completed, followers }) =>
    asanaPost(asanaToken, `/tasks/${taskGid}/subtasks`, {
      body: { name, notes, assignee, due_on: dueOn, due_at: dueAt, completed, followers },
    }),
});

export const asanaGetProjectsForTask = tool({
  description: 'List the projects a task belongs to.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.string().optional().describe('Pagination offset token'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/tasks/${taskGid}/projects`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetTagsForTask = tool({
  description: 'List the tags attached to a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.string().optional().describe('Pagination offset token'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/tasks/${taskGid}/tags`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaSearchTasks = tool({
  description:
    'Search tasks in a workspace by text, assignees, projects, or subtypes. The most powerful task finder.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID to search in'),
    text: z.string().optional().describe('Free-text query matched against task names and notes'),
    assigneeAny: z.array(z.string()).optional().describe('Assignee user GIDs ("me" allowed)'),
    projectsAny: z.array(z.string()).optional().describe('Project GIDs to restrict the search to'),
    resourceSubtype: z
      .string()
      .optional()
      .describe('Task subtype, e.g. "default_task","milestone","approval"'),
    filters: z
      .record(z.any())
      .optional()
      .describe(
        'Additional search params, e.g. {"completed":false,"due_on.before":"2026-12-01","sort_by":"due_date"}',
      ),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    optFields,
    optPretty,
  }),
  execute: ({
    asanaToken,
    workspaceGid,
    text,
    assigneeAny,
    projectsAny,
    resourceSubtype,
    filters,
    limit,
    optFields,
    optPretty,
  }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/tasks/search`, {
      query: {
        text,
        'assignee.any': assigneeAny,
        'projects.any': projectsAny,
        resource_subtype: resourceSubtype,
        ...(filters ?? {}),
        ...pageQuery(limit, undefined),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetTaskTemplates = tool({
  description: 'List task templates available in a workspace or project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z
      .string()
      .optional()
      .describe('Workspace GID (one of workspace or project is typical)'),
    projectGid: z.string().optional().describe('Project GID to list templates for'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.string().optional().describe('Pagination offset token'),
    optFields,
  }),
  execute: ({ asanaToken, workspaceGid, projectGid, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/task_templates', {
      query: {
        workspace: workspaceGid,
        project: projectGid,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, undefined),
      },
    }),
});
