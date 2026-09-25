// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryDeleteProjectReplay = tool({
  description: "Permanently deletes a specific Sentry session replay (a video-like reproduction of user interactions, including console logs and network activity) from the specified project and organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    replayId: z.string().describe("The unique identifier (ID) of the session replay to be deleted."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry project from which the replay will be deleted."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry organization to which the project and replay belong."),
  }),
  execute: async ({ sentryToken, replayId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/replays/${replayId}/`, { query: {  } });
  },
});

export const sentryFetchOrganizationReplayCount = tool({
  description: "Retrieves the total count of session replays for a specified Sentry organization, filterable by time range, environment, project, and query.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("The end timestamp for the query period, in ISO-8601 format (e.g., `2001-12-14T12:34:56.7890Z`)."),
    query: z.string().optional().describe("A Sentry search query string to further filter replays. Example: `(transaction:foo AND release:abc) OR (transaction:[bar,baz] AND release:def)`. Refer to Sentry documentation for detailed query syntax."),
    start: z.string().optional().describe("The start timestamp for the query period, in ISO-8601 format (e.g., `2001-12-14T12:34:56.7890Z`)."),
    project: z.array(z.number().int()).optional().describe("A list of project IDs to filter results by. Use `[-1]` to include all available projects within the organization."),
    environment: z.array(z.string()).optional().describe("A list of environment names to filter results by (e.g., production, staging)."),
    statsPeriod: z.string().optional().describe("A relative time period for the query, which overrides `start` and `end` if provided. Format is a number followed by `d` (days), `h` (hours), `m` (minutes), `s` (seconds), or `w` (weeks). For example, `24h` queries data f"),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, query, start, project, environment, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/replays-count/`, { query: { end: end, query: query, start: start, project: project, environment: environment, statsPeriod: statsPeriod } });
  },
});

export const sentryFetchOrganizationReplayDetails = tool({
  description: "Retrieves detailed information for a specific replay session by ID within a Sentry organization, optionally filtering time-series data using `statsPeriod` or `start`/`end`, and further refining by projects, environments, or specific fields.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("Inclusive end of the time series range (UTC ISO8601 or epoch seconds). Use with `start`; alternative to `statsPeriod`."),
    sort: z.string().optional().describe("Field to sort replay details by (prefix with '-' for descending, e.g., '-started_at')."),
    field: z.array(z.string()).optional().describe("Specific fields to include in the response (e.g., 'activity', 'browser'). See `FieldEnm` for valid fields."),
    query: z.string().optional().describe("Structured query string to filter replay details (e.g., `user.email:test@example.com`, `has:error`)."),
    start: z.string().optional().describe("Start of the time series range (UTC ISO8601 or epoch seconds). Use with `end`; alternative to `statsPeriod`."),
    cursor: z.string().optional().describe("Pagination cursor for fetching the next or previous set of results."),
    project: z.array(z.number().int()).optional().describe("List of project IDs to filter replay details by."),
    perPage: z.number().int().optional().describe("Maximum number of items to return per page for pagination."),
    replayId: z.string().describe("ID of the specific replay session to retrieve."),
    environment: z.string().optional().describe("Environment (e.g., 'production', 'staging') to filter replay details by."),
    statsPeriod: z.string().optional().describe("Time range for series data, relative to now (e.g., `1d`, `2h`). Use if not providing `start` and `end`."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization for the replay."),
  }),
  execute: async ({ sentryToken, end, sort, field, query, start, cursor, project, perPage, replayId, environment, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/replays/${replayId}/`, { query: { end: end, sort: sort, field: field, query: query, start: start, cursor: cursor, project: project, per_page: perPage, environment: environment, statsPeriod: statsPeriod } });
  },
});

export const sentryFetchOrganizationReplaySelectors = tool({
  description: "Retrieves replay selectors (CSS/DOM selectors from session replays) for a Sentry organization. Selectors include elements with dead clicks or rage clicks, useful for identifying UI issues. Returns selector details with click counts and associated project IDs. Use `statsPeriod` for time filtering (pr",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("End of time range (UTC ISO8601 or epoch seconds). Use with `start`; not with `statsPeriod`. Note: This endpoint may not support start/end parameters - prefer using `statsPeriod` instead."),
    sort: z.string().optional().describe("Field to sort replay selectors by. Refer to Sentry API docs for available fields."),
    query: z.string().optional().describe("Sentry search query syntax for filtering. See Sentry docs for syntax/fields."),
    start: z.string().optional().describe("Start of time range (UTC ISO8601 or epoch seconds). Use with `end`; not with `statsPeriod`. Note: This endpoint may not support start/end parameters - prefer using `statsPeriod` instead."),
    cursor: z.string().optional().describe("Pagination cursor for fetching next/previous page."),
    project: z.array(z.number().int()).optional().describe("Filter by project IDs (numeric)."),
    perPage: z.number().int().optional().describe("Maximum items per page (API defaults to 100 if not specified, max 100)."),
    environment: z.array(z.string()).optional().describe("Filter by environment names."),
    statsPeriod: z.string().optional().describe("Time range (e.g., `1d`, `2h`; m, h, d, w units). Use instead of `start`/`end`."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, sort, query, start, cursor, project, perPage, environment, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/replays/selectors/`, { query: { end: end, sort: sort, query: query, start: start, cursor: cursor, project: project, per_page: perPage, environment: environment, statsPeriod: statsPeriod } });
  },
});

