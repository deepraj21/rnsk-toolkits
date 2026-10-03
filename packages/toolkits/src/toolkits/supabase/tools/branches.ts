// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  buildQuery,
  parseResponse,
  pickDefined,
  resolveApiKey,
  sbDelete,
  sbGet,
  sbHead,
  sbOptions,
  sbPatch,
  sbPost,
  sbPut,
  tusOptions,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const supabaseCountActionRuns = tool({
  description:
    'Counts the number of action runs for a Supabase project using a HEAD request. Use this when you need to retrieve the total count of action runs without fetching the full list of runs. HEAD request; the count comes from response headers without fetching runs.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID (20 alphanumeric characters) of your Supabase project. You can find this in your project's dashboard URL or by calling the List All Projects action.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const res = await sbHead(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/actions`,
    );
    if (res && typeof res === 'object' && 'error' in res) return res;
    const { status, headers } = res;
    let count = null;
    const range = headers.get('content-range');
    const total = headers.get('x-total-count') ?? headers.get('total-count');
    if (range) {
      const m = range.match(/\/(\d+)\s*$/);
      if (m) count = Number(m[1]);
    } else if (total !== null && total !== '') {
      count = Number(total);
    }
    return { status_code: status, count };
  },
});

export const supabaseCreateDatabaseBranch = tool({
  description:
    'Creates a new, isolated database branch from an existing Supabase project (identified by `ref`), useful for setting up separate environments like development or testing, which can optionally be linked to a Git branch.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the parent Supabase project.'),
    region: z.string().optional().describe('Geographical region for the new database branch.'),
    gitBranch: z
      .string()
      .optional()
      .describe(
        'Git branch name to associate with this database branch, linking database states to code branches.',
      ),
    persistent: z
      .boolean()
      .optional()
      .describe(
        'Specifies if the branch is persistent (true) or ephemeral (false); ephemeral branches might be auto-deleted.',
      ),
    branchName: z.string().describe('A unique name for the new database branch.'),
    postgresEngine: z
      .enum(['15'])
      .optional()
      .describe('Desired PostgreSQL engine version for the new branch.'),
    releaseChannel: z
      .enum(['alpha', 'beta', 'ga', 'internal', 'withdrawn'])
      .optional()
      .describe(
        'Release channel for Supabase features on this branch, determining feature stability.',
      ),
    desiredInstanceSize: z
      .enum([
        '12xlarge',
        '16xlarge',
        '2xlarge',
        '4xlarge',
        '8xlarge',
        'large',
        'medium',
        'micro',
        'small',
        'xlarge',
      ])
      .optional()
      .describe('Compute instance size for the new database branch.'),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    region,
    gitBranch,
    persistent,
    branchName,
    postgresEngine,
    releaseChannel,
    desiredInstanceSize,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/branches`, {
      body: pickDefined({
        region: region,
        git_branch: gitBranch,
        persistent: persistent,
        branch_name: branchName,
        postgres_engine: postgresEngine,
        release_channel: releaseChannel,
        desired_instance_size: desiredInstanceSize,
      }),
    });
  },
});

export const supabaseDeleteAllBranches = tool({
  description:
    'Disables preview branching for a Supabase project, which deletes all remaining branches. IMPORTANT: Before calling this endpoint, you must manually delete all non-default branches. The API will reject the request with a 422 error if non-default branches exist. Use this action when you need to completely disable the preview branching feature for a project. This action is irreversible - all branches will be permanently removed and preview branching will be disabled. Requirements: - Preview branching must be enabled on the project - All non-default branches must be deleted first - Project must be on Pro plan or above to have preview branching Disables preview branching; delete all non-default branches first or the API returns 422.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project for which all database branches will be deleted. This ID can be found in your project's dashboard URL.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/branches`,
    );
  },
});

export const supabaseDeleteDatabaseBranch = tool({
  description:
    'Permanently and irreversibly deletes a specific, non-default database branch by its `branch_id`, without affecting other branches. Deletion is permanent and only allowed for non-default branches.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    branchId: z.string().describe('The unique identifier of the database branch to be deleted.'),
  }),
  execute: async ({ supabaseAccessToken, branchId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(supabaseAccessToken, `/v1/branches/${encodeURIComponent(String(branchId))}`);
  },
});

export const supabaseDisablePreviewBranching = tool({
  description:
    'Disables the preview branching feature for an existing Supabase project, identified by its unique reference ID (`ref`). Note: Preview branching must be enabled on the project for this operation to succeed. If the project does not have preview branching enabled, a 422 error will be returned. Returns 422 unless preview branching is enabled.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project for which preview branching is to be disabled.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/branches`,
    );
  },
});

