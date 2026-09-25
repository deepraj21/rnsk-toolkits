// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryGetProjectEvents = tool({
  description: "Retrieves a list of error events for a specified project within a Sentry organization, with options for pagination and detail level.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("End of the query period in ISO-8601 format. Must be used with 'start' parameter. Cannot be used with 'statsPeriod' parameter."),
    full: z.boolean().optional().describe("If `True`, retrieves full event details including stacktraces; otherwise, a summary is returned."),
    start: z.string().optional().describe("Beginning of the query period in ISO-8601 format. Must be used with 'end' parameter. Cannot be used with 'statsPeriod' parameter."),
    cursor: z.string().optional().describe("Opaque cursor for pagination, pointing to the start of the next/previous page, typically from a 'Link' header."),
    sample: z.boolean().optional().describe("If `True`, returns events in a pseudo-random yet deterministic order."),
    statsPeriod: z.string().optional().describe("Time range for events in format: number + unit (d=days, h=hours, m=minutes, s=seconds, w=weeks). Cannot be used with 'start' and 'end' parameters."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, full, start, cursor, sample, statsPeriod, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/events/`, { query: { end: end, full: full, start: start, cursor: cursor, sample: sample, statsPeriod: statsPeriod } });
  },
});

export const sentryListAProjectsUserFeedback = tool({
  description: "Retrieves a list of legacy user feedback items within a Sentry project. Use when you need to see user-reported feedback on errors. Note: This returns legacy User Reports, not submissions from the User Feedback Widget.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor for retrieving the next or previous page of results."),
    perPage: z.number().int().optional().describe("Maximum number of feedback items to return per page. Default: 100."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, cursor, perPage, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/user-reports/`, { query: { cursor: cursor, per_page: perPage } });
  },
});

export const sentryQueryExploreEventsInTimeseriesFormat = tool({
  description: "Retrieves explore data for a given organization as a timeseries. Use this to query timeseries data for 1 or many axis, with results optionally grouped by top events depending on parameters.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("The end of the period of time for the query, expected in ISO-8601 format. For example, `2001-12-14T12:34:56.7890`. This parameter is ignored if `statsPeriod` is provided."),
    sort: z.string().optional().describe("What to order the results of the query by. Must be something in the `field` list, excluding equations."),
    query: z.string().optional().describe("Filters results by using query syntax. Example: `(transaction:foo AND release:abc) OR (transaction:[bar,baz] AND release:def)`."),
    start: z.string().optional().describe("The start of the period of time for the query, expected in ISO-8601 format. For example, `2001-12-14T12:34:56.7890`. This parameter is ignored if `statsPeriod` is provided."),
    yAxis: z.string().optional().describe("The aggregate field to create the timeseries for, defaults to `count()` when not included."),
    dataset: z.enum(["logs", "profile_functions", "spans", "uptime_results"]).describe("Which dataset to query. Changing datasets changes the available fields that can be queried. Options: 'logs', 'profile_functions', 'spans', 'uptime_results'."),
    groupBy: z.array(z.string()).optional().describe("List of fields to group by. *Required* for topEvents queries as this and sort determine what the top events are."),
    project: z.array(z.number().int()).optional().describe("The IDs of projects to filter by. `-1` means all available projects. For example, the following are valid parameters: `[1234, 56789]` or `[-1]`."),
    interval: z.number().int().optional().describe("The size of the bucket for the timeseries to have, must be a value smaller than the window being queried. If the interval is invalid a default interval will be selected instead."),
    topEvents: z.number().int().optional().describe("The number of top event results to return, must be between 1 and 10. When topEvents is passed, both sort and groupBy are required parameters."),
    environment: z.array(z.string()).optional().describe("The name of environments to filter by."),
    statsPeriod: z.string().optional().describe("The period of time for the query, will override the start & end parameters. A number followed by one of: 'd' (days), 'h' (hours), 'm' (minutes), 's' (seconds), 'w' (weeks). For example, `24h` means query data starting fr"),
    excludeOther: z.enum(["0", "1"]).optional().describe("Whether to include the 'other' timeseries in TopEvents queries."),
    comparisonDelta: z.number().int().optional().describe("The delta in seconds to return additional offset timeseries by."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
    preventMetricAggregates: z.enum(["0", "1"]).optional().describe("Whether to throw an error when aggregates are passed."),
    disableAggregateExtrapolation: z.enum(["0", "1"]).optional().describe("Whether to disable aggregate extrapolation."),
  }),
  execute: async ({ sentryToken, end, sort, query, start, yAxis, dataset, groupBy, project, interval, topEvents, environment, statsPeriod, excludeOther, comparisonDelta, organizationIdOrSlug, preventMetricAggregates, disableAggregateExtrapolation }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/events-stats/`, { query: { end: end, sort: sort, query: query, start: start, yAxis: yAxis, dataset: dataset, groupBy: groupBy, project: project, interval: interval, topEvents: topEvents, environment: environment, statsPeriod: statsPeriod, excludeOther: excludeOther, comparisonDelta: comparisonDelta, preventMetricAggregates: preventMetricAggregates, disableAggregateExtrapolation: disableAggregateExtrapolation } });
  },
});

export const sentryRetrieveOrganizationEvents = tool({
  description: "Retrieves Discover event data for a Sentry organization; the `sort` field must be in the `field` list (not an equation), and `field` has a 20-item limit.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("The end timestamp for the query period, in ISO-8601 format (e.g., `2024-01-15T12:30:00Z`). This parameter is ignored if `statsPeriod` is provided."),
    sort: z.string().optional().describe("The field by which to sort the query results. Prepend with `-` for descending order (e.g., `-timestamp`). **Important:** The sort field must be included in the `field` parameter list and cannot be an equation field."),
    field: z.array(z.string()).describe("Specifies the fields, functions, or equations to include in the query results (maximum 20 items). Each item can be: - A built-in key field (e.g., `id`, `title`, `timestamp`, `project`, `user.email`, `level`, `transaction"),
    query: z.string().optional().describe("A Sentry search query string to filter events. Example: `(transaction:foo AND release:abc) OR (transaction:[bar,baz] AND release:def)`. Refer to Sentry documentation for detailed search syntax."),
    start: z.string().optional().describe("The start timestamp for the query period, in ISO-8601 format (e.g., `2024-01-01T10:00:00Z`). This parameter is ignored if `statsPeriod` is provided."),
    project: z.array(z.number().int()).optional().describe("A list of project IDs (integers) to filter events by. Use `[-1]` to include all accessible projects. For example: `[123, 456]` or `[-1]`."),
    perPage: z.number().int().optional().describe("The maximum number of event rows to return per page. Defaults to 50 if not specified. Maximum allowed value is 100."),
    environment: z.array(z.string()).optional().describe("A list of environment names to filter events by (e.g., `production`, `staging`)."),
    statsPeriod: z.string().optional().describe("The relative time period for the query (e.g., `24h`, `7d`, `30m`). This overrides `start` and `end` if provided. Valid suffixes: `d` (days), `h` (hours), `m` (minutes), `s` (seconds), `w` (weeks)."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization for which to retrieve events."),
  }),
  execute: async ({ sentryToken, end, sort, field, query, start, project, perPage, environment, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/events/`, { query: { end: end, sort: sort, field: field, query: query, start: start, project: project, per_page: perPage, environment: environment, statsPeriod: statsPeriod } });
  },
});

export const sentryRetrieveProjectEventById = tool({
  description: "Retrieves detailed information for a specific Sentry event using its ID, organization identifier, and project identifier.",
  inputSchema: z.object({
    sentryToken: tokenField,
    eventId: z.string().describe("The hexadecimal ID of the event to retrieve, as reported by the client."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project to which the event belongs."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the event belongs."),
  }),
  execute: async ({ sentryToken, eventId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/events/${eventId}/`, { query: {  } });
  },
});

