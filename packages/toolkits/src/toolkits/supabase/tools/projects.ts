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

export const supabaseBetaUpgradeProjectPostgresVersion = tool({
  description:
    "Initiates an asynchronous upgrade of a Supabase project's PostgreSQL database to a specified `target_version` from a selected `release_channel`, returning a `tracking_id` to monitor status; the `target_version` must be available in the chosen channel. Upgrade is asynchronous; the tracking_id monitors status.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe("The project's unique reference ID."),
    targetVersion: z
      .string()
      .describe(
        "Target PostgreSQL version (e.g., '15.1.0.123'); must be available in the specified `release_channel`.",
      ),
    releaseChannel: z
      .enum(['alpha', 'beta', 'ga', 'internal', 'withdrawn'])
      .describe('Release channel for selecting the PostgreSQL version.'),
  }),
  execute: async ({ supabaseAccessToken, ref, targetVersion, releaseChannel }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/upgrade`, {
      body: pickDefined({ target_version: targetVersion, release_channel: releaseChannel }),
    });
  },
});

export const supabaseCreateAProject = tool({
  description:
    'Creates a new Supabase project, requiring a unique name (no dots) within the organization; project creation is asynchronous. Project creation is asynchronous; poll the project until status is ACTIVE_HEALTHY.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    name: z
      .string()
      .describe(
        'Name for the new project; must be unique within the organization and not contain dots.',
      ),
    plan: z
      .enum(['free', 'pro'])
      .optional()
      .describe('Subscription plans (now set at the organization level).'),
    region: z
      .enum([
        'ap-east-1',
        'ap-northeast-1',
        'ap-northeast-2',
        'ap-south-1',
        'ap-southeast-1',
        'ap-southeast-2',
        'ca-central-1',
        'eu-central-1',
        'eu-central-2',
        'eu-north-1',
        'eu-west-1',
        'eu-west-2',
        'eu-west-3',
        'sa-east-1',
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
      ])
      .describe("Geographical region for the project's server and database."),
    dbPass: z
      .string()
      .describe(
        'Password for the new database (required). Must be a secure password. IMPORTANT: Store this password securely as it cannot be retrieved later via the API and is needed for direct database connections.',
      ),
    kpsEnabled: z.boolean().optional().describe('Deprecated and ignored.'),
    templateUrl: z
      .string()
      .optional()
      .describe(
        'Optional URL to a Supabase project template (e.g., from Git) to initialize the project.',
      ),
    organizationId: z
      .string()
      .describe(
        "The actual organization ID or slug from your Supabase account. IMPORTANT: 'personal' is NOT a valid value - you must use the real organization ID returned by the 'List All Organizations' API endpoint (GET /v1/organizations) or found in your Supabase dashboard settings.",
      ),
    postgresEngine: z
      .enum(['15'])
      .optional()
      .describe('Supported major versions of the PostgreSQL engine.'),
    releaseChannel: z
      .enum(['alpha', 'beta', 'ga', 'internal', 'withdrawn'])
      .optional()
      .describe('Available release channels for Supabase software.'),
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
      .describe('Available compute instance sizes for a Supabase project.'),
  }),
  execute: async ({
    supabaseAccessToken,
    name,
    plan,
    region,
    dbPass,
    kpsEnabled,
    templateUrl,
    organizationId,
    postgresEngine,
    releaseChannel,
    desiredInstanceSize,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(supabaseAccessToken, `/v1/projects`, {
      body: pickDefined({
        name: name,
        plan: plan,
        region: region,
        db_pass: dbPass,
        kps_enabled: kpsEnabled,
        template_url: templateUrl,
        organization_id: organizationId,
        postgres_engine: postgresEngine,
        release_channel: releaseChannel,
        desired_instance_size: desiredInstanceSize,
      }),
    });
  },
});

export const supabaseDeleteProject = tool({
  description:
    'Permanently and irreversibly deletes a Supabase project and all associated resources, including databases, storage, and configurations. This action is irreversible \u2014 the project cannot be recovered once deleted. Use when you need to completely remove a project from your organization. Deletion is permanent and removes databases, storage and configuration.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'Project reference identifier (unique identifier for the project). This is typically a 20-character alphanumeric string found in your project URL or via the List All Projects endpoint.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}`);
  },
});

