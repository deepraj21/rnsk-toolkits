// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryAccessProjectInformation = tool({
  description: "Retrieves detailed information for a Sentry project, given its existing organization and project ID or slug.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/`, { query: {  } });
  },
});

export const sentryAddASymbolSourceToAProject = tool({
  description: "Tool to add a custom symbol source to a Sentry project. Use when configuring symbol sources for crash symbolication.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().optional().describe("Internal ID of the source. Must be distinct and cannot start with 'sentry:'. UUID generated if not provided."),
    url: z.string().optional().describe("Source URL. Required for HTTP sources."),
    name: z.string().describe("Human-readable name of the source."),
    type: z.enum(["http", "gcs", "s3"]).describe("Source type. Options: 'http' (SymbolServer HTTP), 'gcs' (Google Cloud Storage), 's3' (Amazon S3)."),
    bucket: z.string().optional().describe("Bucket name. Required for S3 and GCS sources."),
    prefix: z.string().optional().describe("S3 or GCS prefix path."),
    region: z.enum(["us-east-2", "us-east-1", "us-west-1", "us-west-2", "ap-east-1", "ap-south-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ca-central-1", "cn-north-1", "cn-northwest-1", "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1", "sa-east-1", "us-gov-east-1", "us-gov-west-1"]).optional().describe("AWS region enumeration for S3 sources."),
    password: z.string().optional().describe("Password for HTTP authentication."),
    username: z.string().optional().describe("Username for HTTP authentication."),
    accessKey: z.string().optional().describe("AWS Access Key. Required for S3 sources."),
    secretKey: z.string().optional().describe("AWS Secret Access Key. Required for S3 sources."),
    privateKey: z.string().optional().describe("GCS private key. Required for GCS sources."),
    clientEmail: z.string().optional().describe("GCS email for authentication. Required for GCS sources."),
    layoutType: z.enum(["native", "symstore", "symstore_index2", "ssqp", "unified", "debuginfod", "slashsymbols"]).describe("Layout type specifying the directory structure for symbols. Required for HTTP, GCS, and S3 sources."),
    layoutCasing: z.enum(["default", "uppercase", "lowercase"]).describe("Filename casing convention for symbols. Required for HTTP, GCS, and S3 sources."),
    filtersFiletypes: z.array(z.string()).optional().describe("List of file types to filter."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project."),
    filtersPathPatterns: z.array(z.string()).optional().describe("Glob patterns for debug/code file paths."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
    filtersRequiresChecksum: z.boolean().optional().describe("Whether source requires debug checksum. Default: false."),
  }),
  execute: async ({ sentryToken, id, url, name, type, bucket, prefix, region, password, username, accessKey, secretKey, privateKey, clientEmail, layoutType, layoutCasing, filtersFiletypes, projectIdOrSlug, filtersPathPatterns, organizationIdOrSlug, filtersRequiresChecksum }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/symbol-sources/`, { body: { id: id, url: url, name: name, type: type, bucket: bucket, prefix: prefix, region: region, password: password, username: username, access_key: accessKey, secret_key: secretKey, private_key: privateKey, client_email: clientEmail, layout: { type: layoutType, casing: layoutCasing }, filters: { filetypes: filtersFiletypes, path_patterns: filtersPathPatterns, requires_checksum: filtersRequiresChecksum } } });
  },
});

export const sentryAddTeamToProject = tool({
  description: "Grants a Sentry team access to a Sentry project within the specified Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry team that will be granted access to the project."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry project. Access will be granted to this project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry organization. This organization contains both the project and the team."),
  }),
  execute: async ({ sentryToken, teamIdOrSlug, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/teams/${teamIdOrSlug}/`, { body: {  } });
  },
});

export const sentryCreateProjectKeyWithOptionalRateLimiting = tool({
  description: "Creates a new client key (DSN) for an existing Sentry project, with optional custom rate limit configuration.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().optional().describe("An optional descriptive name for the client key. If not provided, Sentry will generate a default name."),
    ratelimitCount: z.number().int().optional().describe("The maximum number of events that can be accepted for this key within the specified `rateLimit_window`. If omitted, no custom rate limit will be applied to this key."),
    ratelimitWindow: z.number().int().optional().describe("The time window in seconds for the `rateLimit_count`. For example, if `rateLimit_count` is 1000 and `rateLimit_window` is 3600, the key will accept up to 1000 events per hour. If omitted, no custom rate limit will be app"),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry project for which the client key will be created."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, name, ratelimitCount, ratelimitWindow, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/keys/`, { body: { name: name, rateLimit: { count: ratelimitCount, window: ratelimitWindow } } });
  },
});