export const sentryRetrieveSourceMapDebugEvent = tool({
  description: "Retrieves detailed debug information for diagnosing source map processing issues for a specific Sentry event, stack trace frame, and exception index. Note: The event must contain an exception with stack trace frames for this endpoint to return useful data.",
  inputSchema: z.object({
    sentryToken: tokenField,
    eventId: z.string().describe("The unique identifier (ID) of the event for which source map debug information is being retrieved."),
    frameIdx: z.number().int().describe("Zero-based index of the specific stack trace frame to debug for source map resolution. Use 0 for the most recent frame. The API will return an error if the index is out of bounds."),
    exceptionIdx: z.number().int().describe("Zero-based index of the exception in the event's exception array to debug for source map resolution. Use 0 for the primary exception. The API will return an error if the index is out of bounds or if the event does not co"),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project to which the resource belongs."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the resource belongs."),
  }),
  execute: async ({ sentryToken, eventId, frameIdx, exceptionIdx, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/events/${eventId}/source-map-debug/`, { query: { frame_idx: frameIdx, exception_idx: exceptionIdx } });
  },
});

export const sentrySubmitUserFeedback = tool({
  description: "Submits user feedback tied to a specific Sentry event. Use when you need to associate user-reported issues with specific error events. DEPRECATED: This endpoint is maintained for legacy SDKs; new implementations should use the User Feedback Widget. Feedback must be submitted within 30 minutes of eve",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("The name of the person submitting the feedback."),
    email: z.string().describe("The email address of the person submitting the feedback."),
    comments: z.string().describe("The user's feedback content describing the issue or experience."),
    eventId: z.string().describe("The event identifier, retrievable via beforeSend callback. Must be from an event created within the last 30 minutes."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, name, email, comments, eventId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/user-reports/`, { body: { name: name, email: email, comments: comments, event_id: eventId } });
  },
});
