// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryBulkMutateAnOrganizationsIssues = tool({
  description: "Bulk mutate various attributes on issues within an organization. Use when you need to update status, priority, assignment, or other attributes for multiple issues at once. Maximum of 1000 issues can be mutated, with a 100 issue limit per request.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.number().int()).optional().describe("Issue IDs to mutate. For non-status updates, this parameter is required. For status updates, it can be omitted to update all matching issues."),
    sort: z.enum(["date", "new", "trends", "freq", "user", "inbox"]).optional().describe("Sort order for issues. Defaults to 'date'."),
    inbox: z.boolean().optional().describe("Mark issue as reviewed in inbox."),
    limit: z.number().int().optional().describe("Maximum number of issues to affect. Default: 100, Maximum: 100."),
    merge: z.boolean().optional().describe("Merge issues together. Requires multiple issue IDs."),
    query: z.string().optional().describe("Search query for filtering issues. Defaults to 'is:unresolved' if not specified. Only used when issue IDs are not provided."),
    status: z.enum(["resolved", "unresolved", "ignored", "resolvedInNextRelease", "muted"]).optional().describe("New status for the issues."),
    viewId: z.string().optional().describe("View ID to apply view's query and filters. Only used when issue IDs are not provided."),
    discard: z.boolean().optional().describe("Discard the issues."),
    hasSeen: z.boolean().optional().describe("Mark the issue as seen."),
    project: z.array(z.number().int()).optional().describe("Project IDs to filter issues by. Use -1 to include all available projects."),
    isPublic: z.boolean().optional().describe("Make the issue public or private."),
    priority: z.enum(["low", "medium", "high"]).optional().describe("Priority level for the issue."),
    substatus: z.enum(["archived_until_escalating", "archived_until_condition_met", "archived_forever", "escalating", "ongoing", "regressed", "new"]).optional().describe("Issue substatus."),
    assignedTo: z.string().optional().describe("User or team to assign the issue to. Formats: <user_id>, user:<user_id>, <username>, <email>, team:<team_id>."),
    environment: z.array(z.string()).optional().describe("Environment names to filter issues by. Used to narrow down which issues to mutate."),
    isBookmarked: z.boolean().optional().describe("Bookmark or unbookmark the issue."),
    isSubscribed: z.boolean().optional().describe("Subscribe or unsubscribe from issue notifications."),
    statusDetails: z.record(z.any()).optional().describe("Status details schema for issue resolution."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization containing the issues to mutate."),
  }),
  execute: async ({ sentryToken, id, sort, inbox, limit, merge, query, status, viewId, discard, hasSeen, project, isPublic, priority, substatus, assignedTo, environment, isBookmarked, isSubscribed, statusDetails, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/issues/`, { body: { id: id, sort: sort, inbox: inbox, limit: limit, merge: merge, query: query, status: status, viewId: viewId, discard: discard, hasSeen: hasSeen, project: project, isPublic: isPublic, priority: priority, substatus: substatus, assignedTo: assignedTo, environment: environment, isBookmarked: isBookmarked, isSubscribed: isSubscribed, statusDetails: statusDetails } });
  },
});

export const sentryBulkRemoveAnOrganizationsIssues = tool({
  description: "Permanently removes issues from an organization. If IDs are provided, queries and filtering are ignored. Maximum of 1000 issues can be removed at once.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.number().int()).optional().describe("The list of issue IDs to be removed. If provided, queries and filtering will be ignored. If not provided, it will attempt to remove the first 1000 issues matching the query and filters."),
    sort: z.string().optional().describe("Sort order for issues. Accepts: date, freq, inbox, new, trends, user. Defaults to date if not specified."),
    limit: z.number().int().optional().describe("The maximum number of issues to affect. The maximum allowed value is 100."),
    query: z.string().optional().describe("An optional search query for filtering issues. A default query will apply if no view/query is set. Only used if issue IDs are not provided."),
    viewId: z.string().optional().describe("The ID of the view to use. If no query is present, the view's query and filters will be applied. Only used if issue IDs are not provided."),
    project: z.array(z.number().int()).optional().describe("The IDs of projects to filter by. Use -1 to include all available projects."),
    environment: z.array(z.string()).optional().describe("The name of environments to filter by. Used to narrow down which issues to remove based on the environment."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization from which issues will be removed."),
  }),
  execute: async ({ sentryToken, id, sort, limit, query, viewId, project, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/issues/`, { query: { id: id, sort: sort, limit: limit, query: query, viewId: viewId, project: project, environment: environment } });
  },
});