export const sentryCreateTeamProjectForOrganization = tool({
  description: "Creates a new Sentry project for an existing organization and team, allowing configuration of its name, slug, platform, and default alert rules.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().describe("Display name for the new Sentry project."),
    slug: z.string().optional().describe("Optional unique identifier for the project (e.g., for URLs), auto-generated from the name if omitted. Pattern: `^[a-z][a-z0-9_\\-]*$`."),
    platform: z.string().optional().describe("Primary platform or language (e.g., python, javascript, java) for SDK setup instructions and issue processing."),
    defaultRules: z.boolean().optional().describe("Specifies whether to create default alert rules. If true (API default when parameter is omitted), an alert is triggered for every new issue. If false, no default alerts are created."),
    teamIdOrSlug: z.string().describe("ID or slug of the Sentry team to associate with the project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization where the project will be created."),
  }),
  execute: async ({ sentryToken, name, slug, platform, defaultRules, teamIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/teams/${organizationIdOrSlug}/${teamIdOrSlug}/projects/`, { body: { name: name, slug: slug, platform: platform, defaultRules: defaultRules } });
  },
});

export const sentryDeleteDsymsForProject = tool({
  description: "Permanently removes a specific Debug Information File (DIF), used for symbolicating crash reports, from the specified Sentry project and organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().describe("The unique identifier of the Debug Information File (DIF) to be deleted. This ID is assigned by Sentry when the file is uploaded."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project from which the Debug Information File (DIF) will be deleted."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the project belongs. Slugs are short, URL-friendly names."),
  }),
  execute: async ({ sentryToken, id, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/files/dsyms/${id}/`, { query: {  } });
  },
});

export const sentryDeleteProjectById = tool({
  description: "Schedules a Sentry project for asynchronous deletion within a specified organization, hiding it from most public views once the process begins.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry project to be deleted."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/`, { query: {  } });
  },
});

export const sentryDeleteProjectKey = tool({
  description: "Permanently deletes a specific client key (DSN) for a project, preventing it from being used to send events to Sentry.",
  inputSchema: z.object({
    sentryToken: tokenField,
    keyId: z.string().describe("The ID of the client key (public DSN key) to delete."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project to which the client key belongs."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, keyId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/keys/${keyId}/`, { query: {  } });
  },
});

export const sentryDeleteProjectTeamAssociation = tool({
  description: "Revokes a team's access to a Sentry project; this operation is idempotent.",
  inputSchema: z.object({
    sentryToken: tokenField,
    teamIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry team to be disassociated from the project."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, teamIdOrSlug, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/teams/${teamIdOrSlug}/`, { query: {  } });
  },
});

export const sentryDeleteSymbolSourceFromProject = tool({
  description: "Deletes a custom symbol source from a Sentry project. Use when you need to remove a symbol source that is no longer needed or needs to be reconfigured.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().describe("The ID of the symbol source to delete."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project containing the symbol source."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the project belongs to."),
  }),
  execute: async ({ sentryToken, id, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/symbol-sources/${id}/`, { query: {  } });
  },
});

export const sentryFetchProjectEnvironmentDetails = tool({
  description: "Retrieves detailed information for a specific environment within a Sentry project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    environment: z.string().describe("The name of the environment (e.g., production, staging, development)."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, environment, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/environments/${environment}/`, { query: {  } });
  },
});

export const sentryFetchProjectOwnershipDetails = tool({
  description: "Retrieves the ownership configuration, like CODEOWNERS rules or Issue Owner settings, for a specified Sentry project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project for which ownership details are to be retrieved. This is used as a path parameter in the API request."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the project belongs. This is used as a path parameter in the API request."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/ownership/`, { query: {  } });
  },
});

