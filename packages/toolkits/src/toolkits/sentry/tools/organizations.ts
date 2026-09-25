// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryDisableSpikeProtection = tool({
  description: "Disables Spike Protection feature for specified projects within a Sentry organization. Use this when you need to turn off spike protection for one or more projects.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projects: z.array(z.string()).describe("List of project slugs to disable Spike Protection for; use `['$all']` to disable for all projects in the organization."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projects, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/spike-protections/`, { query: { projects: projects } });
  },
});

export const sentryFetchOrganizationReleaseThresholdStatuses = tool({
  description: "Retrieves derived health statuses for release thresholds in a Sentry organization for a given time range, optionally filtered by environment, project, or release; `start` and `end` times must be provided together. **`[WARNING]`**: This API is experimental (Alpha) and subject to change!",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().describe("The inclusive end of the time series range for querying release threshold statuses. Must be in UTC ISO8601 format (e.g., '2023-01-01T23:59:59Z')."),
    start: z.string().describe("The start of the time series range for querying release threshold statuses. Must be in UTC ISO8601 format (e.g., '2023-01-01T00:00:00Z')."),
    release: z.array(z.string()).optional().describe("A list of release versions (e.g., '1.0.0', 'my-app@2.1.3') to filter the release threshold statuses by. If not provided, statuses for all releases within the time range are considered."),
    environment: z.array(z.string()).optional().describe("A list of environment names (e.g., 'production', 'staging') to filter the release threshold statuses by. If not provided, statuses for all environments are considered."),
    projectSlug: z.array(z.string()).optional().describe("A list of project slugs (e.g., 'frontend', 'backend-api') to filter the release threshold statuses by. If not provided, statuses for all projects in the organization are considered."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization for which to fetch release threshold statuses."),
  }),
  execute: async ({ sentryToken, end, start, release, environment, projectSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/release-threshold-statuses/`, { query: { end: end, start: start, release: release, environment: environment, projectSlug: projectSlug } });
  },
});

export const sentryGetOrganizationByIdOrSlug = tool({
  description: "Retrieves a Sentry organization by its ID or slug; use the `detailed` parameter to optionally exclude project and team details for a more concise response.",
  inputSchema: z.object({
    sentryToken: tokenField,
    detailed: z.string().optional().describe("Optional query parameter controlling response detail level. Set to '0' to exclude project and team details for a more concise response. Set to '1' (or omit entirely) for full details including projects and teams."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, detailed, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/`, { query: { detailed: detailed } });
  },
});

export const sentryGetOrganizationDetails = tool({
  description: "Retrieves Sentry organizations accessible via the current authentication, with scope varying between user (all in region) and API key (linked org only) credentials.",
  inputSchema: z.object({
    sentryToken: tokenField,
    owner: z.boolean().optional().describe("Set to `true` to list only organizations where the authenticated user is an owner."),
    query: z.string().optional().describe("Filter results using Sentry's query syntax. Supported fields: `id` (organization ID), `slug` (organization slug), `status` (current status like 'active', 'pending_deletion'), `email` or `member_id` (member's email or ID)"),
    cursor: z.string().optional().describe("Opaque cursor for pagination to retrieve next/previous result sets."),
    sortBy: z.string().optional().describe("Sort results by 'members' (number of members), 'projects' (number of projects), or 'events' (number of events in past 24h), in descending order. Defaults to creation date."),
  }),
  execute: async ({ sentryToken, owner, query, cursor, sortBy }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/`, { query: { owner: owner, query: query, cursor: cursor, sortBy: sortBy } });
  },
});

export const sentryGetOrganizationEnvironments = tool({
  description: "Lists deployment environments for a Sentry organization, optionally filtered by visibility status. Environments represent deployment contexts like 'production', 'staging', or 'development' where events are tracked. By default, only visible environments are returned. Use the visibility parameter to i",
  inputSchema: z.object({
    sentryToken: tokenField,
    visibility: z.enum(["all", "hidden", "visible"]).optional().describe("Filter by visibility status. Options: 'visible' (default, shows only visible environments), 'hidden' (shows only hidden environments), 'all' (shows all environments including hidden)."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, visibility, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/environments/`, { query: { visibility: visibility } });
  },
});

