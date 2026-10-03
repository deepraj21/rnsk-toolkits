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

export const asanaGetProject = tool({
  description: 'Get a project by GID with its settings, members, dates, and status.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/projects/${projectGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaListProjects = tool({
  description: 'List projects in a workspace or team, optionally including archived ones.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().optional().describe('Workspace GID to list projects from'),
    team: z.string().optional().describe('Team GID to list projects from'),
    archived: z.boolean().optional().describe('Include archived projects'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspace, team, archived, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/projects', {
      query: {
        workspace,
        team,
        archived,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaCreateProject = tool({
  description:
    'Create a project from scratch with a full data payload (workspace, team, dates, color, notes).',
  inputSchema: z.object({
    asanaToken: tokenField,
    data: z
      .record(z.any())
      .describe(
        'Project fields, e.g. {"name":"Website launch","workspace":"123","team":"456","notes":"...","due_on":"2026-12-31"}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/projects', { body: data, query: optQuery(optFields, optPretty) }),
});

export const asanaCreateProjectForTeam = tool({
  description: 'Create a project owned by a specific team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID that will own the project'),
    data: z
      .record(z.any())
      .describe(
        'Project fields, e.g. {"name":"Sprint 42","notes":"...","privacy_setting":"public_to_workspace"}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/projects', {
      body: { ...data, team: teamGid },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaCreateProjectForWorkspace = tool({
  description: 'Create a project directly in a workspace (no team owner).',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID for the project'),
    data: z.record(z.any()).describe('Project fields, e.g. {"name":"Backlog","notes":"..."}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/projects', {
      body: { ...data, workspace: workspaceGid },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaUpdateProject = tool({
  description: 'Update project name, notes, color, dates, owner, privacy, or archive state.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID to update'),
    name: z.string().optional().describe('New project name'),
    notes: z.string().optional().describe('New project notes'),
    htmlNotes: z.string().optional().describe('Notes with HTML formatting'),
    color: z.string().optional().describe('Project color, e.g. "dark-green"'),
    owner: z.string().optional().describe('Owner user GID'),
    team: z.string().optional().describe('Owning team GID'),
    dueOn: z.string().nullable().optional().describe('Due date YYYY-MM-DD (null clears)'),
    dueDate: z.string().nullable().optional().describe('Localized due date (null clears)'),
    startOn: z.string().nullable().optional().describe('Start date YYYY-MM-DD (null clears)'),
    public: z.boolean().optional().describe('Visible to the whole team/org'),
    archived: z.boolean().optional().describe('Archive or unarchive'),
    defaultView: z
      .string()
      .optional()
      .describe('Default view: list, board, calendar, timeline, gantt'),
    isTemplate: z.boolean().optional().describe('Convert to a project template'),
    customFields: z.record(z.any()).optional().describe('Custom field values keyed by field GID'),
  }),
  execute: ({
    asanaToken,
    projectGid,
    name,
    notes,
    htmlNotes,
    color,
    owner,
    team,
    dueOn,
    dueDate,
    startOn,
    public: isPublic,
    archived,
    defaultView,
    isTemplate,
    customFields,
  }) =>
    asanaPut(asanaToken, `/projects/${projectGid}`, {
      body: {
        name,
        notes,
        html_notes: htmlNotes,
        color,
        owner,
        team,
        due_on: dueOn,
        due_date: dueDate,
        start_on: startOn,
        public: isPublic,
        archived,
        default_view: defaultView,
        is_template: isTemplate,
        custom_fields: customFields,
      },
    }),
});

export const asanaDeleteProject = tool({
  description: 'Permanently delete a project and its unassigned tasks.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, optPretty }) =>
    asanaDelete(asanaToken, `/projects/${projectGid}`, { query: optQuery(undefined, optPretty) }),
});

export const asanaDuplicateProject = tool({
  description:
    'Duplicate a project, optionally shifting dates and including members, tasks, and forms.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID to duplicate'),
    name: z.string().describe('Name for the duplicated project'),
    team: z.string().optional().describe('Destination team GID'),
    include: z
      .array(z.string())
      .optional()
      .describe('Parts to copy, e.g. ["members","tasks","forms","rules","task_notes"]'),
    scheduleDates: z
      .record(z.any())
      .optional()
      .describe('Date shifting, e.g. {"should_skip_weekends":true,"start_on":"2026-11-01"}'),
  }),
  execute: ({ asanaToken, projectGid, name, team, include, scheduleDates }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/duplicate`, {
      body: { name, team, include, schedule_dates: scheduleDates },
    }),
});

export const asanaGetTasksFromProject = tool({
  description: 'List tasks in a project, optionally only those completed since a timestamp.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    completedSince: z.string().optional().describe('Only completed tasks since ISO timestamp'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, completedSince, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/projects/${projectGid}/tasks`, {
      query: {
        completed_since: completedSince,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetTaskCountsForProject = tool({
  description: 'Get incomplete/completed/milestone task counts for a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/projects/${projectGid}/task_counts`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetSectionsInProject = tool({
  description: 'List the sections (columns) of a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    ...paging,
  }),
  execute: ({ asanaToken, projectGid, limit, offset }) =>
    asanaGet(asanaToken, `/projects/${projectGid}/sections`, { query: pageQuery(limit, offset) }),
});

export const asanaCreateSectionInProject = tool({
  description: 'Create a section (list column / board column) in a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    name: z.string().describe('Section name, e.g. "In progress"'),
    insertAfter: z.string().nullable().optional().describe('Section GID to insert after'),
    insertBefore: z.string().nullable().optional().describe('Section GID to insert before'),
  }),
  execute: ({ asanaToken, projectGid, name, insertAfter, insertBefore }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/sections`, {
      body: { name, insert_after: insertAfter, insert_before: insertBefore },
    }),
});

export const asanaInsertSectionForProject = tool({
  description: 'Move an existing section to a new position within its project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    data: z
      .record(z.any())
      .describe(
        'Move payload, e.g. {"section":"789","insert_after":"101"} or {"section":"789","insert_before":null}',
      ),
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, data, optPretty }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/sections/insert`, {
      body: data,
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaAddMembersToProject = tool({
  description: 'Add members to a project (comma-separated user GIDs, emails, or "me").',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    members: z.string().describe('Users to add, e.g. "123,456" or "me,teammate@example.com"'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, members, optFields, optPretty }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/addMembers`, {
      body: { members },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRemoveMembersForProject = tool({
  description: 'Remove members from a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    members: z.string().describe('Users to remove, e.g. "123,456"'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, members, optFields, optPretty }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/removeMembers`, {
      body: { members },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaAddFollowersToProject = tool({
  description: 'Add followers to a project so they are notified when tasks are added.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    followers: z.string().describe('Users to add, e.g. "123,456" or "me"'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, followers, optFields, optPretty }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/addFollowers`, {
      body: { followers },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRemoveFollowersForProject = tool({
  description: 'Remove followers from a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    followers: z.string().describe('Users to remove, e.g. "123,456"'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, followers, optFields, optPretty }) =>
    asanaPost(asanaToken, `/projects/${projectGid}/removeFollowers`, {
      body: { followers },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetProjectMemberships = tool({
  description: 'List project memberships (who has access and at what level) for a project.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectGid: gid('Project GID'),
    user: z.string().optional().describe('Filter by user GID or "me"'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectGid, user, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/projects/${projectGid}/project_memberships`, {
      query: { user, ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetProjectMembership = tool({
  description: 'Get a single project membership by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectMembershipGid: gid('Project membership GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, projectMembershipGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/project_memberships/${projectMembershipGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetProjectsForTeam = tool({
  description: 'List projects owned by a team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID'),
    archived: z.boolean().optional().describe('Include archived projects'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, archived, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/teams/${teamGid}/projects`, {
      query: { archived, ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetWorkspaceProjects = tool({
  description: 'List all projects in a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    optExpand: z.array(z.string()).optional().describe('Fields to expand, e.g. ["team","owner"]'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, workspaceGid, optExpand, limit, offset, optFields }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/projects`, {
      query: {
        opt_expand: optExpand,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, undefined),
      },
    }),
});

export const asanaGetProjectTemplates = tool({
  description: 'List project templates available in a workspace or team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().optional().describe('Workspace GID'),
    teamGid: z.string().optional().describe('Team GID'),
    ...paging,
    optFields,
  }),
  execute: ({ asanaToken, workspaceGid, teamGid, limit, offset, optFields }) =>
    asanaGet(asanaToken, '/project_templates', {
      query: {
        workspace: workspaceGid,
        team: teamGid,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, undefined),
      },
    }),
});

export const asanaGetProjectTemplatesForTeam = tool({
  description: 'List project templates owned by a team.',
  inputSchema: z.object({
    asanaToken: tokenField,
    teamGid: z.string().describe('Team GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, teamGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/teams/${teamGid}/project_templates`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaInstantiateProjectTemplate = tool({
  description: 'Create a project from a project template with dates, roles, and privacy settings.',
  inputSchema: z.object({
    asanaToken: tokenField,
    projectTemplateGid: z.string().describe('Project template GID'),
    name: z.string().describe('Name for the new project'),
    team: z.string().optional().describe('Destination team GID'),
    isStrict: z.boolean().optional().describe('Fail if any template requirement is unmet'),
    privacySetting: z
      .string()
      .optional()
      .describe('Privacy, e.g. "public_to_workspace","private_to_project"'),
    requestedDates: z
      .array(z.record(z.any()))
      .optional()
      .describe('Date overrides for template date variables'),
    requestedRoles: z
      .record(z.any())
      .optional()
      .describe('Role assignments keyed by role variable GID'),
    optFields,
    optPretty,
  }),
  execute: ({
    asanaToken,
    projectTemplateGid,
    name,
    team,
    isStrict,
    privacySetting,
    requestedDates,
    requestedRoles,
    optFields,
    optPretty,
  }) =>
    asanaPost(asanaToken, `/project_templates/${projectTemplateGid}/instantiateProject`, {
      body: {
        name,
        team,
        is_strict: isStrict,
        privacy_setting: privacySetting,
        requested_dates: requestedDates,
        requested_roles: requestedRoles,
      },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetCustomTypes = tool({
  description: 'List custom task types available on a project or across a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    project: z
      .string()
      .optional()
      .describe('Project GID (exactly one of project or workspace is required)'),
    workspace: z.string().optional().describe('Workspace GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, project, workspace, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/custom_types', {
      query: { project, workspace, ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});