export const supabaseGetActionRun = tool({
  description:
    'Retrieves the status and details of a specific action run, including its steps, timestamps, and configuration. Use this to monitor or check the progress of an action execution.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project. Must be exactly 20 lowercase alphanumeric characters.',
      ),
    runId: z.string().describe('The unique identifier of the action run to retrieve.'),
  }),
  execute: async ({ supabaseAccessToken, ref, runId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/actions/${encodeURIComponent(String(runId))}`,
    );
  },
});

export const supabaseGetActionRunLogs = tool({
  description:
    'Retrieves the execution logs for a specific action run by its ID. Use this to debug action executions, view output messages, and investigate errors that occurred during action runs.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'The unique reference ID of the Supabase project. This is visible in your Supabase project URL (e.g., https://supabase.com/dashboard/project/{ref}).',
      ),
    runId: z
      .string()
      .describe(
        'The unique identifier for the action run. This is returned when an action is triggered or can be retrieved from the actions list.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, runId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/actions/${encodeURIComponent(String(runId))}/logs`,
    );
  },
});

export const supabaseGetBranch = tool({
  description:
    'Retrieves detailed information about a specific database branch by its name and project reference. Use this to check branch status, configuration, and metadata before performing operations on the branch.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference identifier (project ref) of the parent Supabase project. This ID can be found in your project's dashboard URL.",
      ),
    name: z
      .string()
      .describe(
        "The unique name of the database branch to retrieve (e.g., 'test-branch-fix', 'staging', 'feature-x').",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, name }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/branches/${encodeURIComponent(String(name))}`,
    );
  },
});

export const supabaseGetDatabaseBranchConfig = tool({
  description:
    'Retrieves the read-only configuration and status for a Supabase database branch, typically for monitoring or verifying its settings.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    branchId: z
      .string()
      .describe(
        'Project reference (ref) for the database branch. Must be exactly 20 lowercase alphabetic characters.',
      ),
  }),
  execute: async ({ supabaseAccessToken, branchId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/branches/${encodeURIComponent(String(branchId))}`);
  },
});

export const supabaseListBranches = tool({
  description:
    "Lists all database branches for a specified Supabase project, providing information about each branch's status, configuration, and metadata. Use this action when you need to view all branches in a project, check branch statuses, or identify available branches before performing operations. Database branches are useful for isolated development and testing of schema changes.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference identifier (project ref) of the Supabase project. This ID can be found in your project's dashboard URL.",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of branches to return per request. Defaults to 25.'),
    offset: z
      .number()
      .int()
      .optional()
      .describe('Number of branches to skip before returning results. Use for pagination.'),
  }),
  execute: async ({ supabaseAccessToken, ref, limit, offset }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/branches`, {
      query: pickDefined({ limit: limit, offset: offset }),
    });
  },
});

export const supabaseListDatabaseBranches = tool({
  description:
    'Lists all database branches for a specified Supabase project, used for isolated development and testing of schema changes; ensure the project reference ID is valid.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique identifier (reference ID) of the Supabase project. This ID can be found in your project's dashboard URL (e.g., `https://supabase.com/dashboard/project/<project_id>`).",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/branches`);
  },
});

export const supabaseMergeBranch = tool({
  description:
    'Merges a database branch, applying all schema changes and migrations from the branch to the target database. Use this action when you need to promote changes from a database branch to production or another target environment after testing and validation are complete. This operation is irreversible - once merged, the changes cannot be automatically rolled back. Irreversible once merged; changes cannot be auto-rolled back.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    branchIdOrRef: z
      .string()
      .describe(
        'The unique identifier (UUID format) or reference of the database branch to merge.',
      ),
    migrationVersion: z
      .string()
      .optional()
      .describe(
        "Optional migration version to merge up to. Format: timestamp like '20260216000000'. If not provided, merges all migrations.",
      ),
  }),
  execute: async ({ supabaseAccessToken, branchIdOrRef, migrationVersion }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/branches/${encodeURIComponent(String(branchIdOrRef))}/merge`,
      { body: pickDefined({ migration_version: migrationVersion }) },
    );
  },
});

export const supabasePushBranch = tool({
  description:
    'Pushes a database branch, applying migrations and changes to the specified branch. Use when you need to deploy schema changes or migrations to a database branch.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    branchIdOrRef: z
      .string()
      .describe('The unique identifier or reference of the database branch to push.'),
    migrationVersion: z
      .string()
      .optional()
      .describe(
        "Optional migration version to push to the branch. Format: timestamp like '20260216000000'.",
      ),
  }),
  execute: async ({ supabaseAccessToken, branchIdOrRef, migrationVersion }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/branches/${encodeURIComponent(String(branchIdOrRef))}/push`,
      { body: pickDefined({ migration_version: migrationVersion }) },
    );
  },
});