export const supabaseDisableProjectReadonly = tool({
  description:
    "Temporarily disables a Supabase project's read-only mode for 15 minutes to allow write operations (e.g., for maintenance or critical updates), after which it automatically reverts to read-only. Disables read-only mode for 15 minutes, then it reverts automatically.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/readonly/temporary-disable`,
    );
  },
});

export const supabaseGetHealth = tool({
  description:
    'Tool to check the health status of the Supabase API. Use when you need to verify API availability or troubleshoot connectivity issues. Best-effort mapping to the Supabase Management API health endpoint.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
  }),
  execute: async ({ supabaseAccessToken }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/health`);
  },
});

export const supabaseGetProject = tool({
  description:
    "Retrieves detailed information about a specific Supabase project by its unique reference ID. Use when you need to get comprehensive project details including status, database configuration, and metadata. Authentication: - Requires a valid Bearer token in the Authorization header. - Token format: 'Bearer <access_token>' where access_token is either: - A Personal Access Token (PAT) generated from https://supabase.com/dashboard/account/tokens - An OAuth2 access token with the 'project_admin_read' scope Required Scope: - project_admin_read: Allows retrieval of project information. Returns: Project object containing id, ref, name, organization details, region, status, database configuration, and created_at timestamp.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe('Project ref - unique identifier (20 lowercase letters) for the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}`);
  },
});

export const supabaseGetProjectReadonlyModeStatus = tool({
  description:
    'Retrieves the read-only mode status for a specified Supabase project to check its operational state; this action does not change the read-only state.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "Project reference ID, found in your project's dashboard URL (e.g., `https://supabase.com/dashboard/project/<project-ref>`).",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/readonly`);
  },
});

export const supabaseGetProjectUpgradeEligibility = tool({
  description:
    "Checks a Supabase project's eligibility for an upgrade, verifying compatibility and identifying potential issues; this action does not perform the actual upgrade.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "Unique identifier of the Supabase project (e.g., 'opntiysxcrktmaarzjhz'). Can be obtained from the Supabase dashboard URL or by listing all projects.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/upgrade/eligibility`,
    );
  },
});

export const supabaseGetProjectUpgradeStatus = tool({
  description:
    "Retrieves the latest status of a Supabase project's database upgrade for monitoring purposes; does not initiate or modify upgrades.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/upgrade/status`,
    );
  },
});

export const supabaseGetsProjectSServiceHealthStatus = tool({
  description:
    "Retrieves the current health status for a Supabase project, for specified services or all services if the 'services' list is omitted.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier (ref) of the Supabase project.'),
    services: z
      .array(
        z.enum([
          'auth',
          'db',
          'db_postgres_user',
          'pg_bouncer',
          'pooler',
          'realtime',
          'rest',
          'storage',
        ]),
      )
      .optional()
      .describe(
        'A list of specific services for which to retrieve health status. If omitted, returns health status for all services. Valid values: auth, db, db_postgres_user, pg_bouncer, pooler, realtime, rest, storage.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, services }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}/health`, {
      query: pickDefined({ services: services }),
    });
  },
});

export const supabaseListAllProjects = tool({
  description:
    "Retrieves a list of all Supabase projects, including their ID, name, region, and status, for the authenticated user. Authentication: - Requires a valid Bearer token in the Authorization header. - Token format: 'Bearer <access_token>' where access_token is either: - A Personal Access Token (PAT) generated from https://supabase.com/dashboard/account/tokens - An OAuth2 access token with the 'Projects.Read' scope Required Scope: - Projects.Read: Allows retrieval of project metadata. Returns: List of Project objects containing id, name, organization_id, region, status, database info, and created_at.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
  }),
  execute: async ({ supabaseAccessToken }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(supabaseAccessToken, `/v1/projects`);
  },
});

export const supabaseUpdateProject = tool({
  description:
    "Updates a Supabase project's configuration (currently supports updating the project name). Use when you need to rename an existing project.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        'Project reference identifier (unique identifier for the project). This is typically a 20-character alphanumeric string found in your project URL or via the List All Projects endpoint.',
      ),
    name: z
      .string()
      .describe(
        'New name for the project. Must be between 1 and 256 characters. This is the human-readable display name that will appear in the Supabase dashboard.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, name }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(supabaseAccessToken, `/v1/projects/${encodeURIComponent(String(ref))}`, {
      body: pickDefined({ name: name }),
    });
  },
});