export const sentryGetOrganizationSessions = tool({
  description: "Retrieves time series data for an organization's Sentry project release health sessions; note session duration data (e.g., using `avg(session.duration)`) may be incomplete after Jan 12, 2023, results are capped at 10,000 data points, `statsPeriod` overrides `start`/`end` timestamps, and the `interva",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("End of the query period (ISO-8601 format). Ignored if `statsPeriod` is provided."),
    field: z.array(z.string()).describe("Fields for session statistics (e.g., `sum(session)`, `count_unique(user)`, `p99(session.duration)`, `crash_free_rate(user)`). Session duration aggregations may be incomplete for data after Jan 12, 2023."),
    query: z.string().optional().describe("Sentry search query to filter sessions (e.g., `(transaction:foo AND release:abc)`). See Sentry docs for syntax."),
    start: z.string().optional().describe("Start of the query period (ISO-8601 format). Ignored if `statsPeriod` is provided."),
    groupBy: z.array(z.string()).optional().describe("Properties to group session data by (e.g., `project`, `release`, `environment`, `session.status`)."),
    orderBy: z.string().optional().describe("Field from `field` parameter to order results by. Prefix with '-' for descending (e.g., `-sum(session)`)."),
    project: z.array(z.number().int()).optional().describe("Project IDs to filter sessions by. Use `[-1]` for all accessible projects."),
    interval: z.string().optional().describe("Time series data resolution (e.g., '1h', '1d'; format like `statsPeriod`). Minimum '1h', maximum '1d'. Must cleanly divide one day."),
    perPage: z.number().int().optional().describe("Maximum number of groups (aggregated data points based on `groupBy`) per request."),
    environment: z.array(z.string()).optional().describe("Environment names to filter sessions by (e.g., 'production', 'staging')."),
    statsPeriod: z.string().optional().describe("Relative query period (e.g., '24h', '7d'), overrides `start` and `end`. Uses 'd' (days), 'h' (hours), 'm' (minutes), 's' (seconds), or 'w' (weeks)."),
    includeSeries: z.number().int().optional().describe("Set to `0` to exclude, `1` (API default) to include time series data."),
    includeTotals: z.number().int().optional().describe("Set to `0` to exclude, `1` (API default) to include totals."),
    organizationIdOrSlug: z.string().describe("Unique ID or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, field, query, start, groupBy, orderBy, project, interval, perPage, environment, statsPeriod, includeSeries, includeTotals, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/sessions/`, { query: { end: end, field: field, query: query, start: start, groupBy: groupBy, orderBy: orderBy, project: project, interval: interval, per_page: perPage, environment: environment, statsPeriod: statsPeriod, includeSeries: includeSeries, includeTotals: includeTotals } });
  },
});

export const sentryGetOrganizationStatsSummary = tool({
  description: "Retrieves summarized event statistics for a Sentry organization, aggregated by project, allowing queries for event counts or unique occurrences over a specified time period and resolution, with filtering by project, category, and outcome.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("Inclusive end of the time series range (UTC ISO8601 datetime string or Unix timestamp). Use with `start` instead of `statsPeriod`."),
    field: z.enum(["sum(quantity)", "sum(times_seen)"]).describe("Aggregation field for event counts. Interpretation depends on event type: `sum(quantity)`: For attachments, total size in bytes. For sessions, total events within sessions. For others, event count. `sum(times_seen)`: Sum"),
    start: z.string().optional().describe("Start of the time series range (UTC ISO8601 datetime string or Unix timestamp). Use with `end` instead of `statsPeriod`."),
    reason: z.string().optional().describe("Reason an event was filtered or dropped (e.g., `project_quota`, `invalid_origin`)."),
    outcome: z.enum(["accepted", "filtered", "rate_limited", "invalid", "abuse", "client_discard", "cardinality_limited"]).optional().describe("Filter by event outcome status (e.g., accepted, filtered, rate-limited)."),
    project: z.array(z.any()).optional().describe("List of project IDs (strings or integers) to filter by. Omit or use empty list for all projects."),
    category: z.enum(["error", "transaction", "attachment", "replays", "profiles"]).optional().describe("Filter by event category. If 'attachment', other categories cannot be included. If 'error', `default` and `security` are also included."),
    download: z.boolean().optional().describe("If true, triggers a CSV download of the response; otherwise JSON."),
    interval: z.string().optional().describe("Time series resolution (e.g., `1h`). Default is `1h`. Minimum `1h`. Intervals must cleanly divide one day and cannot exceed `1d`."),
    statsPeriod: z.string().optional().describe("Relative time series range (e.g., `1d`, `2h`). Units: `m`, `h`, `d`, `w`. Use instead of `start` and `end`. Defaults to `24h` if no time range is specified."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, field, start, reason, outcome, project, category, download, interval, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/stats/`, { query: { end: end, field: field, start: start, reason: reason, outcome: outcome, project: project, category: category, download: download, interval: interval, statsPeriod: statsPeriod } });
  },
});

export const sentryListAnOrganizationSClientKeys = tool({
  description: "Lists all client keys (DSNs) across all projects in an organization. Use when you need to audit keys organization-wide or filter keys by team or status.",
  inputSchema: z.object({
    sentryToken: tokenField,
    team: z.string().optional().describe("Filter keys by team slug or ID. If provided, only keys for projects belonging to this team will be returned."),
    cursor: z.string().optional().describe("A pointer to the last object fetched and its sort order; used to retrieve the next or previous results."),
    status: z.enum(["active", "inactive"]).optional().describe("Status values for filtering client keys."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, team, cursor, status, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/keys/`, { query: { team: team, cursor: cursor, status: status } });
  },
});