export const sentryDeleteOrganizationIssue = tool({
  description: "Permanently deletes a specific Sentry issue, identified by its ID, from an organization; this operation is irreversible and idempotent.",
  inputSchema: z.object({
    sentryToken: tokenField,
    issueId: z.string().describe("The unique identifier (ID) of the Sentry issue to be permanently deleted."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the issue belongs."),
  }),
  execute: async ({ sentryToken, issueId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/issues/${issueId}/`, { query: {  } });
  },
});

export const sentryDeleteProjectIssues = tool({
  description: "Permanently removes specified issues from a Sentry project; if no issue IDs are provided, it removes the oldest 1000 issues.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.number().int()).optional().describe("A list of specific issue IDs to be permanently removed. If not provided, the action removes the oldest 1000 issues in the project."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project from which issues will be removed."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the project and its issues belong."),
  }),
  execute: async ({ sentryToken, id, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/issues/`, { query: { id: id, project: projectIdOrSlug } });
  },
});

export const sentryFetchIssueEventById = tool({
  description: "Retrieves the 'latest', 'oldest', or 'recommended' event for a Sentry issue within an organization, optionally filtered by environment(s).",
  inputSchema: z.object({
    sentryToken: tokenField,
    eventId: z.string().describe("The event to retrieve. Use 'latest' for most recent, 'oldest' for first, 'recommended' for Sentry's recommended event, or a specific event ID."),
    issueId: z.number().int().describe("The unique numerical ID of the Sentry issue for which to fetch an event."),
    environment: z.array(z.string()).optional().describe("Filter by environment names; if omitted, events from all environments are considered."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the issue belongs to."),
  }),
  execute: async ({ sentryToken, eventId, issueId, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/events/${eventId}/`, { query: { environment: environment } });
  },
});

export const sentryFetchTagValuesForIssue = tool({
  description: "Retrieves a list of distinct values for a specified tag key associated with an existing Sentry issue, useful for understanding tag manifestations like browser versions or affected users.",
  inputSchema: z.object({
    sentryToken: tokenField,
    key: z.string().describe("The specific tag key (e.g., 'browser', 'user_id', 'environment') for which to retrieve distinct values associated with the issue."),
    sort: z.enum(["age", "count", "date", "id"]).optional().describe("Sort order for tag values; valid options are 'age', 'count', 'date', 'id'. Prefix with '-' for descending (e.g., '-count'); defaults to '-id'."),
    issueId: z.number().int().describe("The unique numerical identifier of the Sentry issue for which tag values are to be fetched."),
    environment: z.array(z.string()).optional().describe("A list of environment names to filter the tag values; if provided, only values from these specified environments will be returned."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, key, sort, issueId, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/tags/${key}/values/`, { query: { sort: sort, environment: environment } });
  },
});

export const sentryGetOldestEvent = tool({
  description: "Retrieves the oldest (first) event associated with a Sentry issue within an organization. Use this action when you need to investigate the original occurrence of an issue to understand its root cause or initial context. This is particularly useful for debugging issues from their first appearance, an",
  inputSchema: z.object({
    sentryToken: tokenField,
    issueId: z.number().int().describe("The unique numerical ID of the Sentry issue for which to retrieve the oldest event."),
    environment: z.array(z.string()).optional().describe("Filter by environment names; if omitted, events from all environments are considered."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the issue belongs to."),
  }),
  execute: async ({ sentryToken, issueId, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/events/oldest/`, { query: { environment: environment } });
  },
});

export const sentryGetOrganizationIssueDetails = tool({
  description: "Retrieves detailed information for a specific issue within a Sentry organization. Accepts both numeric issue IDs (e.g., '7159174717') and short IDs displayed in the Sentry UI (e.g., 'PROJECT-123', 'SENTRY-4V'). Short IDs are automatically resolved to numeric IDs before fetching issue details.",
  inputSchema: z.object({
    sentryToken: tokenField,
    issueId: z.string().describe("The issue ID. Can be either a numeric ID (e.g., '7159174717') or a short ID displayed in the Sentry UI (e.g., 'PROJECT-123', 'SENTRY-4V'). Short IDs will be automatically resolved to numeric IDs."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization to which the issue belongs."),
  }),
  execute: async ({ sentryToken, issueId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/`, { query: {  } });
  },
});

export const sentryListAnOrganizationsIssues = tool({
  description: "Returns a list of issues (error groups) for an organization. Use when you need to retrieve and analyze error patterns, track unresolved issues, or monitor issue trends. Default query applies 'is:unresolved issue.priority:[high,medium]'.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("Query period end time in ISO-8601 format (e.g., 2001-12-14T12:34:56.7890)."),
    sort: z.enum(["date", "freq", "inbox", "new", "trends", "user"]).optional().describe("Sort order for issues."),
    limit: z.number().int().optional().describe("Maximum number of issues to return. Default: 100, Maximum: 100."),
    query: z.string().optional().describe("Search query for filtering issues. Defaults to 'is:unresolved issue.priority:[high,medium]'. Use an empty string to return all results. Must follow Sentry search syntax; malformed or overly narrow queries silently return"),
    start: z.string().optional().describe("Query period start time in ISO-8601 format (e.g., 2001-12-14T12:34:56.7890)."),
    cursor: z.string().optional().describe("Pagination cursor to retrieve next or previous results. Iterate using Link response headers until exhausted to retrieve all results."),
    expand: z.array(z.string()).optional().describe("Additional data to include in the response. Valid choices: inbox, integrationIssues, latestEventHasAttachments, owners, pluginActions, pluginIssues, sentryAppIssues, sessions."),
    viewId: z.string().optional().describe("View ID to apply custom query and filters."),
    project: z.array(z.number().int()).optional().describe("Filter issues by project IDs. Use -1 to include all available projects."),
    collapse: z.array(z.string()).optional().describe("Fields to exclude from the response. Valid choices: base, filtered, lifetime, stats, unhandled."),
    environment: z.array(z.string()).optional().describe("Filter issues by environment names. Pass multiple environment names to filter by multiple environments."),
    statsPeriod: z.string().optional().describe("Time period for the query (e.g., 24h, 7d, 14d). Supports d (days), h (hours), m (minutes), s (seconds), w (weeks) suffixes. Overrides start and end parameters. Affects stats display only, not which issues are returned; u"),
    shortIdLookup: z.enum(["0", "1"]).optional().describe("Parse query for short IDs when set to 1."),
    groupStatsPeriod: z.enum(["14d", "24h", "auto"]).optional().describe("Stats timeline period."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to retrieve issues from."),
  }),
  execute: async ({ sentryToken, end, sort, limit, query, start, cursor, expand, viewId, project, collapse, environment, statsPeriod, shortIdLookup, groupStatsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/`, { query: { end: end, sort: sort, limit: limit, query: query, start: start, cursor: cursor, expand: expand, viewId: viewId, project: project, collapse: collapse, environment: environment, statsPeriod: statsPeriod, shortIdLookup: shortIdLookup, groupStatsPeriod: groupStatsPeriod } });
  },
});

export const sentryListATagsValuesForAnIssue = tool({
  description: "Returns a list of values associated with this key for an issue. Use when you need to analyze tag values, their frequency, or timeline for specific issue tags.",
  inputSchema: z.object({
    sentryToken: tokenField,
    key: z.string().describe("The tag key to look the values up for (e.g., 'level', 'environment', 'browser')."),
    issueId: z.number().int().describe("The ID of the issue to retrieve tag values for."),
    environment: z.array(z.string()).optional().describe("The name of environments to filter by."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, key, issueId, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/tags/${key}/values/`, { query: { environment: environment } });
  },
});

export const sentryRetrieveCustomIntegIssueLinksGivenSentryIssue = tool({
  description: "Retrieves all external issue links for a Sentry issue. Returns connections between the Sentry issue and external tracking systems (e.g., Jira, GitHub Issues, Linear, GitLab, Asana) created through custom integrations or Sentry Apps. Use this to see what external tickets or issues are linked to a Sen",
  inputSchema: z.object({
    sentryToken: tokenField,
    issueId: z.number().int().describe("The numeric ID of the Sentry issue to retrieve external issue links for. This is the numeric issue ID, not the short ID (e.g., use 7233953621, not 'PROJECT-123')."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, issueId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/external-issues/`, { query: {  } });
  },
});

export const sentryRetrieveEventIdForOrganization = tool({
  description: "Resolves a Sentry event ID to its project and issue details within an accessible Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    eventId: z.string().describe("The unique 32-character hexadecimal identifier of the Sentry event to be resolved."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization where the event occurred. This specifies the scope for the event lookup."),
  }),
  execute: async ({ sentryToken, eventId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/eventids/${eventId}/`, { query: {  } });
  },
});

export const sentryRetrieveIssueEventsById = tool({
  description: "Retrieves events for a specified Sentry `issue_id`, which must be an existing issue.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("The end timestamp for filtering events, in ISO-8601 format (e.g., `2001-12-14T12:34:56.7890Z`). If provided, `start` must also be specified. This parameter is overridden by `statsPeriod` if both are used."),
    full: z.boolean().optional().describe("If set to `true`, the full event body, including stacktraces, is included in the response for each event. If `false` or not provided (default), summarized event data is returned."),
    query: z.string().optional().describe("An optional Sentry search query string to further filter events. Uses Sentry's search syntax (e.g., 'level:error', 'user.ip:127.0.0.1', 'handled:no tag_name:tag_value')."),
    start: z.string().optional().describe("The start timestamp for filtering events, in ISO-8601 format (e.g., `2001-12-14T12:34:56.7890Z`). If provided, `end` must also be specified. This parameter is overridden by `statsPeriod` if both are used."),
    sample: z.boolean().optional().describe("If set to `true`, events are returned in a pseudo-random yet deterministic order. An identical query will consistently produce the same event sequence. Useful for obtaining a representative sample from a large number of "),
    issueId: z.number().int().describe("The unique numeric identifier of the Sentry issue for which to retrieve associated events."),
    environment: z.array(z.string()).optional().describe("A list of environment names (e.g., 'production', 'staging') to filter events by. Only events from these specified environments will be returned."),
    statsPeriod: z.string().optional().describe("A relative time period for the query (e.g., '24h', '7d', '2w'), calculated from the current time. This overrides `start` and `end` if specified. Format is a number followed by 'd' (days), 'h' (hours), 'm' (minutes), 's' "),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, end, full, query, start, sample, issueId, environment, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/events/`, { query: { end: end, full: full, query: query, start: start, sample: sample, environment: environment, statsPeriod: statsPeriod } });
  },
});

export const sentryRetrieveIssueHashesForOrganization = tool({
  description: "Retrieves a list of grouping checksums (hashes) generated by Sentry for a specific issue within an organization, used for understanding event aggregation.",
  inputSchema: z.object({
    sentryToken: tokenField,
    full: z.boolean().optional().describe("If `True`, includes comprehensive details for each hash; if `False`, returns a minimal representation."),
    cursor: z.string().optional().describe("Pagination cursor to navigate through the list of issue hashes."),
    issueId: z.string().describe("Identifier (ID) of the Sentry issue."),
    organizationIdOrSlug: z.string().describe("Identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, full, cursor, issueId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/${issueId}/hashes/`, { query: { full: full, cursor: cursor } });
  },
});

export const sentryRetrieveIssueTagDetails = tool({
  description: "Retrieves detailed information (e.g., top values, counts) for a specific tag key on an existing Sentry issue; results are paginated (max 1000 values per page).",
  inputSchema: z.object({
    sentryToken: tokenField,
    key: z.string().describe("The specific tag key (e.g., 'browser', 'os', 'environment', 'release', custom tags) for which to retrieve detailed values; case-sensitive."),
    issueId: z.number().int().describe("The unique numerical ID of the Sentry issue."),
    environment: z.array(z.string()).optional().describe("Optional list of environment names to filter tag values; if omitted, all environments are considered."),
  }),
  execute: async ({ sentryToken, key, issueId, environment }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/issues/${issueId}/tags/${key}/`, { query: { environment: environment } });
  },
});

export const sentryRetrieveProjectIssuesList = tool({
  description: "Retrieves a list of issues for a Sentry project, defaulting to unresolved issues unless an empty `query` string is provided or specific `hashes` are used.",
  inputSchema: z.object({
    sentryToken: tokenField,
    query: z.string().optional().describe("Sentry structured search query to filter issues (e.g., 'is:resolved', 'error.type:TypeError'). Defaults to 'is:unresolved'; `''` retrieves all issues regardless of status. IMPORTANT: Boolean operators 'OR' and 'AND' are "),
    cursor: z.string().optional().describe("Pagination cursor from a previous response's `Link` header to fetch the next/previous set of issues."),
    hashes: z.string().optional().describe("Comma-separated group hashes to retrieve specific issues; incompatible with `query`. Max 100 hashes processed."),
    statsPeriod: z.string().optional().describe("Time window for calculating issue statistics (affects the timeline stats in the response, not which issues are returned). Valid values: '' (empty string to disable stats), '24h' (last 24 hours), '14d' (last 14 days). Def"),
    shortIdLookup: z.boolean().optional().describe("If `True`, enables issue lookup by short IDs; may return issues from a different project. API default is typically `False`."),
    projectIdOrSlug: z.string().describe("Unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("Unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, query, cursor, hashes, statsPeriod, shortIdLookup, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/issues/`, { query: { query: query, cursor: cursor, hashes: hashes, statsPeriod: statsPeriod, shortIdLookup: shortIdLookup, project: projectIdOrSlug } });
  },
});

