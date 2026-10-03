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

export const asanaGetWebhooks = tool({
  description: 'List webhooks in a workspace, optionally filtered by resource.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().describe('Workspace GID'),
    resource: z.string().optional().describe('Resource GID to filter webhooks by'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspace, resource, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/webhooks', {
      query: {
        workspace,
        resource,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaUpdateWebhook = tool({
  description: 'Update webhook filters (which events and actions trigger delivery).',
  inputSchema: z.object({
    asanaToken: tokenField,
    webhookGid: gid('Webhook GID to update'),
    filters: z
      .array(z.record(z.any()))
      .optional()
      .describe('Filter list, e.g. [{"resource_type":"task","action":"changed"}]'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, webhookGid, filters, optFields, optPretty }) =>
    asanaPut(asanaToken, `/webhooks/${webhookGid}`, {
      body: { filters },
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetJob = tool({
  description: 'Poll an async job (e.g. from duplicating a project) for completion.',
  inputSchema: z.object({ asanaToken: tokenField, jobGid: gid('Job GID'), optFields, optPretty }),
  execute: ({ asanaToken, jobGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/jobs/${jobGid}`, { query: optQuery(optFields, optPretty) }),
});

export const asanaSubmitParallelRequests = tool({
  description: 'Run up to 10 independent API calls in one batch request (no ordering or chaining).',
  inputSchema: z.object({
    asanaToken: tokenField,
    data: z
      .object({
        actions: z
          .array(
            z.object({
              method: z.string().describe('HTTP method, e.g. "GET","POST","PUT","DELETE"'),
              relativePath: z.string().describe('API path, e.g. "/tasks/123"'),
              data: z.record(z.any()).optional().describe('Request body for the action'),
              options: z
                .record(z.any())
                .optional()
                .describe('Per-action options, e.g. {"fields":["name"]}'),
            }),
          )
          .min(1)
          .max(10)
          .describe('Up to 10 independent actions to run in parallel'),
      })
      .describe('Batch payload'),
  }),
  execute: ({ asanaToken, data }) =>
    asanaPost(asanaToken, '/batch', {
      body: {
        actions: data.actions.map((a) => ({
          method: a.method,
          relative_path: a.relativePath,
          data: a.data,
          options: a.options,
        })),
      },
    }),
});

export const asanaGetAuditLogEvents = tool({
  description:
    'Query the audit log for security and compliance events (requires Enterprise service account).',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    startAt: z.string().optional().describe('Start time ISO 8601'),
    endAt: z.string().optional().describe('End time ISO 8601'),
    eventType: z.string().optional().describe('Event type filter, e.g. "user_login"'),
    actorGid: z.string().optional().describe('Actor user GID filter'),
    actorType: z.string().optional().describe('Actor type filter, e.g. "user"'),
    resourceGid: z.string().optional().describe('Resource GID filter'),
    limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
    offset: z.string().optional().describe('Pagination offset token'),
  }),
  execute: ({
    asanaToken,
    workspaceGid,
    startAt,
    endAt,
    eventType,
    actorGid,
    actorType,
    resourceGid,
    limit,
    offset,
  }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/audit_log_events`, {
      query: {
        start_at: startAt,
        end_at: endAt,
        event_type: eventType,
        actor_gid: actorGid,
        actor_type: actorType,
        resource_gid: resourceGid,
        ...pageQuery(limit, offset),
      },
    }),
});

export const asanaGetAllocations = tool({
  description: 'List capacity allocations filtered by workspace, assignee, or parent.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspace: z.string().optional().describe('Workspace GID filter'),
    assignee: z.string().optional().describe('Assignee user GID filter'),
    parent: z.string().optional().describe('Parent (project/portfolio) GID filter'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspace, assignee, parent, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/allocations', {
      query: {
        workspace,
        assignee,
        parent,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetAllocation = tool({
  description: 'Get a capacity allocation by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    allocationGid: gid('Allocation GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, allocationGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/allocations/${allocationGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaCreateAllocation = tool({
  description:
    'Allocate capacity (effort over a date range) to a user on a project for capacity planning.',
  inputSchema: z.object({
    asanaToken: tokenField,
    assigneeGid: z.string().describe('User GID receiving the allocation'),
    projectGid: z
      .string()
      .describe('Project GID the allocation belongs to (implies the workspace)'),
    effortType: z.enum(['hours', 'percent']).describe('Effort unit'),
    effortValue: z.number().describe('Effort amount in the given unit'),
    startDate: z.string().describe('Start date YYYY-MM-DD'),
    endDate: z.string().describe('End date YYYY-MM-DD'),
  }),
  execute: ({ asanaToken, assigneeGid, projectGid, effortType, effortValue, startDate, endDate }) =>
    asanaPost(asanaToken, '/allocations', {
      body: {
        assignee: assigneeGid,
        parent: projectGid,
        effort: { type: effortType, value: effortValue },
        start_date: startDate,
        end_date: endDate,
      },
    }),
});

export const asanaUpdateAllocation = tool({
  description: 'Update a capacity allocation dates, effort, or notes.',
  inputSchema: z.object({
    asanaToken: tokenField,
    allocationGid: gid('Allocation GID to update'),
    data: z
      .record(z.any())
      .describe(
        'Fields to update, e.g. {"end_on":"2026-12-31","effort":{"type":"hours","value":20}}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, allocationGid, data, optFields, optPretty }) =>
    asanaPut(asanaToken, `/allocations/${allocationGid}`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteAllocation = tool({
  description: 'Delete a capacity allocation.',
  inputSchema: z.object({
    asanaToken: tokenField,
    allocationGid: gid('Allocation GID to delete'),
    optPretty,
  }),
  execute: ({ asanaToken, allocationGid, optPretty }) =>
    asanaDelete(asanaToken, `/allocations/${allocationGid}`, {
      query: optQuery(undefined, optPretty),
    }),
});

export const asanaGetTimePeriods = tool({
  description: 'List time periods (quarters, halves, years) in a workspace for goal tracking.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    startOn: z.string().optional().describe('Filter periods starting on/after YYYY-MM-DD'),
    endOn: z.string().optional().describe('Filter periods ending on/before YYYY-MM-DD'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, startOn, endOn, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, '/time_periods', {
      query: {
        workspace: workspaceGid,
        start_on: startOn,
        end_on: endOn,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetTimePeriod = tool({
  description: 'Get a time period by GID.',
  inputSchema: z.object({
    asanaToken: tokenField,
    timePeriodGid: gid('Time period GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, timePeriodGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/time_periods/${timePeriodGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaGetTimeTrackingEntries = tool({
  description: 'List time tracking entries filtered by task, user, workspace, portfolio, or dates.',
  inputSchema: z.object({
    asanaToken: tokenField,
    task: z.string().optional().describe('Task GID filter'),
    user: z.string().optional().describe('User GID filter'),
    workspace: z.string().optional().describe('Workspace GID filter'),
    portfolio: z.string().optional().describe('Portfolio GID filter'),
    attributableTo: z.string().optional().describe('User GID the time is attributed to'),
    enteredOnStartDate: z.string().optional().describe('Entered on/after YYYY-MM-DD'),
    enteredOnEndDate: z.string().optional().describe('Entered on/before YYYY-MM-DD'),
    timesheetApprovalStatus: z.string().optional().describe('Approval status filter'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({
    asanaToken,
    task,
    user,
    workspace,
    portfolio,
    attributableTo,
    enteredOnStartDate,
    enteredOnEndDate,
    timesheetApprovalStatus,
    limit,
    offset,
    optFields,
    optPretty,
  }) =>
    asanaGet(asanaToken, '/time_tracking_entries', {
      query: {
        task,
        user,
        workspace,
        portfolio,
        attributable_to: attributableTo,
        entered_on_start_date: enteredOnStartDate,
        entered_on_end_date: enteredOnEndDate,
        timesheet_approval_status: timesheetApprovalStatus,
        ...pageQuery(limit, offset),
        ...optQuery(optFields, optPretty),
      },
    }),
});

export const asanaGetTimeTrackingEntriesForTask = tool({
  description: 'List time entries logged on a task.',
  inputSchema: z.object({
    asanaToken: tokenField,
    taskGid: gid('Task GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, taskGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/tasks/${taskGid}/time_tracking_entries`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetAccessRequests = tool({
  description: 'List access requests to a project or portfolio.',
  inputSchema: z.object({
    asanaToken: tokenField,
    target: z.string().describe('Target object GID (project or portfolio)'),
    user: z.string().optional().describe('Requesting user GID filter'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, target, user, optFields, optPretty }) =>
    asanaGet(asanaToken, '/access_requests', {
      query: { target, user, ...optQuery(optFields, optPretty) },
    }),
});

export const asanaCreateAccessRequest = tool({
  description: 'Request access to a project or portfolio you cannot see.',
  inputSchema: z.object({
    asanaToken: tokenField,
    target: z.string().describe('Target object GID (project or portfolio)'),
    message: z.string().optional().describe('Message to the approvers'),
  }),
  execute: ({ asanaToken, target, message }) =>
    asanaPost(asanaToken, '/access_requests', { body: { target, message } }),
});

export const asanaApproveAccessRequest = tool({
  description: 'Approve a pending access request.',
  inputSchema: z.object({
    asanaToken: tokenField,
    accessRequestGid: gid('Access request GID to approve'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, accessRequestGid, optFields, optPretty }) =>
    asanaPost(asanaToken, `/access_requests/${accessRequestGid}/approve`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaRejectAccessRequest = tool({
  description: 'Reject a pending access request.',
  inputSchema: z.object({
    asanaToken: tokenField,
    accessRequestGid: gid('Access request GID to reject'),
  }),
  execute: ({ asanaToken, accessRequestGid }) =>
    asanaPost(asanaToken, `/access_requests/${accessRequestGid}/reject`),
});