export const sentryListOrganizations = tool({
  description: "Retrieves a list of organizations available to the authenticated session. Use this action when you need to discover which organizations the user has access to before performing operations on a specific organization. This is essential for organization-bound operations that require an organization_id_",
  inputSchema: z.object({
    sentryToken: tokenField,
    owner: z.boolean().optional().describe("Specify true to restrict results to organizations in which you are an owner. When false or omitted, returns all organizations you have access to."),
    query: z.string().optional().describe("Search query to filter organizations. Supports filtering by id, slug, status, email, member_id, and query fields."),
    cursor: z.string().optional().describe("Pagination cursor to retrieve the next or previous results. Use the cursor value from the Link header of a previous response."),
    sortBy: z.string().optional().describe("Field to sort results by in descending order. Valid values: 'members' (sort by member count) or 'events' (sort by event count)."),
  }),
  execute: async ({ sentryToken, owner, query, cursor, sortBy }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/`, { query: { owner: owner, query: query, cursor: cursor, sortBy: sortBy } });
  },
});

export const sentryModifyOrganizationSettings = tool({
  description: "Updates settings for a Sentry organization, such as name, slug, member roles, privacy, and integrations; if `avatarType` is 'upload', `avatar` (base64 image) is required.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().optional().describe("A new name for the organization."),
    slug: z.string().optional().describe("A new unique slug for the organization, used in URLs."),
    avatar: z.string().optional().describe("Base64 encoded image for the organization avatar; required if `avatarType` is 'upload'."),
    avatarType: z.enum(["letter_avatar", "upload"]).optional().describe("Type of organization avatar: 'letter_avatar' (initials) or 'upload' (custom image)."),
    require2FA: z.boolean().optional().describe("Enforce two-factor authentication (2FA) for all members."),
    safeFields: z.array(z.string()).optional().describe("List of global field names exempt from data scrubbing, ensuring their values are preserved."),
    defaultRole: z.enum(["member", "admin", "manager", "owner"]).optional().describe("Default role for new members when they join the organization."),
    githubPRBot: z.boolean().optional().describe("Allow Sentry to comment on recent GitHub PRs suspected of introducing new issues. Requires GitHub integration."),
    dataScrubber: z.boolean().optional().describe("Enforce server-side data scrubbing for all projects based on defined rules."),
    codecovAccess: z.boolean().optional().describe("Enable Code Coverage Insights (Team plan or higher)."),
    trustedRelays: z.array(z.any()).optional().describe("List of local Relay configurations. Each is a dict with `name`, `publicKey`, `description`. Business/Enterprise plans. Warning: Overwrites existing configurations."),
    cancelDeletion: z.boolean().optional().describe("Cancel a pending deletion and restore the organization."),
    debugFilesRole: z.enum(["member", "admin", "manager", "owner"]).optional().describe("Minimum role to download debug files (e.g., ProGuard mappings, source maps)."),
    hideAiFeatures: z.boolean().optional().describe("Hide AI-powered features in the Sentry UI for this organization."),
    isEarlyAdopter: z.boolean().optional().describe("Opt the organization into new Sentry features before public release."),
    openMembership: z.boolean().optional().describe("Allow members to freely join any team without invitation or approval."),
    relayPiiConfig: z.string().optional().describe("JSON string defining advanced, project-specific data scrubbing rules. Applies to new events and overwrites existing advanced configuration. Warning: Updating this field overwrites all existing advanced rules."),
    attachmentsRole: z.enum(["member", "admin", "manager", "owner"]).optional().describe("Minimum role to download event attachments (e.g., crash reports, logs)."),
    enhancedPrivacy: z.boolean().optional().describe("Activate enhanced privacy controls, limiting PII and source code display (e.g., in notifications)."),
    githubOpenPRBot: z.boolean().optional().describe("Allow Sentry to comment on open GitHub PRs with related error issues. Requires GitHub integration."),
    sensitiveFields: z.array(z.string()).optional().describe("List of global field names whose values will be scrubbed from event data across all projects."),
    scrapeJavaScript: z.boolean().optional().describe("Allow Sentry to fetch missing JavaScript source context from public URLs if source maps are incomplete."),
    scrubIPAddresses: z.boolean().optional().describe("Prevent storage of IP addresses for new events in this organization."),
    alertsMemberWrite: z.boolean().optional().describe("Grant members `alerts:write` scope for alert rule management."),
    allowJoinRequests: z.boolean().optional().describe("Allow users to request to join the organization; admins approve/deny."),
    allowSharedIssues: z.boolean().optional().describe("Enable sharing limited issue details with anonymous users (e.g., via public links)."),
    eventsMemberAdmin: z.boolean().optional().describe("Grant members `event:admin` scope to delete events."),
    githubNudgeInvite: z.boolean().optional().describe("Enable Sentry to detect GitHub committers not in Sentry org and suggest inviting them. Requires GitHub integration."),
    storeCrashReports: z.number().int().optional().describe("Number of native crash reports (e.g., Minidumps) to store per issue (0=Disabled, -1=Unlimited)."),
    dataScrubberDefaults: z.boolean().optional().describe("Apply Sentry's default scrubbing rules (e.g., for passwords, credit cards) to event data for all projects."),
    issueAlertsThreadFlag: z.boolean().optional().describe("Configure Sentry Slack integration to post Issue Alert replies in threads. Requires Slack integration."),
    metricAlertsThreadFlag: z.boolean().optional().describe("Configure Sentry Slack integration to post Metric Alert replies in threads. Requires Slack integration."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, name, slug, avatar, avatarType, require2FA, safeFields, defaultRole, githubPRBot, dataScrubber, codecovAccess, trustedRelays, cancelDeletion, debugFilesRole, hideAiFeatures, isEarlyAdopter, openMembership, relayPiiConfig, attachmentsRole, enhancedPrivacy, githubOpenPRBot, sensitiveFields, scrapeJavaScript, scrubIPAddresses, alertsMemberWrite, allowJoinRequests, allowSharedIssues, eventsMemberAdmin, githubNudgeInvite, storeCrashReports, dataScrubberDefaults, issueAlertsThreadFlag, metricAlertsThreadFlag, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/`, { body: { name: name, slug: slug, avatar: avatar, avatarType: avatarType, require2FA: require2FA, safeFields: safeFields, defaultRole: defaultRole, githubPRBot: githubPRBot, dataScrubber: dataScrubber, codecovAccess: codecovAccess, trustedRelays: trustedRelays, cancelDeletion: cancelDeletion, debugFilesRole: debugFilesRole, hideAiFeatures: hideAiFeatures, isEarlyAdopter: isEarlyAdopter, openMembership: openMembership, relayPiiConfig: relayPiiConfig, attachmentsRole: attachmentsRole, enhancedPrivacy: enhancedPrivacy, githubOpenPRBot: githubOpenPRBot, sensitiveFields: sensitiveFields, scrapeJavaScript: scrapeJavaScript, scrubIPAddresses: scrubIPAddresses, alertsMemberWrite: alertsMemberWrite, allowJoinRequests: allowJoinRequests, allowSharedIssues: allowSharedIssues, eventsMemberAdmin: eventsMemberAdmin, githubNudgeInvite: githubNudgeInvite, storeCrashReports: storeCrashReports, dataScrubberDefaults: dataScrubberDefaults, issueAlertsThreadFlag: issueAlertsThreadFlag, metricAlertsThreadFlag: metricAlertsThreadFlag } });
  },
});

