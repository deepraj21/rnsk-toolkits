// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryCreateOrganizationMonitor = tool({
  description: "Creates a new monitor (type 'cron_job') within a Sentry organization to track scheduled tasks, allowing configuration of its name, slug (which must be unique if provided), status, owner, and muting preferences for incidents.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The human-readable name for the monitor. This name is used in notifications and the Sentry UI."),
    slug: z.string().optional().describe("A unique identifier for the monitor within the organization. If not provided, Sentry will generate one. It must match the pattern `^[a-z][a-z0-9_\\-]*$`. Changing this slug after creation requires updating any instrument"),
    owner: z.string().optional().describe("The Sentry actor ID (team or user) to be designated as the owner of this monitor. Format: 'user:{user_id}' or 'team:{team_id}'. If not provided, the monitor will be unassigned."),
    config: z.record(z.any()).describe("The configuration for the monitor including schedule type, schedule, and timing settings. This is a required field."),
    status: z.enum(["active", "disabled"]).optional().describe("The initial status of the monitor. 'active' monitors accept check-ins and contribute to quotas, while 'disabled' monitors do not. Allowed values: 'active', 'disabled'. Note: Monitors are typically created with 'disabled'"),
    project: z.string().describe("The project slug to associate the monitor to. This is a required field."),
    isMuted: z.boolean().optional().describe("A boolean flag to control incident creation for this monitor. If true, monitor incidents (alerts) will be suppressed. Defaults to false if not provided."),
    organizationIdOrSlug: z.string().describe("The identifier (ID or slug) of the Sentry organization to which this monitor will belong."),
  }),
  execute: async ({ sentryToken, name, slug, owner, config, status, project, isMuted, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/monitors/`, { body: { name: name, slug: slug, owner: owner, config: config, status: status, project: project, isMuted: isMuted } });
  },
});

export const sentryDeleteOrganizationMonitor = tool({
  description: "Deletes a Sentry cron monitor or, if `environment` is specified, only specific environments within that monitor.",
  inputSchema: z.object({
    sentryToken: tokenField,
    environment: z.array(z.string()).optional().describe("Optional list of environment names to delete; if omitted, the entire monitor (including all its environments) is deleted."),
    monitorIdOrSlug: z.string().describe("The ID or slug of the Sentry cron monitor to be deleted."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization to which the monitor belongs."),
  }),
  execute: async ({ sentryToken, environment, monitorIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/monitors/${monitorIdOrSlug}/`, { query: { environment: environment } });
  },
});

export const sentryDeleteProjectMonitor = tool({
  description: "Deletes a Sentry monitor, or optionally only its specified environments, for a given project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    environment: z.array(z.string()).optional().describe("Optional. A list of environment names. If provided, only the monitor configurations for these specific environments will be deleted. If this parameter is omitted or an empty list is passed, the entire monitor and all its"),
    monitorIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry monitor to be deleted."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project to which the monitor belongs."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the project and monitor belong."),
  }),
  execute: async ({ sentryToken, environment, monitorIdOrSlug, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/monitors/${monitorIdOrSlug}/`, { query: { environment: environment } });
  },
});

export const sentryFetchAMonitor = tool({
  description: "Fetches detailed information for a specific monitor (detector) within an organization. Use when you need to retrieve monitor configuration, status, or settings. This endpoint is currently in beta and is supported by New Monitors and Alerts.",
  inputSchema: z.object({
    sentryToken: tokenField,
    detectorId: z.number().int().describe("The ID of the monitor you'd like to query."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, detectorId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/detectors/${detectorId}/`, { query: {  } });
  },
});

