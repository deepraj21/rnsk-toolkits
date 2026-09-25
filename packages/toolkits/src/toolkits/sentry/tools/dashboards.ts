// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryCreateDashboardWithWidgets = tool({
  description: "Creates a Sentry dashboard with widgets for an organization; `organization_id_or_slug` and specified `project` IDs must be valid, and `start`/`end` datetimes (if absolute range) must form a logical ISO 8601 range.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().optional().describe("Optional client-specified unique dashboard identifier; Sentry generates one if omitted."),
    end: z.string().optional().describe("Absolute end datetime (ISO 8601) for time range; 'start' must also be set for custom absolute range."),
    utc: z.boolean().optional().describe("If true, time range is UTC; otherwise, defaults to user's local time or organization settings."),
    start: z.string().optional().describe("Absolute start datetime (ISO 8601) for time range; 'end' must also be set for custom absolute range."),
    title: z.string().describe("Title for the new dashboard."),
    period: z.string().optional().describe("Default relative time range (e.g., '24h', '7d', 'auto'); 'auto' is often 14 days. Overridden if 'start' and 'end' are provided."),
    filters: z.record(z.any()).optional().describe("Additional key-value filters (Sentry search syntax for keys) for the dashboard."),
    widgets: z.array(z.any()).optional().describe("List of widget configurations defining appearance, data queries, and layout."),
    projects: z.array(z.number().int()).optional().describe("Project IDs to scope dashboard data; if empty/null, may apply to all accessible projects based on org settings."),
    environment: z.array(z.string()).optional().describe("Environment names (e.g., 'production') to filter data; if empty/null, all environments included."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization where the dashboard will be created."),
  }),
  execute: async ({ sentryToken, id, end, utc, start, title, period, filters, widgets, projects, environment, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/dashboards/`, { body: { id: id, end: end, utc: utc, start: start, title: title, period: period, filters: filters, widgets: widgets, projects: projects, environment: environment } });
  },
});

export const sentryDeleteOrganizationDashboard = tool({
  description: "Deletes a custom dashboard or tombstones (marks as deleted) a pre-built dashboard within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    dashboardId: z.number().int().describe("Numerical ID of the dashboard to delete."),
    organizationIdOrSlug: z.string().describe("Identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, dashboardId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/dashboards/${dashboardId}/`, { query: {  } });
  },
});