export const sentryRetrieveShortIdForOrganization = tool({
  description: "Resolves a Sentry short ID (e.g., 'PROJECT-1A') to its complete issue details including organization slug, project slug, group ID, and full issue metadata. Use this to look up issue information when you have a short ID reference.",
  inputSchema: z.object({
    sentryToken: tokenField,
    shortId: z.string().describe("The Sentry short ID to resolve (e.g., 'PROJECT-1A', 'APP-XYZ')."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization where the short ID will be looked up."),
  }),
  execute: async ({ sentryToken, shortId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/shortids/${shortId}/`, { query: {  } });
  },
});

export const sentryUpdateIssueAttributesInOrganization = tool({
  description: "Updates specified attributes of an existing Sentry issue within a Sentry organization, leaving other attributes unchanged.",
  inputSchema: z.object({
    sentryToken: tokenField,
    status: z.string().optional().describe("The new status to assign to the issue. Valid values: 'resolved', 'resolvedInNextRelease', 'unresolved', 'ignored'."),
    hasSeen: z.boolean().optional().describe("Updates if the user has seen the issue (true for seen, false for unseen)."),
    isPublic: z.boolean().optional().describe("Sets the issue's visibility (true for public, false for private)."),
    issueId: z.string().describe("The unique identifier of the issue to be updated."),
    assignedTo: z.string().optional().describe("Actor ID (e.g., 'user:1', 'team:2'), username, or email for assignment. Omit, or use an empty string or 'null' equivalent, to unassign."),
    isBookmarked: z.boolean().optional().describe("Updates the user's bookmark for the issue (true to bookmark, false to remove)."),
    isSubscribed: z.boolean().optional().describe("Updates the user's notification subscription for the issue (true to subscribe, false to unsubscribe)."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or slug of the Sentry organization."),
    statusdetailsIncommit: z.string().optional().describe("The commit hash associated with the fix for this issue."),
    statusdetailsInrelease: z.string().optional().describe("The Sentry release version in which the issue is considered resolved."),
    statusdetailsInnextrelease: z.boolean().optional().describe("Specifies if the issue is resolved in the next Sentry release."),
  }),
  execute: async ({ sentryToken, status, hasSeen, isPublic, issueId, assignedTo, isBookmarked, isSubscribed, organizationIdOrSlug, statusdetailsIncommit, statusdetailsInrelease, statusdetailsInnextrelease }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/issues/${issueId}/`, { body: { status: status, hasSeen: hasSeen, isPublic: isPublic, assignedTo: assignedTo, isBookmarked: isBookmarked, isSubscribed: isSubscribed, statusDetails: { inCommit: statusdetailsIncommit, inRelease: statusdetailsInrelease, inNextRelease: statusdetailsInnextrelease } } });
  },
});

export const sentryUpdateProjectIssueStatusAndDetails = tool({
  description: "Bulk update attributes of issues in a Sentry project, targeting issues by a list of IDs or by a query status (which implies updating all matching issues if IDs are omitted).",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.array(z.number().int()).optional().describe("Issue IDs to update. Accepts a list of integers for bulk updates. Optional; if omitted and the 'status' query parameter (filter) is used, updates all issues matching that status."),
    merge: z.boolean().optional().describe("Set to true to merge issues, false to unmerge. If merging, ensure the target issue ID is correctly specified."),
    status: z.string().optional().describe("The new status to apply to the selected issues (request body parameter). Valid values are `'resolved'`, `'resolvedInNextRelease'`, `'unresolved'`, and `'ignored'`."),
    hasSeen: z.boolean().optional().describe("If called with user context: true to mark issue as seen by the user, false as unseen."),
    isPublic: z.boolean().optional().describe("Set to true for public, false for private."),
    assignedTo: z.string().optional().describe("Actor ID (e.g., `user:123` or `team:456`) or username for assignment. Use an empty string or null to unassign."),
    isBookmarked: z.boolean().optional().describe("If called with user context: true to bookmark issue for the user, false to remove bookmark."),
    ignoreDuration: z.number().int().optional().describe("Minutes to ignore this issue (alternative to `statusDetails.ignoreDuration`)."),
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
    statusdetailsIncommit: z.string().optional().describe("Commit ID in which the issue is resolved."),
    statusdetailsInrelease: z.string().optional().describe("Version/release in which the issue is resolved."),
    statusdetailsIgnorecount: z.number().int().optional().describe("Number of times to ignore the issue before it resurfaces."),
    statusdetailsIgnorewindow: z.number().int().optional().describe("Time window (in minutes) for `ignoreCount`."),
    statusdetailsInnextrelease: z.boolean().optional().describe("Indicates if the issue is resolved in the next release."),
    statusdetailsIgnoreduration: z.number().int().optional().describe("Duration (in minutes) to ignore the issue."),
    statusdetailsIgnoreusercount: z.number().int().optional().describe("Number of unique users affected before a previously ignored issue resurfaces."),
    statusdetailsIgnoreuserwindow: z.number().int().optional().describe("Time window (in minutes) for `ignoreUserCount`."),
  }),
  execute: async ({ sentryToken, id, merge, status, hasSeen, isPublic, assignedTo, isBookmarked, ignoreDuration, projectIdOrSlug, organizationIdOrSlug, statusdetailsIncommit, statusdetailsInrelease, statusdetailsIgnorecount, statusdetailsIgnorewindow, statusdetailsInnextrelease, statusdetailsIgnoreduration, statusdetailsIgnoreusercount, statusdetailsIgnoreuserwindow }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/issues/`, { body: { id: id, merge: merge, status: status, hasSeen: hasSeen, isPublic: isPublic, assignedTo: assignedTo, isBookmarked: isBookmarked, ignoreDuration: ignoreDuration, project_id_or_slug: projectIdOrSlug, statusDetails: { inCommit: statusdetailsIncommit, inRelease: statusdetailsInrelease, ignoreCount: statusdetailsIgnorecount, ignoreWindow: statusdetailsIgnorewindow, inNextRelease: statusdetailsInnextrelease, ignoreDuration: statusdetailsIgnoreduration, ignoreUserCount: statusdetailsIgnoreusercount, ignoreUserWindow: statusdetailsIgnoreuserwindow } } });
  },
});