export const sentryPostSpikeProtectionForOrganization = tool({
  description: "Enables or updates Spike Protection for specified projects (or all projects using `['$all']`) within an existing Sentry organization, to which the projects must belong.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projects: z.array(z.string()).describe("List of project slugs to enable Spike Protection for; use `['$all']` for all projects in the organization."),
    organizationIdOrSlug: z.string().describe("Unique ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projects, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/spike-protections/`, { body: { projects: projects } });
  },
});

export const sentryRetrieveDataForwardersForAnOrganization = tool({
  description: "Returns a list of data forwarders for an organization. Use when you need to retrieve all data forwarders configured for a specific organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/data-forwarders/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationRelayUsage = tool({
  description: "Retrieves a list of trusted Sentry Relays configured for an organization. Sentry Relay is a service that proxies events between your application and Sentry. This endpoint returns the configuration of trusted relays registered for an organization. Each trusted relay entry includes details such as the",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry organization. This specifies which organization's relay usage data to retrieve."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/relay-usage/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationStatsV2 = tool({
  description: "Retrieves Sentry organization event statistics; specify time range with `statsPeriod` OR both `start`/`end`; note that grouping by `project` returns a sum not a time-series, and `interval` (if used) must be 1h-1d and cleanly divide 24 hours.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("Inclusive end timestamp for the time series (ISO 8601 UTC or Unix epoch seconds). Use with `start`; alternative to `statsPeriod`."),
    field: z.enum(["sum(quantity)", "sum(times_seen)"]).describe("Metric to retrieve. `sum(quantity)` for event counts (or bytes if category is `attachment`, milliseconds if `profile_duration`). `sum(times_seen)` for unique event occurrences (or sessions/attachments)."),
    start: z.string().optional().describe("Start timestamp for the time series (ISO 8601 UTC or Unix epoch seconds). Use with `end`; alternative to `statsPeriod`."),
    reason: z.string().optional().describe("Reason an event was filtered/dropped by Sentry (e.g., `filters:release_version`, `spike_protection`). Often used with outcomes like `filtered` or `rate_limited`."),
    groupBy: z.array(z.string()).describe("Dimensions to group statistics by. **IMPORTANT**: The query must include `category` either in `groupBy` OR as a filter parameter. Grouping by `project` returns a sum over the entire period, not a time series; for many pr"),
    outcome: z.enum(["accepted", "filtered", "rate_limited", "invalid", "abuse", "client_discard", "cardinality_limited"]).optional().describe("Filter by event outcome status (e.g., `accepted`, `filtered`, `rate_limited`), indicating how Sentry processed the event."),
    project: z.array(z.any()).optional().describe("Project IDs to filter statistics by. Use `['-1']` to include all accessible projects for the organization."),
    category: z.enum(["error", "transaction", "attachment", "replay", "profile", "profile_duration", "monitor"]).optional().describe("Filter by data category (e.g., `error`, `transaction`). **IMPORTANT**: Either this parameter OR `category` in `groupBy` is required for the query to succeed. `attachment` and `profile_duration` categories affect interpre"),
    interval: z.string().optional().describe("Time series data resolution (e.g., `1h`, `1d`). Must be between `1h` and `1d` (inclusive) and cleanly divide 24 hours (e.g., `1h`, `2h`, `6h`, `12h`, `24h`)."),
    statsPeriod: z.string().optional().describe("Relative time range for statistics (e.g., `1d` for 1 day, `2w` for 2 weeks). Use `m` (minutes), `h` (hours), `d` (days), `w` (weeks). Provide this or both `start` and `end`."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, field, start, reason, groupBy, outcome, project, category, interval, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/stats_v2/`, { query: { end: end, field: field, start: start, reason: reason, groupBy: groupBy, outcome: outcome, project: project, category: category, interval: interval, statsPeriod: statsPeriod } });
  },
});

export const sentryValidateCredential = tool({
  description: "Validates Sentry API credentials by retrieving the authenticated user's information. Use this action when you need to verify that API credentials are valid and have not expired. This action returns the current user's profile along with authentication token details including scopes and expiration.",
  inputSchema: z.object({
    sentryToken: tokenField,
  }),
  execute: async ({ sentryToken }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/`, { query: {  } });
  },
});