export const sentryDeleteOrganizationDiscoverQuery = tool({
  description: "Permanently removes a specific saved Discover query (a configuration for exploring event data) from a Sentry organization. This action requires one of the following scopes: org:admin, org:read, or org:write. The Discover saved queries feature is only available on Business and Enterprise plans.",
  inputSchema: z.object({
    sentryToken: tokenField,
    queryId: z.number().int().describe("The unique integer identifier of the saved Discover query that you intend to delete."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the Discover query belongs."),
  }),
  execute: async ({ sentryToken, queryId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/discover/saved/${queryId}/`, { query: {  } });
  },
});

export const sentryListOrganizationDashboards = tool({
  description: "Retrieves a list of custom dashboards for a Sentry organization, with pagination support.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Opaque cursor for pagination, used to retrieve the next or previous page of dashboards. Obtain from the 'Link' header or pagination metadata of a previous API response."),
    perPage: z.number().int().optional().describe("Maximum number of dashboard records per page. Defaults to Sentry's setting (often 50) if unspecified. Max: 100."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization whose dashboards are to be listed."),
  }),
  execute: async ({ sentryToken, cursor, perPage, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/dashboards/`, { query: { cursor: cursor, per_page: perPage } });
  },
});

export const sentryRetrieveAggregatedTestResultMetrics = tool({
  description: "Retrieves aggregated test result metrics for a repository, owner, and organization. Use when you need to analyze test performance and reliability metrics for a specific repository.",
  inputSchema: z.object({
    sentryToken: tokenField,
    owner: z.string().describe("The owner of the repository."),
    branch: z.string().optional().describe("The branch to search for results by. If not specified, the default is all branches."),
    interval: z.string().optional().describe("Time interval for results. Options: INTERVAL_30_DAY, INTERVAL_7_DAY, INTERVAL_1_DAY. If not specified, defaults to INTERVAL_30_DAY."),
    repository: z.string().describe("The name of the repository."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, owner, branch, interval, repository, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/test-results/`, { query: { owner: owner, branch: branch, interval: interval, repository: repository } });
  },
});

export const sentryRetrieveOrganizationDashboard = tool({
  description: "Fetches detailed information about a specific custom dashboard within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    dashboardId: z.number().int().describe("The unique numeric identifier (ID) of the custom dashboard to retrieve within the specified organization."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, dashboardId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/dashboards/${dashboardId}/`, { query: {  } });
  },
});

export const sentryRetrieveSavedDiscoverQueries = tool({
  description: "Retrieves a paginated list of saved Discover queries for a Sentry organization. Returns saved query definitions that can be used to reproduce specific event searches and analyses. Supports filtering by name and sorting by various criteria (name, date, popularity, etc.). **Important**: This endpoint ",
  inputSchema: z.object({
    sentryToken: tokenField,
    query: z.string().optional().describe("A string to filter saved Discover queries by their name. For example, 'High CPU Usage'."),
    cursor: z.string().optional().describe("An opaque pagination cursor that points to the last object fetched and its sort order. Used to retrieve the next or previous set of results."),
    sortBy: z.string().optional().describe("Field to sort results by. Defaults to sorting by query name. Valid options: `name` (alphabetical), `dateCreated` (creation date), `dateUpdated` (last modified date), `mostPopular` (by usage frequency), `recentlyViewed` ("),
    perPage: z.number().int().optional().describe("Maximum number of saved queries to return per page. Max: 100."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization for which to retrieve saved Discover queries."),
  }),
  execute: async ({ sentryToken, query, cursor, sortBy, perPage, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/discover/saved/`, { query: { query: query, cursor: cursor, sortBy: sortBy, per_page: perPage } });
  },
});

export const sentryRetrieveSavedDiscoverQueryForOrganization = tool({
  description: "Retrieves a specific saved Discover query (a predefined set of filters and conditions for exploring event data) for a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    queryId: z.number().int().describe("The ID of the saved Discover query to retrieve."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, queryId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/discover/saved/${queryId}/`, { query: {  } });
  },
});

export const sentrySaveOrganizationDiscoverQuery = tool({
  description: "Saves a new Discover query with a unique name for a Sentry organization, allowing reuse of search criteria for analyzing event data (errors, transactions) across specified projects and environments.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("End date/time for the query's time range (ISO 8601). Takes precedence over `range`."),
    name: z.string().describe("Unique name for the saved query."),
    query: z.string().optional().describe("Search query string using Sentry's syntax (e.g., `level:error transaction:/api/v1/*`)."),
    range: z.string().optional().describe("Relative time range (e.g., '24h', '7d') if `start` and `end` are not provided."),
    start: z.string().optional().describe("Start date/time for the query's time range (ISO 8601). Takes precedence over `range`."),
    yAxis: z.array(z.string()).optional().describe("List of aggregate functions for the y-axis of the chart visualization."),
    fields: z.array(z.string()).optional().describe("List of fields (e.g., `transaction`, `tag[tagName]`), functions (e.g., `count_if(...)`), or equations (prefixed with `equation|`) to include (max 20). See Sentry documentation for details."),
    display: z.string().optional().describe("Chart visualization type. Allowed: `default`, `previous`, `top5`, `daily`, `dailytop5`, `bar`."),
    orderby: z.string().optional().describe("Field or function from `fields` list to order results by (prefix with `-` for descending). Cannot be an equation."),
    interval: z.string().optional().describe("Time series resolution for the chart (e.g., '1h', '30m', 'auto')."),
    projects: z.array(z.number().int()).optional().describe("List of project IDs to filter by; empty list implies all projects in the organization."),
    topEvents: z.number().int().optional().describe("Number of 'top events' timeseries for `top5` or `dailytop5` display types."),
    environment: z.array(z.string()).optional().describe("List of environment names to filter by."),
    queryDataset: z.enum(["discover", "error-events", "transaction-like"]).optional().describe("Dataset to query: `discover` (event properties/tags), `error-events` (error data), or `transaction-like` (transaction/performance data)."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, end, name, query, range, start, yAxis, fields, display, orderby, interval, projects, topEvents, environment, queryDataset, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/discover/saved/`, { body: { end: end, name: name, query: query, range: range, start: start, yAxis: yAxis, fields: fields, display: display, orderby: orderby, interval: interval, projects: projects, topEvents: topEvents, environment: environment, queryDataset: queryDataset } });
  },
});

export const sentryUpdateOrganizationDashboard = tool({
  description: "Updates an existing custom dashboard, allowing modifications to its title, widgets, and data filters; providing `widgets`, `projects`, `environment`, `period`, `start`, `end`, or `filters` will overwrite existing settings for those fields.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().optional().describe("Unique identifier for the dashboard; should match existing ID if updating."),
    end: z.string().optional().describe("The absolute end time for the dashboard's time range, in ISO 8601 format (e.g., '2023-01-02T00:00:00Z'). If provided along with 'start', `period` is ignored. Replaces the existing end time."),
    utc: z.boolean().optional().describe("A boolean indicating whether the dashboard's time range should be displayed in UTC. `True` for UTC, `False` for the user's local time."),
    start: z.string().optional().describe("The absolute start time for the dashboard's time range, in ISO 8601 format (e.g., '2023-01-01T00:00:00Z'). If provided along with 'end', `period` is ignored. Replaces the existing start time."),
    title: z.string().optional().describe("The new title for the dashboard."),
    period: z.string().optional().describe("The relative time range period for the dashboard (e.g., '24h', '7d', '30d'). Replaces the existing period. If 'start' and 'end' are set, this is ignored."),
    filters: z.record(z.any()).optional().describe("A dictionary of additional filters to apply to the dashboard data, replacing existing filters. Keys are filter names, values are filter values."),
    widgets: z.array(z.any()).optional().describe("A list of widget configurations to be updated or set for this dashboard. This will replace all existing widgets."),
    projects: z.array(z.number().int()).optional().describe("A list of project IDs to filter the dashboard data by. Replaces the existing project filter."),
    environment: z.array(z.string()).optional().describe("A list of environment names to filter the dashboard data by. Replaces the existing environment filter."),
    dashboardId: z.number().int().describe("The ID of the dashboard to be updated."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the resource belongs to."),
  }),
  execute: async ({ sentryToken, id, end, utc, start, title, period, filters, widgets, projects, environment, dashboardId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/dashboards/${dashboardId}/`, { body: { id: id, end: end, utc: utc, start: start, title: title, period: period, filters: filters, widgets: widgets, projects: projects, environment: environment } });
  },
});

export const sentryUpdateSavedQueryForOrganization = tool({
  description: "Updates an existing Discover saved query for a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    end: z.string().optional().describe("The specific end date and time for the query's time range, in ISO 8601 format (e.g., '2023-01-31T23:59:59Z'); used if 'range' is not provided."),
    name: z.string().describe("The new user-defined name for the saved query."),
    query: z.string().optional().describe("The Sentry search query string to filter results (e.g., 'error.type:ZeroDivisionError browser.name:Firefox'). Refer to Sentry's search syntax documentation for details."),
    range: z.string().optional().describe("The relative time range period for this saved query (e.g., '24h', '7d', '30d'); an alternative to specific 'start' and 'end' times."),
    start: z.string().optional().describe("The specific start date and time for the query's time range, in ISO 8601 format (e.g., '2023-01-01T00:00:00Z'); used if 'range' is not provided."),
    yAxis: z.array(z.string()).optional().describe("A list of aggregate functions to be plotted on the Y-axis of the chart (e.g., 'count()', 'p95(transaction.duration)')."),
    fields: z.array(z.string()).optional().describe("A list of fields, functions, or equations for the query, with a maximum of 20. Each item can be: 1. A built-in key field (e.g., 'transaction'; see Sentry's properties table for event properties). 2. A tag, formatted as '"),
    display: z.string().optional().describe("The visualization type for the saved query chart. Allowed values are: 'default', 'previous', 'top5', 'daily', 'dailytop5', 'bar'."),
    orderby: z.string().optional().describe("Field to sort the query results by. Must be one of the items in the 'fields' list (excluding equations). Prefix with a hyphen '-' for descending order (e.g., '-count()')."),
    interval: z.string().optional().describe("The resolution of the time series for the chart (e.g., '1h', '1d', '30m')."),
    projects: z.array(z.number().int()).optional().describe("A list of project IDs to associate with this saved query. An empty list means the query applies to all projects selected in the Sentry UI unless overridden."),
    queryId: z.number().int().describe("The unique identifier of the Discover saved query to be updated."),
    topEvents: z.number().int().optional().describe("The number of top events' timeseries to be visualized on the chart."),
    environment: z.array(z.string()).optional().describe("A list of environment names to filter the query by."),
    queryDataset: z.enum(["discover", "error-events", "transaction-like"]).optional().describe("The dataset to query. Note: 'discover' is deprecated; use 'error-events' or 'transaction-like' instead."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization to which the saved query belongs."),
  }),
  execute: async ({ sentryToken, end, name, query, range, start, yAxis, fields, display, orderby, interval, projects, queryId, topEvents, environment, queryDataset, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/discover/saved/${queryId}/`, { body: { end: end, name: name, query: query, range: range, start: start, yAxis: yAxis, fields: fields, display: display, orderby: orderby, interval: interval, projects: projects, topEvents: topEvents, environment: environment, queryDataset: queryDataset } });
  },
});