export const sentryGetProjectEventStats = tool({
  description: "Retrieves time-series event statistics for a Sentry project. Returns an array of [timestamp, count] data points showing event volumes over time. Use this to analyze event trends, monitor error rates, or generate custom dashboards. The endpoint supports different event types (received, rejected, blac",
  inputSchema: z.object({
    sentryToken: tokenField,
    stat: z.enum(["received", "rejected", "blacklisted", "generated"]).optional().describe("The type of event statistic to retrieve: 'received' (events accepted by Sentry), 'rejected' (events rejected due to rate limits/filters), 'blacklisted' (events from blocked sources), or 'generated' (events created by Sen"),
    since: z.string().optional().describe("UNIX timestamp (seconds since epoch) marking the start of the query period. Must be earlier than 'until' if both are provided. If not specified, defaults to 24 hours before the current time."),
    until: z.string().optional().describe("UNIX timestamp (seconds since epoch) marking the end of the query period. Must be later than 'since' if both are provided. If not specified, defaults to the current time."),
    resolution: z.enum(["10s", "1h", "1d"]).optional().describe("Time granularity for data aggregation: '10s' (10-second intervals), '1h' (hourly intervals), or '1d' (daily intervals). Finer resolutions (10s) return more data points but may be slower. If not specified, Sentry automati"),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the organization."),
  }),
  execute: async ({ sentryToken, stat, since, until, resolution, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/stats/`, { query: { stat: stat, since: since, until: until, resolution: resolution } });
  },
});

export const sentryGetProjectList = tool({
  description: "Lists all Sentry projects the authenticated token has membership access to across all organizations. IMPORTANT: This endpoint returns projects where the token's user is a member. An empty result does NOT mean no projects exist - it means the token lacks project membership. This commonly happens when",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Opaque cursor for paginating through project lists, typically obtained from pagination details in a previous API response."),
  }),
  execute: async ({ sentryToken, cursor }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/`, { query: { cursor: cursor } });
  },
});

export const sentryListProjectTags = tool({
  description: "Retrieves all tags that have been recorded for events within a Sentry project, along with statistical information for each tag. Use when you need to understand what tags are available in a project and their usage patterns. This provides an overview of tag distribution and helps identify commonly use",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/tags/`, { query: {  } });
  },
});

export const sentryListProjectUsers = tool({
  description: "Retrieves users who have interacted with or are recognized within a specific Sentry project, optionally filtered by a query.",
  inputSchema: z.object({
    sentryToken: tokenField,
    query: z.string().optional().describe("An optional query string to filter the list of users. Use prefixes like `id:`, `email:`, `username:`, or `ip:` to target specific fields. For example, `email:foo@example.com` or `username:john.doe`."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug for the Sentry organization."),
  }),
  execute: async ({ sentryToken, query, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/users/`, { query: { query: query } });
  },
});

export const sentryRetrieveDsymFilesForProject = tool({
  description: "Retrieve a list of debug information files (dSYM files) for a specified Sentry project, used for symbolication to display human-readable stack traces.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/files/dsyms/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationProjects = tool({
  description: "Retrieves a list of Sentry projects for a specified organization (which must be accessible), supporting pagination via cursor. Note: The {region} placeholder in the base URL is handled by the ApiAction framework, which overrides it with the base_url from auth metadata (typically 'https://sentry.io')",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor pointing to the next or previous set of results. If omitted, the first page is returned. Typically obtained from a previous response's 'Link' header."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, cursor, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/projects/`, { query: { cursor: cursor } });
  },
});

export const sentryRetrieveProjectEnvironments = tool({
  description: "Retrieves a list of environments for an existing project within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    visibility: z.enum(["all", "hidden", "visible"]).optional().describe("Filters environments by their visibility status: `all`, `hidden`, or `visible`."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project for which environments are to be retrieved."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, visibility, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/environments/`, { query: { visibility: visibility } });
  },
});

export const sentryRetrieveProjectFilterData = tool({
  description: "Retrieves a Sentry project's current data filtering settings, used to ignore events from sources like localhost, web crawlers, or legacy browsers.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("Unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("Unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/filters/`, { query: {  } });
  },
});

export const sentryRetrieveProjectKeyDetails = tool({
  description: "Retrieves details of a specific client key (DSN) for a Sentry project, which is used by Sentry SDKs to send event data.",
  inputSchema: z.object({
    sentryToken: tokenField,
    keyId: z.string().describe("ID of the client key (DSN)."),
    projectIdOrSlug: z.string().describe("ID or slug of the project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, keyId, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/keys/${keyId}/`, { query: {  } });
  },
});

export const sentryRetrieveProjectKeysByOrgAndProject = tool({
  description: "Retrieves a list of client keys (DSNs), used by Sentry SDKs to send events, for a specified project within an organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    cursor: z.string().optional().describe("Pagination cursor to retrieve the next or previous set of results, typically formatted as '<cursor_identifier>:<row_offset>:<is_prev>'."),
    status: z.string().optional().describe("Filter client keys by status: 'active' or 'inactive'. If unspecified, returns all keys."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, cursor, status, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/keys/`, { query: { cursor: cursor, status: status } });
  },
});

export const sentryRetrieveProjectMembersList = tool({
  description: "Retrieves active organization members belonging to any team assigned to the specified Sentry project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("The ID or human-readable slug of the Sentry project. This identifies the project for which members will be listed."),
    organizationIdOrSlug: z.string().describe("The ID or human-readable slug of the Sentry organization. This identifies the organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/members/`, { query: {  } });
  },
});

export const sentryRetrieveProjectSymbolSources = tool({
  description: "Retrieves custom symbol sources for a Sentry project, either listing all or fetching a specific one if its ID is provided.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().optional().describe("ID of a specific symbol source to retrieve; if omitted, all custom symbol sources for the project are returned."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or URL-friendly slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, id, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/symbol-sources/`, { query: { id: id } });
  },
});

