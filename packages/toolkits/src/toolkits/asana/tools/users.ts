// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaGet, asanaPost, asanaPut, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');
const paging = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.string().optional().describe('Pagination offset token'),
};

export const asanaGetCurrentUser = tool({
  description:
    'Get the currently authenticated user — the fastest way to verify credentials and identity.',
  inputSchema: z.object({ asanaToken: tokenField }),
  execute: ({ asanaToken }) => asanaGet(asanaToken, '/users/me'),
});

export const asanaGetUser = tool({
  description: 'Get a user by GID with name, email, photo, and workspaces.',
  inputSchema: z.object({
    asanaToken: tokenField,
    userGid: gid('User GID (or "me")'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/users/${userGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaListUsers = tool({
  description: 'List users in a workspace or team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().optional().describe('Workspace GID to list users from'),
    team: z.string().optional().describe('Team GID to list users from'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspace, team, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/users', {
      query: { workspace, team, ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetUsersForTeam = tool({
  description: 'List members of a team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/teams/${teamGid}/users`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetUsersForWorkspace = tool({
  description: 'List users in a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/users`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetUserForWorkspace = tool({
  description: 'Get a workspace-scoped view of a user (role, access level in that workspace).',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    userGid: z.string().describe('User GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, userGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/users/${userGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaUpdateUser = tool({
  description: 'Update user-level custom field values for a user in a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    userGid: z.string().describe('User GID'),
    workspace: z.string().optional().describe('Workspace GID the custom fields belong to'),
    customFields: z.record(z.any()).optional().describe('Custom field values keyed by field GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userGid, workspace, customFields, optFields, optPretty }) =>
    asanaPut(asanaToken, `/users/${userGid}`, {
      body: { workspace, custom_fields: customFields },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaUpdateUserForWorkspace = tool({
  description: 'Update workspace-scoped attributes (e.g. custom fields) for a user.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    userGid: z.string().describe('User GID'),
    customFields: z.record(z.any()).optional().describe('Custom field values keyed by field GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, userGid, customFields, optFields, optPretty }) =>
    asanaPut(asanaToken, `/workspaces/${workspaceGid}/users/${userGid}`, {
      body: { custom_fields: customFields },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaAddUserToTeam = tool({
  description: 'Add a user to a team by GID, email, or "me".',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID'),
    user: z.string().describe('User GID, email, or "me"'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, user, optFields, optPretty }) =>
    asanaPost(asanaToken, `/teams/${teamGid}/addUser`, {
      body: { user },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRemoveUserForTeam = tool({
  description: 'Remove a user from a team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID'),
    user: z.string().describe('User GID, email, or "me"'),
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, user, optPretty }) =>
    asanaPost(asanaToken, `/teams/${teamGid}/removeUser`, {
      body: { user },
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaAddUserToWorkspace = tool({
  description: 'Invite a user to a workspace by GID or email.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    user: z.string().describe('User GID or email address'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, user, optFields, optPretty }) =>
    asanaPost(asanaToken, `/workspaces/${workspaceGid}/addUser`, {
      body: { user },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRemoveUserForWorkspace = tool({
  description: 'Remove (deprovision) a user from a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    user: z.string().describe('User GID or email address'),
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, user, optPretty }) =>
    asanaPost(asanaToken, `/workspaces/${workspaceGid}/removeUser`, {
      body: { user },
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaGetTeamsForUser = tool({
  description: 'List teams a user belongs to within an organization.',
  inputSchema: z.object({
    asanaToken: tokenField,
    userGid: z.string().describe('User GID (or "me")'),
    organization: z.string().describe('Organization/workspace GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userGid, organization, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/users/${userGid}/teams`, {
      query: { organization, ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetUserTaskList = tool({
  description: 'Get a user task list (My Tasks) by its GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    userTaskListGid: gid('User task list GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userTaskListGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/user_task_lists/${userTaskListGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetAUserTaskList = tool({
  description: 'Get the user task list for a user in a workspace (their My Tasks view).',
  inputSchema: z.object({
    asanaToken: tokenField,
    userTaskListGid: z.string().describe('User GID whose task list to fetch (or a task-list GID)'),
    workspace: z.string().describe('Workspace GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userTaskListGid, workspace, optFields, optPretty }) =>
    asanaGet(asanaToken, `/users/${userTaskListGid}/user_task_list`, {
      query: { workspace, ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetTasksForUserTaskList = tool({
  description: 'List tasks assigned to a user via their task list (My Tasks).',
  inputSchema: z.object({
    asanaToken: tokenField,
    userTaskListGid: z.string().describe('User task list GID'),
    completedSince: z.string().optional().describe('Only completed tasks since ISO timestamp'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userTaskListGid, completedSince, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/user_task_lists/${userTaskListGid}/tasks`, {
      query: {
        completed_since: completedSince,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetFavoritesForUser = tool({
  description: 'List starred/favorite projects, portfolios, and dashboards for a user.',
  inputSchema: z.object({
    asanaToken: tokenField,
    userGid: z.string().describe('User GID (or "me")'),
    workspace: z.string().describe('Workspace GID'),
    resourceType: z
      .string()
      .optional()
      .describe('Filter, e.g. "project","portfolio","custom_dashboard"'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({
    asanaToken,
    userGid,
    workspace,
    resourceType,
    limit,
    offset,
    optFields,
    optPretty,
  }) =>
    asanaGet(asanaToken, `/users/${userGid}/favorites`, {
      query: {
        workspace,
        resource_type: resourceType,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetTeamMembershipsForUser = tool({
  description: 'List team memberships for a user in a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    userGid: z.string().describe('User GID (or "me")'),
    workspace: z.string().describe('Workspace GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userGid, workspace, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/users/${userGid}/team_memberships`, {
      query: { workspace, ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetWorkspaceMembershipsForUser = tool({
  description: 'List workspace memberships for a user (roles and access levels).',
  inputSchema: z.object({
    asanaToken: tokenField,
    userGid: z.string().describe('User GID (or "me")'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, userGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/users/${userGid}/workspace_memberships`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});