export const sentryFetchAnOrganizationsMonitors = tool({
  description: "Retrieves monitors (detectors) for a Sentry organization. This endpoint is currently in beta and may be subject to change. Use when you need to list or query monitors for an organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.string()).optional().describe("The ID of the monitor you'd like to query. Can specify multiple monitor IDs to filter by."),
    query: z.string().optional().describe("An optional search query for filtering monitors."),
    sortBy: z.string().optional().describe("The property to sort results by. If not specified, results are sorted by id. Available fields: name, id, type, connectedWorkflows, latestGroup, openIssues. Prefix with `-` to sort in descending order."),
    project: z.array(z.number().int()).optional().describe("The IDs of projects to filter by. Use `-1` to include all available projects. Can specify multiple project IDs."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, query, sortBy, project, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/monitors/`, { query: { id: id, query: query, sortBy: sortBy, project: project } });
  },
});

export const sentryGetProjectMonitorById = tool({
  description: "Retrieves detailed information for a specific Sentry cron monitor, provided the organization, project, and monitor exist.",
  inputSchema: z.object({
    sentryToken: tokenField,
    monitorIdOrSlug: z.string().describe("ID or slug of the Sentry cron monitor."),
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, monitorIdOrSlug, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/monitors/${monitorIdOrSlug}/`, { query: {  } });
  },
});

export const sentryMutateAnOrganizationsMonitors = tool({
  description: "Bulk enable or disable monitors for an organization. This endpoint is in beta and may change. Use when you need to enable or disable multiple monitors at once based on filters.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.string()).optional().describe("The ID of the monitor you'd like to query."),
    query: z.string().optional().describe("An optional search query for filtering monitors."),
    enabled: z.boolean().describe("Whether to enable or disable the monitors."),
    project: z.array(z.string()).optional().describe("The IDs of projects to filter by. `-1` means all available projects. For example: `/?project=1234&project=56789` or `/?project=-1`"),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, query, enabled, project, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/monitors/`, { body: { id: id, query: query, enabled: enabled, project: project } });
  },
});

export const sentryRetrieveAMonitor = tool({
  description: "Retrieves detailed information for a specific monitor within an organization. Use when you need to check monitor configuration, status, schedule, environments, or alert settings.",
  inputSchema: z.object({
    sentryToken: tokenField,
    environment: z.array(z.string()).optional().describe("Optional list of environment names to filter monitor details by. If omitted, all environments are included."),
    monitorIdOrSlug: z.string().describe("The ID or slug of the monitor to retrieve details for."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the monitor belongs to."),
  }),
  execute: async ({ sentryToken, environment, monitorIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/monitors/${monitorIdOrSlug}/`, { query: { environment: environment } });
  },
});

export const sentryRetrieveMonitorCheckins = tool({
  description: "Retrieves the history of check-ins for a Sentry monitor, providing insights into the health and performance of associated scheduled tasks.",
  inputSchema: z.object({
    sentryToken: tokenField,
    monitorIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry monitor. This specifies the monitor for which check-ins are to be retrieved."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry project. This specifies the project to which the monitor belongs, within the given organization."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization. This specifies the organization to which the project and monitor belong."),
  }),
  execute: async ({ sentryToken, monitorIdOrSlug, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/monitors/${monitorIdOrSlug}/checkins/`, { query: {  } });
  },
});

export const sentryRetrieveMonitorCheckinsByOrg = tool({
  description: "Retrieves check-ins (pings/heartbeats of a monitored cron job or task) for a specific monitor within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    monitorIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the monitor."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, monitorIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/monitors/${monitorIdOrSlug}/checkins/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationMonitors = tool({
  description: "Retrieves cron monitors for a Sentry organization, including details of nested monitor environments.",
  inputSchema: z.object({
    sentryToken: tokenField,
    owner: z.string().optional().describe("Filter by owner, using `user:<user_id>` or `team:<team_id>` format."),
    project: z.array(z.number().int()).optional().describe("List of project IDs to filter by; use `[-1]` for all accessible projects."),
    environment: z.array(z.string()).optional().describe("List of environment names (e.g., 'production', 'staging') to filter by."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, owner, project, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/monitors/`, { query: { owner: owner, project: project, environment: environment } });
  },
});

