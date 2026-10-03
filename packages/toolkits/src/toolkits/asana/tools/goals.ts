// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaGet, asanaPost, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');
const paging = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.string().optional().describe('Pagination offset token'),
};

export const asanaGetGoals = tool({
  description: 'List goals filtered by workspace, team, project, portfolio, or time period.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().optional().describe('Workspace GID filter'),
    team: z.string().optional().describe('Team GID filter'),
    project: z.string().optional().describe('Project GID filter'),
    portfolio: z.string().optional().describe('Portfolio GID filter'),
    timePeriod: z.string().optional().describe('Time period GID filter'),
    isWorkspaceLevel: z.boolean().optional().describe('Only organization-wide goals'),
    archived: z.boolean().optional().describe('Include archived goals'),
    ...paging,
    optFields,
  }),
  execute: ({
    asanaToken,
    workspace,
    team,
    project,
    portfolio,
    timePeriod,
    isWorkspaceLevel,
    archived,
    limit,
    offset,
    optFields,
  }) =>
    asanaGet(asanaToken, '/goals', {
      query: {
        workspace,
        team,
        project,
        portfolio,
        time_period: timePeriod,
        is_workspace_level: isWorkspaceLevel,
        archived,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, undefined),
      },
    }),
});

export const asanaGetGoal = tool({
  description: 'Get a goal by GID with progress, owner, and time period.',
  inputSchema: z.object({ asanaToken: tokenField, goalGid: gid('Goal GID'), optFields }),
  execute: ({ asanaToken, goalGid, optFields }) =>
    asanaGet(asanaToken, `/goals/${goalGid}`, { query: optQuery(optFields, undefined) }),
});

export const asanaGetGoalRelationships = tool({
  description: 'List supporting/contributing relationships of a goal.',
  inputSchema: z.object({
    asanaToken: tokenField,
    goalGid: gid('Goal GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, goalGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/goal_relationships', {
      query: {
        supported_goal: goalGid,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaAddSupportingRelationship = tool({
  description: 'Link a project, task, portfolio, or goal as supporting work under a goal.',
  inputSchema: z.object({
    asanaToken: tokenField,
    goalGid: gid('Goal GID'),
    data: z
      .object({
        supportingResource: z
          .string()
          .describe('GID of the supporting resource (project, task, portfolio, or goal)'),
        contributionWeight: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe('Weight 0-1 of this resource toward goal progress'),
        insertAfter: z.string().optional().describe('Place after this supporting resource GID'),
        insertBefore: z.string().optional().describe('Place before this supporting resource GID'),
      })
      .describe('Supporting relationship payload'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, goalGid, data, optFields, optPretty }) =>
    asanaPost(asanaToken, `/goals/${goalGid}/addSupportingRelationship`, {
      body: {
        supporting_resource: data.supportingResource,
        contribution_weight: data.contributionWeight,
        insert_after: data.insertAfter,
        insert_before: data.insertBefore,
      },
      query: optQuery(optFields, optPretty),
    }),
});