export const sentryFetchProjectReplayClicks = tool({
  description: "Fetches a list of user click interactions for a specific Sentry session replay, including the clicked DOM element ID and timestamp.",
  inputSchema: z.object({
    sentryToken: tokenField,
    query: z.string().optional().describe("Sentry search query to filter click events (e.g., `(transaction:foo AND release:abc) OR (transaction:[bar,baz] AND release:def)`)."),
    cursor: z.string().optional().describe("Pagination cursor to navigate through click events."),
    perPage: z.number().int().optional().describe("Maximum number of click events per page (default/max 100)."),
    replayId: z.string().describe("The ID of the Sentry session replay."),
    environment: z.array(z.string()).optional().describe("List of environment names to filter click data."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, query, cursor, perPage, replayId, environment, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/replays/${replayId}/clicks/`, { query: { query: query, cursor: cursor, per_page: perPage, environment: environment } });
  },
});

export const sentryFetchReplayRecordingSegment = tool({
  description: "Retrieves a specific recording segment for a Sentry replay, requiring valid organization, project, replay, and segment identifiers.",
  inputSchema: z.object({
    sentryToken: tokenField,
    replayId: z.string().describe("The unique identifier of the replay to retrieve. This is a 32-character hexadecimal string (UUID4) without dashes. Example: 'a6ef355da2bb43f8a7825c45f98c5177'."),
    segmentId: z.number().int().describe("The ID of the specific recording segment within the replay to retrieve. Segment IDs start from 0 and increment sequentially."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project to which the replay belongs. Examples: 'javascript', 'my-project'."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which the replay belongs. Examples: 'sentry', 'my-org'."),
  }),
  execute: async ({ sentryToken, replayId, segmentId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/replays/${replayId}/recording-segments/${segmentId}/`, { query: {  } });
  },
});

export const sentryGetWhoViewedReplayByProject = tool({
  description: "Retrieves users who viewed a specific, existing session replay within a Sentry project and organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    replayId: z.string().describe("The unique identifier of the session replay. This is a 32-character hexadecimal string (UUIDv4 format without dashes)."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, replayId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/replays/${replayId}/viewers/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationReplays = tool({
  description: "Fetches session replays for a Sentry organization; use `statsPeriod` for relative time, or `start` and `end` (used together) for absolute time ranges.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("Absolute inclusive end of the time series range (UTC ISO8601 or epoch seconds). Requires `start`. Conflicts with `statsPeriod`."),
    sort: z.string().optional().describe("The field to sort the replays by. Prefix with '-' for descending order (e.g., '-started_at'). Default is 'activity'."),
    field: z.array(z.string()).optional().describe("Additional fields to include in the response for each replay; invalid fields are ignored."),
    query: z.string().optional().describe("Structured query string to filter replays (e.g., 'user.email:'j.doe@example.com' AND browser.name:'Chrome''). Refer to Sentry documentation for syntax."),
    start: z.string().optional().describe("Absolute start of the time series range (UTC ISO8601 or epoch seconds). Requires `end`. Conflicts with `statsPeriod`."),
    cursor: z.string().optional().describe("Pagination cursor for fetching next/previous page. See Sentry API documentation for details."),
    project: z.array(z.number().int()).optional().describe("A list of project IDs to filter replays by. Use -1 for all projects."),
    perPage: z.number().int().optional().describe("The maximum number of replays to return per page. The default is 50, and the maximum is 100."),
    environment: z.string().optional().describe("The environment name to filter replays by (e.g., 'production', 'staging')."),
    statsPeriod: z.string().optional().describe("The relative time range for the query (e.g., `1d` for one day). Units: `m` (minutes), `h` (hours), `d` (days), `w` (weeks)."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, sort, field, query, start, cursor, project, perPage, environment, statsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/replays/`, { query: { end: end, sort: sort, field: field, query: query, start: start, cursor: cursor, project: project, per_page: perPage, environment: environment, statsPeriod: statsPeriod } });
  },
});

export const sentryRetrieveReplayRecordingSegments = tool({
  description: "Retrieves a paginated list of recording segments for a specific Sentry replay, used for reconstructing or analyzing the replay.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor obtained from previous response to retrieve the next or previous set of results."),
    perPage: z.number().int().optional().describe("Number of recording segments per page (default/max is 100)."),
    replayId: z.string().describe("The unique identifier (UUID format without hyphens) of the replay session to retrieve recording segments for."),
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, cursor, perPage, replayId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/replays/${replayId}/recording-segments/`, { query: { cursor: cursor, per_page: perPage } });
  },
});