export const sentryRetrieveProjectTagValues = tool({
  description: "Retrieves up to 1000 unique values for a specified tag key that has been recorded for events within a Sentry project. Returns an empty list if the tag key doesn't exist or has no values recorded yet.",
  inputSchema: z.object({
    sentryToken: tokenField,
    key: z.string().describe("The specific tag key for which to retrieve the associated distinct values (e.g., 'browser', 'device', 'environment')."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, key, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/tags/${key}/values/`, { query: {  } });
  },
});

export const sentryRetrieveProjectTeams = tool({
  description: "Retrieves a list of teams with explicit access to a specific project within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/teams/`, { query: {  } });
  },
});

export const sentryToggleProjectFilterStatus = tool({
  description: "Updates the status or configuration of a specific inbound data filter for a Sentry project; use `active` for most filters, or `subfilters` if `filter_id` is `legacy-browsers`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    active: z.boolean().optional().describe("Enable (`true`) or disable (`false`) the filter. Required if `filter_id` is not `legacy-browsers`; not used if `filter_id` is `legacy-browsers` (use `subfilters` then)."),
    filterId: z.string().describe("Identifier of the inbound data filter to update. Each `filter_id` has a specific behavior: - `browser-extensions`: Filters errors known to be caused by browser extensions. - `localhost`: Filters events originating from l"),
    subfilters: z.array(z.string()).optional().describe("List of legacy browser subfilters to enable (unlisted ones will be disabled). Required and only used if `filter_id` is `legacy-browsers`. Available options: - `ie`: Internet Explorer (v11 and older) - `edge`: Edge (v18 a"),
    projectIdOrSlug: z.string().describe("ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, active, filterId, subfilters, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/filters/${filterId}/`, { body: { active: active, subfilters: subfilters } });
  },
});

export const sentryUpdateAProjectsSymbolSource = tool({
  description: "Updates an existing custom symbol source (HTTP, GCS, or S3) in a project for fetching debug symbols. Use when you need to modify the configuration of a symbol source identified by its ID.",
  inputSchema: z.object({
    sentryToken: tokenField,
    id: z.string().describe("The ID of the symbol source to update. This is passed as a query parameter."),
    url: z.string().optional().describe("Base URL for an HTTP symbol source. Required if type is 'http'."),
    name: z.string().describe("Human-readable name for the symbol source."),
    type: z.enum(["http", "gcs", "s3"]).describe("Type of the symbol source. Required field that determines which additional fields are needed."),
    bucket: z.string().optional().describe("Name of the GCS or S3 bucket containing symbols. Required if type is 'gcs' or 's3'."),
    prefix: z.string().optional().describe("Optional path prefix within the GCS or S3 bucket."),
    region: z.enum(["us-east-2", "us-east-1", "us-west-1", "us-west-2", "ap-east-1", "ap-south-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ca-central-1", "cn-north-1", "cn-northwest-1", "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1", "sa-east-1", "us-gov-east-1", "us-gov-west-1"]).optional().describe("AWS region for the S3 bucket. Required if type is 's3'."),
    password: z.string().optional().describe("Password for HTTP basic authentication. Optional for HTTP sources."),
    username: z.string().optional().describe("Username for HTTP basic authentication. Optional for HTTP sources."),
    sourceId: z.string().optional().describe("Optional internal ID of the source. Must be distinct from all other source IDs and cannot start with 'sentry:'."),
    accessKey: z.string().optional().describe("AWS Access Key ID for S3 authentication. Required if type is 's3'."),
    secretKey: z.string().optional().describe("AWS Secret Access Key for S3 authentication. Required if type is 's3'."),
    privateKey: z.string().optional().describe("Private key (PEM format) for GCS service account. Required if type is 'gcs'."),
    clientEmail: z.string().optional().describe("Client email for GCS service account. Required if type is 'gcs'."),
    layoutType: z.enum(["native", "symstore", "symstore_index2", "ssqp", "unified", "debuginfod", "slashsymbols"]).optional().describe("Specifies the directory structure or layout type for symbols. Required for HTTP, GCS, and S3 sources."),
    layoutCasing: z.enum(["lowercase", "uppercase", "default"]).optional().describe("Specifies the filename casing convention for symbols."),
    filtersFiletypes: z.array(z.string()).optional().describe("List of file types to filter. Optional filtering configuration."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project containing the symbol source."),
    filtersPathPatterns: z.array(z.string()).optional().describe("List of glob patterns for path matching. Optional filtering configuration."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization that owns the project."),
    filtersRequiresChecksum: z.boolean().optional().describe("Whether debug checksums are mandatory. Defaults to false if not specified."),
  }),
  execute: async ({ sentryToken, id, url, name, type, bucket, prefix, region, password, username, sourceId, accessKey, secretKey, privateKey, clientEmail, layoutType, layoutCasing, filtersFiletypes, projectIdOrSlug, filtersPathPatterns, organizationIdOrSlug, filtersRequiresChecksum }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/symbol-sources/${id}/`, { body: { url: url, name: name, type: type, bucket: bucket, prefix: prefix, region: region, password: password, username: username, source_id: sourceId, access_key: accessKey, secret_key: secretKey, private_key: privateKey, client_email: clientEmail, layout: { type: layoutType, casing: layoutCasing }, filters: { filetypes: filtersFiletypes, path_patterns: filtersPathPatterns, requires_checksum: filtersRequiresChecksum } } });
  },
});

export const sentryUpdateEnvironmentVisibility = tool({
  description: "Updates the visibility of a specific environment within a Sentry project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    isHidden: z.boolean().describe("Indicates if the environment should be hidden (`true`) or visible (`false`)."),
    environment: z.string().describe("The name of the environment to update."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, isHidden, environment, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/environments/${environment}/`, { body: { isHidden: isHidden } });
  },
});

export const sentryUpdateProjectDetails = tool({
  description: "Updates a Sentry project's settings (e.g., name, slug, platform, bookmark status); `isBookmarked` can be updated with `project:read` permission, other fields typically require `project:write` or `project:admin` permissions.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().optional().describe("The new name for the project."),
    slug: z.string().optional().describe("The new unique identifier (slug) for the project, used in URLs and the Sentry interface."),
    platform: z.string().optional().describe("The new platform for the project (e.g., `python`, `javascript`, `java`). This helps Sentry categorize and process errors."),
    resolveAge: z.number().int().optional().describe("The duration in hours after which an issue is automatically resolved if it hasn't been seen. Set to `0` to disable auto-resolution. "),
    isBookmarked: z.boolean().optional().describe("Toggles whether the project is starred (bookmarked) in the Sentry UI."),
    highlightTags: z.array(z.string()).optional().describe("A list of tag keys (e.g., 'release', 'environment') to highlight on this project's issues in Sentry's UI. For example: `['release', 'environment', 'server_name']`."),
    subjectPrefix: z.string().optional().describe("Custom prefix for the subject line of notification emails sent from this project."),
    subjectTemplate: z.string().optional().describe("The template for the email subject (excluding the prefix) for individual issue alerts. Available variables: `$title`, `$shortID`, `$projectID`, `$orgID`, and `${tag:key}` (e.g., `${tag:environment}`, `${tag:release}`)."),
    highlightContext: z.record(z.any()).optional().describe("A JSON object mapping context types (e.g., 'user', 'device') to a list of their keys to be highlighted in Sentry's UI for issues within this project. For example: `{'user': ['id', 'email'], 'device': ['model']}`."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project to be updated."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, name, slug, platform, resolveAge, isBookmarked, highlightTags, subjectPrefix, subjectTemplate, highlightContext, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/`, { body: { name: name, slug: slug, platform: platform, resolveAge: resolveAge, isBookmarked: isBookmarked, highlightTags: highlightTags, subjectPrefix: subjectPrefix, subjectTemplate: subjectTemplate, highlightContext: highlightContext } });
  },
});

export const sentryUpdateProjectKeyConfiguration = tool({
  description: "Updates configuration settings (e.g., name, status, rate limits, SDK options) for an existing Sentry client key (DSN), identified by `key_id`, within a specified `project_id_or_slug` and `organization_id_or_slug`.",
  inputSchema: z.object({
    sentryToken: tokenField,
    name: z.string().optional().describe("New human-readable name for the client key. Name will not be changed if omitted."),
    keyId: z.string().describe("The ID of the client key (DSN public key) to be updated."),
    isActive: z.boolean().optional().describe("Specifies if the client key should be active (`true` to activate, `false` to deactivate). Status remains unchanged if omitted."),
    ratelimitCount: z.number().int().optional().describe("Maximum number of events the key can accept within `rateLimit_window`. Uses existing settings or project defaults if omitted."),
    browserSdkVersion: z.enum(["latest", "10.x", "9.x", "8.x", "7.x"]).optional().describe("Sentry JavaScript SDK version for the loader ('latest', '10.x', '9.x', '8.x', or '7.x'). Current setting remains unchanged if omitted."),
    ratelimitWindow: z.number().int().optional().describe("Time window in seconds for `rateLimit_count` (e.g., 3600 for 1 hour). Uses existing settings or project defaults if omitted."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project whose key is being updated."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the project belongs."),
    dynamicsdkloaderoptionsHasdebug: z.boolean().optional().describe("Enable (`true`) or disable (`false`) Debugging features for the dynamic SDK loader. Current setting remains unchanged if omitted."),
    dynamicsdkloaderoptionsHasreplay: z.boolean().optional().describe("Enable (`true`) or disable (`false`) Session Replay for the dynamic SDK loader. Current setting remains unchanged if omitted."),
    dynamicsdkloaderoptionsHasperformance: z.boolean().optional().describe("Enable (`true`) or disable (`false`) Performance Monitoring for the dynamic SDK loader. Current setting remains unchanged if omitted."),
  }),
  execute: async ({ sentryToken, name, keyId, isActive, ratelimitCount, browserSdkVersion, ratelimitWindow, projectIdOrSlug, organizationIdOrSlug, dynamicsdkloaderoptionsHasdebug, dynamicsdkloaderoptionsHasreplay, dynamicsdkloaderoptionsHasperformance }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/keys/${keyId}/`, { body: { name: name, isActive: isActive, browserSdkVersion: browserSdkVersion, rateLimit: { count: ratelimitCount, window: ratelimitWindow }, dynamicSdkLoaderOptions: { hasDebug: dynamicsdkloaderoptionsHasdebug, hasReplay: dynamicsdkloaderoptionsHasreplay, hasPerformance: dynamicsdkloaderoptionsHasperformance } } });
  },
});

export const sentryUpdateProjectOwnershipSettings = tool({
  description: "Updates the ownership configuration settings (raw rules, fallthrough, auto-assignment, CODEOWNERS sync) for a Sentry project; omitted attributes retain their current values.",
  inputSchema: z.object({
    sentryToken: tokenField,
    raw: z.string().optional().describe("Raw Sentry ownership rule string (e.g., 'path:src/components/* #frontend') defining issue assignment based on file paths or URLs. See Sentry's Ownership Rules documentation for syntax."),
    fallthrough: z.boolean().optional().describe("If `True`, assigns issues to all project members if no ownership rule matches; if `False`, no owners are set by default in such cases."),
    autoAssignment: z.string().optional().describe("Strategy for assigning new issues not covered by ownership rules. Options: 'Auto Assign to Issue Owner', 'Auto Assign to Suspect Commits', 'Turn off Auto-Assignment'."),
    codeownersAutoSync: z.boolean().optional().describe("If `True` (default), automatically synchronizes Sentry issue ownership with the repository's CODEOWNERS file during a release."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, raw, fallthrough, autoAssignment, codeownersAutoSync, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/ownership/`, { body: { raw: raw, fallthrough: fallthrough, autoAssignment: autoAssignment, codeownersAutoSync: codeownersAutoSync } });
  },
});

export const sentryUploadDsymsFileToProject = tool({
  description: "Uploads a dSYM (debug symbols) zip archive, containing an Apple .dSYM folder, to the specified Sentry project for symbolicating crash reports from Apple platforms.",
  inputSchema: z.object({
    sentryToken: tokenField,
    file: z.record(z.any()).optional().describe("The dSYM file to upload, provided as a zip archive of an Apple .dSYM folder containing debug symbols."),
    projectIdOrSlug: z.string().describe("Unique ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("Unique ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, file, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryUpload(sentryToken, `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/files/dsyms/`, { file: file });
  },
});