export const sentryUpdateAMonitor = tool({
  description: "Updates a monitor's configuration and settings. Use when you need to modify monitor name, schedule, check-in margin, max runtime, timezone, or alert thresholds.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The name of the monitor. Used in notifications and the Sentry UI. This is required for updating a monitor."),
    slug: z.string().optional().describe("A unique identifier for the monitor within the organization. Changing this slug requires updating any instrumented check-in calls. Must match pattern ^[a-z][a-z0-9_\\-]*$."),
    owner: z.string().optional().describe("The ID of the team or user that owns the monitor. Format: 'user:{user_id}' or 'team:{team_id}'."),
    config: z.record(z.any()).describe("The configuration object for the monitor, including schedule, checkin margin, max runtime, timezone, and alert thresholds."),
    status: z.enum(["active", "disabled"]).optional().describe("The status of the monitor. 'active' monitors accept events and count towards quota; 'disabled' monitors do not."),
    project: z.string().describe("The project slug to associate the monitor with. This is required for updating a monitor."),
    isMuted: z.boolean().optional().describe("Whether to disable creation of monitor incidents. Set to true to suppress alerts for this monitor."),
    monitorIdOrSlug: z.string().describe("The ID or slug of the monitor to update."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the monitor belongs to."),
  }),
  execute: async ({ sentryToken, name, slug, owner, config, status, project, isMuted, monitorIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/monitors/${monitorIdOrSlug}/`, { body: { name: name, slug: slug, owner: owner, config: config, status: status, project: project, isMuted: isMuted } });
  },
});

export const sentryUpdateAMonitorById = tool({
  description: "Updates an existing Sentry monitor (detector) for metric-based issue detection. Use when you need to modify monitor configuration, thresholds, data sources, or enable/disable the monitor. Note: This endpoint is in beta and may change.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("Name of the monitor."),
    type: z.string().describe("The type of monitor. Must be 'metric_issue'."),
    owner: z.any().optional().describe("The user or team who owns the monitor. Can be a string or an object with type, id, name, and optional email."),
    config: z.record(z.any()).optional().describe("Issue detection type configuration."),
    enabled: z.boolean().optional().describe("Set to false if you want to disable the monitor. Defaults to true."),
    detectorId: z.number().int().describe("The ID of the monitor you'd like to update."),
    dataSources: z.array(z.any()).optional().describe("The data sources for the monitor to use based on what you want to measure (errors, transactions, spans, etc.)."),
    description: z.string().optional().describe("A description of the monitor. Will be used in the resulting issue."),
    conditionGroup: z.record(z.any()).optional().describe("Issue detection configuration for when to create an issue and at what priority level."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, name, type, owner, config, enabled, detectorId, dataSources, description, conditionGroup, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/detectors/${detectorId}/`, { body: { name: name, type: type, owner: owner, config: config, enabled: enabled, dataSources: dataSources, description: description, conditionGroup: conditionGroup } });
  },
});

export const sentryUpdateMonitorForProject = tool({
  description: "Updates a monitor for a project. Use when you need to modify monitor name, schedule, check-in margin, max runtime, timezone, status, owner, or alert thresholds for a project-level monitor.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("Name of the monitor. Used for notifications. Required field."),
    slug: z.string().optional().describe("Uniquely identifies your monitor within your organization. Changing this slug will require updates to any instrumented check-in calls. Must start with a lowercase letter and contain only lowercase letters, numbers, under"),
    owner: z.string().optional().describe("The ID of the team or user that owns the monitor. Format: 'user:51' or 'team:6'."),
    config: z.record(z.any()).describe("The configuration for the monitor including schedule, thresholds, and alert settings."),
    status: z.enum(["active", "disabled"]).optional().describe("Status of the monitor. Disabled monitors will not accept events and will not count towards the monitor quota."),
    project: z.string().describe("The project slug to associate the monitor to. Required field."),
    isMuted: z.boolean().optional().describe("Disable creation of monitor incidents. Set to true to suppress alerts."),
    monitorIdOrSlug: z.string().describe("The ID or slug of the monitor to update."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project the resource belongs to."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, name, slug, owner, config, status, project, isMuted, monitorIdOrSlug, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/monitors/${monitorIdOrSlug}/`, { body: { name: name, slug: slug, owner: owner, config: config, status: status, project: project, isMuted: isMuted } });
  },
});