export const supabaseResetDatabaseBranch = tool({
  description:
    'Resets an existing Supabase database branch, identified by `branch_id`, to its initial clean state, irreversibly deleting all its current data and schema changes. Resets to a clean state, deleting all data and schema changes.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    branchId: z.string().describe('The unique identifier of the database branch to reset.'),
  }),
  execute: async ({ supabaseAccessToken, branchId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/branches/${encodeURIComponent(String(branchIdOrRef))}/reset`,
      { query: pickDefined({ branch_id: branchId }) },
    );
  },
});

export const supabaseUpdateBranch = tool({
  description:
    'Updates the configuration of a Supabase database branch, allowing modification of its name, associated Git branch, notification URL, persistence settings, and status. Use this action when you need to modify branch settings after creation, such as linking to a different Git branch, changing the branch name, or updating persistence behavior. Note: Database branching requires a paid Supabase plan (Pro or higher). Requires a paid plan.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    status: z
      .enum([
        'CREATING_PROJECT',
        'RUNNING_MIGRATIONS',
        'MIGRATIONS_PASSED',
        'MIGRATIONS_FAILED',
        'FUNCTIONS_DEPLOYED',
        'FUNCTIONS_FAILED',
      ])
      .optional()
      .describe('Status values that can be set when updating a branch.'),
    gitBranch: z
      .string()
      .optional()
      .describe(
        'Name of the Git branch to associate with this database branch. If not provided, the association remains unchanged.',
      ),
    notifyUrl: z
      .string()
      .optional()
      .describe('HTTP endpoint to receive branch status updates. Must be a valid URI.'),
    persistent: z
      .boolean()
      .optional()
      .describe(
        'If true, the database branch is persistent; non-persistent branches may be auto-cleaned. If not provided, this setting remains unchanged.',
      ),
    branchName: z
      .string()
      .optional()
      .describe('New name for the database branch. If not provided, the name remains unchanged.'),
    resetOnPush: z
      .boolean()
      .optional()
      .describe(
        'This field is deprecated and will be ignored. Use v1-reset-a-branch endpoint directly instead.',
      ),
    requestReview: z
      .boolean()
      .optional()
      .describe(
        'If true, requests a review for this branch. If not provided, this setting remains unchanged.',
      ),
    branchIdOrRef: z
      .string()
      .describe('Unique identifier or reference of the database branch to update.'),
  }),
  execute: async ({
    supabaseAccessToken,
    status,
    gitBranch,
    notifyUrl,
    persistent,
    branchName,
    resetOnPush,
    requestReview,
    branchIdOrRef,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/branches/${encodeURIComponent(String(branchIdOrRef))}`,
      {
        body: pickDefined({
          status: status,
          git_branch: gitBranch,
          notify_url: notifyUrl,
          persistent: persistent,
          branch_name: branchName,
          reset_on_push: resetOnPush,
          request_review: requestReview,
        }),
      },
    );
  },
});

export const supabaseUpdateDatabaseBranchConfig = tool({
  description:
    "Updates the configuration of a Supabase database branch, allowing modification of its name, associated Git branch, reset-on-push behavior, persistence, and status. Note: Database branching requires a paid Supabase plan (Pro or higher). This action requires a valid branch_id which must be exactly 20 lowercase alphabetic characters. Authentication: - Requires a valid Bearer token in the Authorization header. - Token format: 'Bearer <access_token>' Required Scope: - Environment:Write Requires a paid plan.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    status: z
      .enum([
        'CREATING_PROJECT',
        'FUNCTIONS_DEPLOYED',
        'FUNCTIONS_FAILED',
        'MIGRATIONS_FAILED',
        'MIGRATIONS_PASSED',
        'RUNNING_MIGRATIONS',
      ])
      .optional()
      .describe('Status values that can be set when updating a branch.'),
    branchId: z
      .string()
      .describe(
        'Unique identifier of the database branch to update. Must be exactly 20 lowercase alphabetic characters.',
      ),
    gitBranch: z
      .string()
      .optional()
      .describe(
        'Name of the Git branch to associate with this database branch. If not provided, the association remains unchanged.',
      ),
    persistent: z
      .boolean()
      .optional()
      .describe(
        'If true, the database branch is persistent; non-persistent branches may be auto-cleaned. If not provided, this setting remains unchanged.',
      ),
    branchName: z
      .string()
      .optional()
      .describe('New name for the database branch. If not provided, the name remains unchanged.'),
    resetOnPush: z
      .boolean()
      .optional()
      .describe(
        'If true, resets the database branch on new push to the linked Git branch. If not provided, this setting remains unchanged.',
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    status,
    branchId,
    gitBranch,
    persistent,
    branchName,
    resetOnPush,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(supabaseAccessToken, `/v1/branches/${encodeURIComponent(String(branchId))}`, {
      body: pickDefined({
        status: status,
        git_branch: gitBranch,
        persistent: persistent,
        branch_name: branchName,
        reset_on_push: resetOnPush,
      }),
    });
  },
});
