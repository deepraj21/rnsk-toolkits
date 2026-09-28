// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pageParams, terraformRequest, toTerraformError } from './client.js';

const tokenField = z
  .string()
  .optional()
  .describe(
    'Injected Terraform API token (user or team token; org tokens cannot queue/apply runs) — match manifest tokenField',
  );
const runIdField = z.string().describe('Run ID, e.g. "run-xxxxxxxxxxxx"');

export const createRun = tool({
  description:
    'Queue a plan/apply run in a workspace, optionally destroy-only, refresh-only, or plan-only.',
  inputSchema: z.object({
    terraformToken: tokenField,
    workspaceId: z.string().describe('Workspace ID to run in'),
    message: z.string().optional().describe('Run message, e.g. "Queued via API for release v42"'),
    configurationVersionId: z
      .string()
      .optional()
      .describe('Configuration version ID to use (defaults to the workspace latest)'),
    isDestroy: z.boolean().optional().describe('Plan destruction of all resources'),
    refreshOnly: z.boolean().optional().describe('Refresh state without changing resources'),
    planOnly: z.boolean().optional().describe('Speculative plan that cannot be applied'),
    autoApply: z
      .boolean()
      .optional()
      .describe('Auto-apply on successful plan (overrides workspace setting)'),
    targetAddrs: z.array(z.string()).optional().describe('Resource addresses for -target'),
    replaceAddrs: z.array(z.string()).optional().describe('Resource addresses for -replace'),
    variables: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .optional()
      .describe('Run-specific variables as HCL literals, e.g. [{"key":"replicas","value":"2"}]'),
  }),
  execute: async ({
    terraformToken,
    workspaceId,
    message,
    configurationVersionId,
    isDestroy,
    refreshOnly,
    planOnly,
    autoApply,
    targetAddrs,
    replaceAddrs,
    variables,
  }) => {
    try {
      const result = await terraformRequest(terraformToken, '/runs', {
        method: 'POST',
        body: {
          data: {
            type: 'runs',
            attributes: {
              message,
              'is-destroy': isDestroy,
              'refresh-only': refreshOnly,
              'plan-only': planOnly,
              'auto-apply': autoApply,
              'target-addrs': targetAddrs,
              'replace-addrs': replaceAddrs,
              variables,
            },
            relationships: {
              workspace: { data: { type: 'workspaces', id: workspaceId } },
              ...(configurationVersionId
                ? {
                    'configuration-version': {
                      data: { type: 'configuration-versions', id: configurationVersionId },
                    },
                  }
                : {}),
            },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create Terraform run', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error creating Terraform run');
    }
  },
});

export const getRun = tool({
  description:
    'Get run details: status, plan/apply state, permissions, and timestamps. Poll this to track a run.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runId: runIdField,
  }),
  execute: async ({ terraformToken, runId }) => {
    try {
      const result = await terraformRequest(terraformToken, `/runs/${encodeURIComponent(runId)}`);
      if (!result.ok) return failedResult(`Failed to get Terraform run "${runId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform run "${runId}"`);
    }
  },
});

export const listOrganizationRuns = tool({
  description: 'List runs across an organization with status, workspace, and search filters.',
  inputSchema: z.object({
    terraformToken: tokenField,
    organization: z.string().describe('Organization name'),
    status: z
      .string()
      .optional()
      .describe('Comma-separated statuses, e.g. "planned_and_finished,errored"'),
    operation: z.string().optional().describe('Comma-separated operations, e.g. "plan_and_apply"'),
    workspaceNames: z.string().optional().describe('Comma-separated workspace names'),
    searchBasic: z.string().optional().describe('Match username, commit SHA, run ID, or message'),
    pageNumber: z.number().int().min(1).optional().describe('Page number (default 1)'),
    pageSize: z.number().int().min(1).max(100).optional().describe('Results per page (default 20)'),
  }),
  execute: async ({
    terraformToken,
    organization,
    status,
    operation,
    workspaceNames,
    searchBasic,
    pageNumber,
    pageSize,
  }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/organizations/${encodeURIComponent(organization)}/runs`,
        {
          query: {
            'filter[status]': status,
            'filter[operation]': operation,
            'filter[workspace_names]': workspaceNames,
            'search[basic]': searchBasic,
            ...pageParams(pageNumber, pageSize),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to list Terraform organization runs', result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, 'Error listing Terraform organization runs');
    }
  },
});

export const applyRun = tool({
  description: 'Confirm and apply a run paused for confirmation (planned / policy-checked states).',
  inputSchema: z.object({
    terraformToken: tokenField,
    runId: runIdField,
    comment: z.string().optional().describe('Approval comment, e.g. "Looks good to me"'),
  }),
  execute: async ({ terraformToken, runId, comment }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/runs/${encodeURIComponent(runId)}/actions/apply`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok) return failedResult(`Failed to apply Terraform run "${runId}"`, result);
      return { success: true, runId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error applying Terraform run "${runId}"`);
    }
  },
});

export const discardRun = tool({
  description: 'Discard a run waiting for confirmation so later runs can proceed.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runId: runIdField,
    comment: z.string().optional().describe('Explanation, e.g. "Superseded by newer config"'),
  }),
  execute: async ({ terraformToken, runId, comment }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/runs/${encodeURIComponent(runId)}/actions/discard`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok) return failedResult(`Failed to discard Terraform run "${runId}"`, result);
      return { success: true, runId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error discarding Terraform run "${runId}"`);
    }
  },
});

export const cancelRun = tool({
  description:
    'Gracefully cancel a planning or applying run (like Ctrl-C). Prefer over force-cancel.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runId: runIdField,
    comment: z.string().optional().describe('Explanation, e.g. "Stuck on provider auth"'),
  }),
  execute: async ({ terraformToken, runId, comment }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/runs/${encodeURIComponent(runId)}/actions/cancel`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok) return failedResult(`Failed to cancel Terraform run "${runId}"`, result);
      return { success: true, runId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error canceling Terraform run "${runId}"`);
    }
  },
});

export const forceCancelRun = tool({
  description:
    'Immediately terminate a run and unlock the workspace. Requires a prior cancel plus cool-off; may lose in-flight state.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runId: runIdField,
    comment: z.string().optional().describe('Explanation for the force-cancel'),
  }),
  execute: async ({ terraformToken, runId, comment }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/runs/${encodeURIComponent(runId)}/actions/force-cancel`,
        {
          method: 'POST',
          body: comment !== undefined ? { comment } : {},
        },
      );
      if (!result.ok)
        return failedResult(`Failed to force-cancel Terraform run "${runId}"`, result);
      return { success: true, runId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error force-canceling Terraform run "${runId}"`);
    }
  },
});

export const forceExecuteRun = tool({
  description:
    'Execute a pending run now, discarding blocking prior runs. Circumvents the normal queue; use sparingly.',
  inputSchema: z.object({
    terraformToken: tokenField,
    runId: runIdField,
  }),
  execute: async ({ terraformToken, runId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/runs/${encodeURIComponent(runId)}/actions/force-execute`,
        {
          method: 'POST',
        },
      );
      if (!result.ok)
        return failedResult(`Failed to force-execute Terraform run "${runId}"`, result);
      return { success: true, runId, statusCode: result.status };
    } catch (error) {
      return toTerraformError(error, `Error force-executing Terraform run "${runId}"`);
    }
  },
});
