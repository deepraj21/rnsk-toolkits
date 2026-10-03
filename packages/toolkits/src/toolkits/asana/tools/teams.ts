// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaDelete, asanaGet, asanaPost, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');
const paging = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.string().optional().describe('Pagination offset token'),
};

export const asanaGetTeam = tool({
  description: 'Get a team by GID with its organization, description, and member count.',
  inputSchema: z.object({ asanaToken: tokenField, teamGid: gid('Team GID'), optFields, optPretty }),
  execute: ({ asanaToken, teamGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/teams/${teamGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaCreateTeam = tool({
  description: 'Create a team in an organization.',
  inputSchema: z.object({
    asanaToken: tokenField,
    data: z
      .record(z.any())
      .describe(
        'Team fields, e.g. {"name":"Platform","organization":"123","description":"...","privacy":"public_to_organization"}',
      ),
  }),
  execute: ({ asanaToken, data }) => asanaPost(asanaToken, '/teams', { body: data }),
});

export const asanaUpdateTeam = tool({
  description: 'Update a team name or description.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: gid('Team GID to update'),
    name: z.string().optional().describe('New team name'),
    description: z.string().optional().describe('New team description'),
    organization: z.string().optional().describe('Organization GID (required by some plans)'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, name, description, organization, optFields, optPretty }) =>
    asanaPost(asanaToken, `/teams/${teamGid}`, {
      body: { name, description, organization },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetTeamsInWorkspace = tool({
  description: 'List teams in a workspace/organization.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    ...paging,
  }),
  execute: ({ asanaToken, workspaceGid, limit, offset }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/teams`, { query: pageQuery(limit, offset) }),
});

export const asanaGetTeamMemberships = tool({
  description: 'List team memberships filtered by team, user, or workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    team: z.string().optional().describe('Team GID filter'),
    user: z.string().optional().describe('User GID filter'),
    workspace: z.string().optional().describe('Workspace GID filter'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, team, user, workspace, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/team_memberships', {
      query: {
        team,
        user,
        workspace,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetTeamMembership = tool({
  description: 'Get a team membership by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamMembershipGid: gid('Team membership GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamMembershipGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/team_memberships/${teamMembershipGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetTeamMembershipsForTeam = tool({
  description: 'List memberships of a team (members and their roles).',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/teams/${teamGid}/team_memberships`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaCreateMembership = tool({
  description: 'Grant a member access to a goal, portfolio, or project via a membership.',
  inputSchema: z.object({
    asanaToken: tokenField,
    member: z.string().describe('User GID to grant access to'),
    parent: z.string().describe('Parent resource GID (goal, portfolio, or project)'),
    role: z.string().optional().describe('Membership role, e.g. "editor","commenter"'),
    accessLevel: z
      .string()
      .optional()
      .describe('Access level, e.g. "admin","editor","commenter","viewer"'),
    optPretty,
  }),
  execute: ({ asanaToken, member, parent, role, accessLevel, optPretty }) =>
    asanaPost(asanaToken, '/memberships', {
      body: { member, parent, role, access_level: accessLevel },
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaGetMemberships = tool({
  description: 'List memberships filtered by member and/or parent resource.',
  inputSchema: z.object({
    asanaToken: tokenField,
    member: z.string().optional().describe('User GID filter'),
    parent: z.string().optional().describe('Parent resource GID filter'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, member, parent, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/memberships', {
      query: { member, parent, ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});

export const asanaGetMembership = tool({
  description: 'Get a membership by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    membershipGid: gid('Membership GID'),
    optPretty,
  }),
  execute: ({ asanaToken, membershipGid, optPretty }) =>
    asanaGet(asanaToken, `/memberships/${membershipGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaDeleteMembership = tool({
  description: 'Revoke a membership, removing access to the parent resource.',
  inputSchema: z.object({
    asanaToken: tokenField,
    membershipGid: gid('Membership GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, membershipGid, optPretty }) =>
    asanaDelete(asanaToken, `/memberships/${membershipGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaGetWorkspaceMembership = tool({
  description: 'Get a workspace membership by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceMembershipGid: gid('Workspace membership GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceMembershipGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspace_memberships/${workspaceMembershipGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetWorkspaceMemberships = tool({
  description: 'List memberships of a workspace, optionally filtered by user.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    user: z.string().optional().describe('User GID filter'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, workspaceGid, user, limit, offset, optFields }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/workspace_memberships`, {
      query: { user, ...pageQuery(limit, offset), ...optQuery(optFields, undefined) },
    }),
});
