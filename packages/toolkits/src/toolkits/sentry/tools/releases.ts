// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sentryRequest, sentryUpload } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const sentryCreateReleaseDeployForOrg = tool({
  description: "Creates a new deploy record in Sentry to track the introduction of a release version into a specific environment.",
  inputSchema: z.object({
    sentryToken: tokenField,
    url: z.string().optional().describe("An optional URL that provides a link to the deployment, such as a commit or a CI build page."),
    name: z.string().optional().describe("An optional human-readable name for the deploy."),
    version: z.string().describe("The version identifier of the release to be deployed. This version must already exist in Sentry."),
    projects: z.array(z.string()).optional().describe("An optional list of project slugs to associate this deploy with. If not provided, the deploy applies to all projects associated with the release."),
    dateStarted: z.string().optional().describe("An optional ISO 8601 formatted date-time string (UTC is recommended) indicating when the deployment process started."),
    environment: z.string().describe("The name of the environment to which this release is being deployed (e.g., 'production', 'staging'). This environment must be known to Sentry."),
    dateFinished: z.string().optional().describe("An optional ISO 8601 formatted date-time string (UTC is recommended) indicating when the deployment process finished. If not provided, Sentry uses the time the deploy API call is received."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, url, name, version, projects, dateStarted, environment, dateFinished, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/releases/${version}/deploys/`, { body: { url: url, name: name, projects: projects, dateStarted: dateStarted, environment: environment, dateFinished: dateFinished } });
  },
});

export const sentryCreateReleaseForOrganization = tool({
  description: "Creates a new Sentry release for an existing organization, associating it with specified projects that must belong to that organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    ref: z.string().optional().describe("An optional commit reference, such as a branch name or a tag. This is useful if a tagged version has been provided (e.g., `version` is 'v1.0.0' and `ref` is 'refs/tags/v1.0.0'). "),
    url: z.string().optional().describe("An optional URL that points to the release. This can be a link to a GitHub release, a CI build page, or an internal changelog. "),
    refs: z.array(z.any()).optional().describe("An optional way to indicate the start and end commits for each repository included in a release. Head commits must include `repository` and `commit` (the HEAD SHA). They can optionally include `previousCommit` (the SHA o"),
    commits: z.array(z.any()).optional().describe("An optional list of commit data to be associated with the release. Commits must include the `id` parameter (the SHA of the commit). Optionally, include `repository`, `message`, `patch_set`, `author_name`, `author_email`,"),
    version: z.string().describe("A unique identifier for this release. Can be a semantic version number, a commit hash, or any other string that uniquely identifies this release. "),
    projects: z.array(z.string()).describe("A list of project slugs that are part of this release. These projects must belong to the specified organization."),
    dateReleased: z.string().optional().describe("An optional ISO 8601 timestamp indicating when the release went live. If not provided, the current time is assumed by Sentry. "),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, ref, url, refs, commits, version, projects, dateReleased, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "POST", `/organizations/${organizationIdOrSlug}/releases/`, { body: { ref: ref, url: url, refs: refs, commits: commits, version: version, projects: projects, dateReleased: dateReleased } });
  },
});

export const sentryDeleteOrganizationRelease = tool({
  description: "Permanently and irreversibly removes a Sentry release, including all its associated files, identified by its version from the specified organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The version identifier of the release to be deleted. This could be a semantic version (e.g., '1.0.0', 'my-app@2.3.1') or a unique commit hash."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the release belongs."),
  }),
  execute: async ({ sentryToken, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/releases/${version}/`, { query: {  } });
  },
});

export const sentryDeleteOrganizationReleaseFile = tool({
  description: "Tool to delete a file from an organization release. Use when you need to remove a specific file associated with a release version in an organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    fileId: z.string().describe("The ID of the file to delete."),
    version: z.string().describe("The version identifier of the release."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization the release belongs to."),
  }),
  execute: async ({ sentryToken, fileId, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/organizations/${organizationIdOrSlug}/releases/${version}/files/${fileId}/`, { query: {  } });
  },
});

export const sentryDeleteReleaseFileById = tool({
  description: "Permanently deletes a specific build artifact (e.g., source map, application bundle) associated with a project release.",
  inputSchema: z.object({
    sentryToken: tokenField,
    fileId: z.string().describe("The numeric ID of the specific file to be deleted from the release. This ID is returned when a file is uploaded or can be retrieved by listing release files."),
    version: z.string().describe("The version identifier of the release from which the file will be deleted. This can be a semantic version, a commit hash, or any unique string identifying the release."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry project to which the release belongs."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization to which the release belongs."),
  }),
  execute: async ({ sentryToken, fileId, version, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "DELETE", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/releases/${version}/files/${fileId}/`, { query: {  } });
  },
});

export const sentryFetchProjectReleaseFiles = tool({
  description: "Retrieves artifact files (e.g., source maps, debug information files) for a specific release version in a Sentry project; requires existing organization, project, and release version with associated files.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The version identifier of the release (e.g., '1.0.0', 'my-app@2.3.12')."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the organization."),
  }),
  execute: async ({ sentryToken, version, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/releases/${version}/files/`, { query: {  } });
  },
});

export const sentryGetOrganizationReleaseVersion = tool({
  description: "Retrieves detailed information, including optional health data and statistics, for a specific release version within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    sort: z.enum(["crash_free_sessions", "crash_free_users", "date", "sessions", "users"]).optional().describe("Enumeration of fields for sorting release-related data."),
    query: z.string().optional().describe("Filter data for this release using Sentry's search syntax (e.g., to find specific events). See Sentry documentation for syntax. Example from Sentry: `'''(transaction:foo AND release:abc) OR (transaction:[bar,baz] AND rel"),
    health: z.boolean().optional().describe("Include health data (e.g., crash rates, session statistics) with release details."),
    status: z.enum(["archived", "open"]).optional().describe("Enumeration of release statuses."),
    version: z.string().describe("The unique version identifier of the release. This can be a semantic version (e.g., '1.2.3'), a commit hash, or any string used to identify the release (e.g., 'backend@1.0.0-alpha')."),
    projectId: z.string().optional().describe("ID of a specific project to scope release details; if omitted, details may cover multiple projects."),
    adoptionStages: z.boolean().optional().describe("Include information about the release's adoption stages."),
    healthStatsPeriod: z.enum(["14d", "1d", "1h", "24h", "2d", "30d", "48h", "7d", "90d"]).optional().describe("Enumeration of time periods for release health statistics."),
    summaryStatsPeriod: z.enum(["14d", "1d", "1h", "24h", "2d", "30d", "48h", "7d", "90d"]).optional().describe("Enumeration of time periods for release summary statistics."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, sort, query, health, status, version, projectId, adoptionStages, healthStatsPeriod, summaryStatsPeriod, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/${version}/`, { query: { sort: sort, query: query, health: health, status: status, project_id: projectId, adoptionStages: adoptionStages, healthStatsPeriod: healthStatsPeriod, summaryStatsPeriod: summaryStatsPeriod } });
  },
});

export const sentryListOrganizationReleases = tool({
  description: "Retrieves a list of releases for an existing Sentry organization, optionally filtering by a query string that matches the start of the release version.",
  inputSchema: z.object({
    sentryToken: tokenField,
    query: z.string().optional().describe("An optional string to filter releases. The filter performs a 'starts with' match on the release version. For example, '1.0' would match '1.0.1' and '1.0-beta', while 'backend-' would match 'backend-v2.1'. If omitted, all"),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization whose releases are to be listed."),
  }),
  execute: async ({ sentryToken, query, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/`, { query: { query: query } });
  },
});

export const sentryListOrganizationRepositories = tool({
  description: "Retrieves a list of version control repositories for a specific Sentry organization, which must exist and is identified by its ID or slug.",
  inputSchema: z.object({
    sentryToken: tokenField,
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization for which to list repositories. The slug is the URL-friendly name of the organization."),
  }),
  execute: async ({ sentryToken, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/repos/`, { query: {  } });
  },
});

export const sentryModifyReleaseFileAttributes = tool({
  description: "Updates attributes (e.g., name, distribution) of a specific file within an existing release, identified by organization, version, and file ID.",
  inputSchema: z.object({
    sentryToken: tokenField,
    dist: z.string().optional().describe("The new distribution name for the file (e.g., build number, platform identifier). This is optional and can be used to differentiate files with the same name across different builds or platforms."),
    name: z.string().optional().describe("The new name (full path) for the file. While technically optional, the Sentry API requires this field to be provided when making updates (you can provide the current name if you don't want to change it)."),
    fileId: z.string().describe("ID of the file to modify, typically a hash or unique identifier."),
    version: z.string().describe("Version identifier of the release."),
    organizationIdOrSlug: z.string().describe("ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, dist, name, fileId, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/releases/${version}/files/${fileId}/`, { body: { dist: dist, name: name } });
  },
});

export const sentryRetrieveCommitFilesForRelease = tool({
  description: "Retrieves files changed in commits for a specified Sentry release; the release must exist and have linked commits.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The version identifier of the release. This can be a semantic version string (e.g., '1.0.0', 'my-project@2.3.4-beta'), a descriptive name (e.g., 'backend-deploy-2024-05-20'), or a commit SHA if used as the version string"),
    organizationIdOrSlug: z.string().describe("The slug (e.g., `my-org-slug`) or numerical ID (e.g., `1234567`) of the Sentry organization to which the release belongs."),
  }),
  execute: async ({ sentryToken, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/${version}/commitfiles/`, { query: {  } });
  },
});

export const sentryRetrieveCommitsForOrganizationRepo = tool({
  description: "Retrieves a list of commits for a given repository within a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    repoId: z.string().describe("The unique identifier of the repository."),
    organizationIdOrSlug: z.string().describe("The unique identifier or short name (slug) of the organization."),
  }),
  execute: async ({ sentryToken, repoId, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/repos/${repoId}/commits/`, { query: {  } });
  },
});

export const sentryRetrieveFilesForRelease = tool({
  description: "Retrieves artifact files for a specific release version in a Sentry organization; the organization and release must exist, and the response `data` field will contain the file information as a dictionary.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The specific version identifier of the release. This can be a commit hash (e.g., '4018a1c'), a semantic version (e.g., '1.0.0'), a custom release name (e.g., 'my-project@1.0.0'), or the literal string 'latest'."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable name (slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/${version}/files/`, { query: {  } });
  },
});

export const sentryRetrieveOrganizationReleaseCommits = tool({
  description: "Retrieves a list of commits for a given release version in an existing Sentry organization, if the release exists.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The version identifier of the release. This can be a version number, package name with version, or a commit hash."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the release belongs."),
  }),
  execute: async ({ sentryToken, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/${version}/commits/`, { query: {  } });
  },
});

export const sentryRetrievePaginatedRepositoryTokens = tool({
  description: "Retrieves a paginated list of repository tokens for a given owner. Use when you need to access repository tokens with pagination support.",
  inputSchema: z.object({
    sentryToken: tokenField,
    limit: z.number().int().optional().describe("The number of results to return per page. Defaults to 20 if not specified."),
    owner: z.string().describe("The owner of the repository (e.g., GitHub organization or user)."),
    cursor: z.string().optional().describe("Cursor marking the position in the result set for pagination navigation. Obtain this from pageInfo in the previous response."),
    sortBy: z.string().optional().describe("Field to sort results by. Supports 'NAME' (alphabetical) or 'COMMIT_DATE' (most recent first, default). Defaults to 'COMMIT_DATE' in descending order."),
    navigation: z.string().optional().describe("Controls pagination direction. Use 'next' to fetch the next page or 'prev' to fetch the previous page. Defaults to 'next'."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization that the resource belongs to."),
  }),
  execute: async ({ sentryToken, limit, owner, cursor, sortBy, navigation, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/repos/`, { query: { limit: limit, owner: owner, cursor: cursor, sortBy: sortBy, navigation: navigation } });
  },
});

export const sentryRetrieveProjectReleaseFileDetails = tool({
  description: "Retrieves metadata (default) or raw content (if `download` is true) for a specific file within a Sentry project's release version.",
  inputSchema: z.object({
    sentryToken: tokenField,
    fileId: z.string().describe("The unique identifier of the file associated with the release (e.g., '~/app.js.map', 'dist/bundle.js')."),
    version: z.string().describe("The version identifier of the release (e.g., '1.0.0', 'my-app@2.3.1-beta')."),
    download: z.boolean().optional().describe("If true, returns raw file content; otherwise, returns file metadata (JSON object)."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, fileId, version, download, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/releases/${version}/files/${fileId}/`, { query: { download: download } });
  },
});

export const sentryRetrieveReleaseCommits = tool({
  description: "Retrieves a list of commits associated with a specific release version within a Sentry project.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The version identifier of the release. This can be a commit SHA, a semantic version string, or any unique string identifying the release (e.g., 'my-app@1.0.0', 'cf7f4a337311e395e5099035f904289140b37025')."),
    projectIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry project to which the release belongs."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization to which the release belongs."),
  }),
  execute: async ({ sentryToken, version, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/releases/${version}/commits/`, { query: {  } });
  },
});

export const sentryRetrieveReleaseDeployments = tool({
  description: "Retrieves a list of all deployment records for a specific release version in an organization, detailing each deployment's environment and timestamps.",
  inputSchema: z.object({
    sentryToken: tokenField,
    version: z.string().describe("The version identifier of the release. This can be a semantic version string (e.g., '1.0.0'), a project-qualified version (e.g., 'my-project-name@1.0.0'), or a full commit SHA."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID or slug) of the Sentry organization."),
  }),
  execute: async ({ sentryToken, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/${version}/deploys/`, { query: {  } });
  },
});

export const sentryRetrieveReleaseFileById = tool({
  description: "Retrieves a specific file's content or its metadata from a Sentry release, using the `download` parameter to choose between raw content or JSON metadata.",
  inputSchema: z.object({
    sentryToken: tokenField,
    fileId: z.string().describe("The unique numeric identifier of the file within the specified release. This ID is returned in the 'id' field when listing release files via the 'List an Organization's Release Files' endpoint."),
    version: z.string().describe("The version identifier of the release, such as '1.0.0', 'backend@2.3.1-beta', or a commit SHA."),
    download: z.boolean().optional().describe("Set to `true` to receive raw file content. If `false` or omitted, results in a JSON object with file metadata being returned."),
    organizationIdOrSlug: z.string().describe("The unique identifier (ID) or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, fileId, version, download, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "GET", `/organizations/${organizationIdOrSlug}/releases/${version}/files/${fileId}/`, { query: { download: download } });
  },
});

export const sentryUpdateProjectReleaseFileDetails = tool({
  description: "Updates the name (path) or distribution identifier of a specific file within an existing project release in Sentry.",
  inputSchema: z.object({
    sentryToken: tokenField,
    dist: z.string().optional().describe("The new distribution identifier for the file. Used to distinguish different builds of the same release version (e.g., build numbers or commit SHAs). WARNING: The Sentry API may not reliably update this field via the PUT "),
    name: z.string().optional().describe("The new name or full path for the file. Use absolute paths (e.g., '~/dist/main.js') or URLs (e.g., 'https://example.com/app.js'). At least one of 'name' or 'dist' must be provided."),
    fileId: z.string().describe("The unique identifier of the release file to be updated."),
    version: z.string().describe("The version identifier of the release, e.g., '1.0.0' or 'my-app@2.3.1'."),
    projectIdOrSlug: z.string().describe("The ID or slug of the project associated with the release file."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization to which the project belongs."),
  }),
  execute: async ({ sentryToken, dist, name, fileId, version, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/releases/${version}/files/${fileId}/`, { body: { dist: dist, name: name } });
  },
});

export const sentryUpdateReleaseDetailsForOrganization = tool({
  description: "Updates an existing Sentry release's details for an organization, including its reference, URL, release date, associated commits, or repository references.",
  inputSchema: z.object({
    sentryToken: tokenField,
    ref: z.string().optional().describe("Commit reference (e.g., a branch name, tag, or commit SHA) to associate with this release; useful if a tagged version has been provided."),
    url: z.string().optional().describe("A URL that points to the release. For instance, this can be the path to an online interface to the source code, such as a GitHub URL, or a link to a release announcement."),
    refs: z.array(z.any()).optional().describe("Indicates or updates the start and end commits for each repository in a release. Head commits require ``repository`` and ``commit`` (HEAD SHA), and can optionally include ``previousCommit`` (SHA of previous release's HEA"),
    commits: z.array(z.any()).optional().describe("List of commit data to associate or update for this release; can add new commits or modify existing ones if Sentry's commit tracking needs adjustment."),
    version: z.string().describe("The version identifier of the release to be updated (e.g., '1.0.0', 'my-project@2.3.12'). This identifier must be unique within the organization."),
    dateReleased: z.string().optional().describe("ISO 8601 timestamp indicating when the release went live (e.g., '2023-10-26T10:00:00Z'). If not provided, Sentry uses the current time, but an existing dateReleased will not be overwritten unless a new value is provided."),
    organizationIdOrSlug: z.string().describe("The unique ID or human-readable slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, ref, url, refs, commits, version, dateReleased, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryRequest(sentryToken, "PUT", `/organizations/${organizationIdOrSlug}/releases/${version}/`, { body: { ref: ref, url: url, refs: refs, commits: commits, dateReleased: dateReleased } });
  },
});

export const sentryUploadFileToProjectRelease = tool({
  description: "Uploads a file to a Sentry project release, for an existing organization, project, and version; uses `multipart/form-data` and the region-specific Sentry domain.",
  inputSchema: z.object({
    sentryToken: tokenField,
    dist: z.string().optional().describe("Optional: Distribution identifier to distinguish multiple files of the same name within a single release (e.g., for different build variants or AB tests)."),
    file: z.record(z.any()).optional().describe("The file to be uploaded."),
    name: z.string().optional().describe("Optional: Name for the file, ideally an absolute path or URI (e.g., for JavaScript source maps, the full web URI to the original '.js' file)."),
    header: z.string().optional().describe("Optional: Header for the file, formatted as 'Header-Key: Header-Value' (e.g., 'X-SourceMap:/url/to/sourcemap.map' for SourceMap debug images)."),
    version: z.string().describe("The version identifier of the release to associate the file with."),
    projectIdOrSlug: z.string().describe("The ID or slug of the Sentry project."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the Sentry organization."),
  }),
  execute: async ({ sentryToken, dist, file, name, header, version, projectIdOrSlug, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryUpload(sentryToken, `/projects/${organizationIdOrSlug}/${projectIdOrSlug}/releases/${version}/files/`, { dist: dist, file: file, name: name, header: header });
  },
});

export const sentryUploadReleaseFileToOrganization = tool({
  description: "Uploads a new file, such as a source map or debug information, to an existing release version in a Sentry organization.",
  inputSchema: z.object({
    sentryToken: tokenField,
    dist: z.string().optional().describe("An optional distribution identifier for the file. This helps differentiate between multiple files with the same name within a single release, often used for build numbers or variant identifiers (e.g., Android versionCode"),
    file: z.record(z.any()).optional().describe("The file to be uploaded for the release."),
    name: z.string().optional().describe("The optional name of the file, which should reflect the absolute path or URI where this file will be referenced. For example, for JavaScript source maps, this could be the full web URI."),
    header: z.string().optional().describe("An optional header string or list of strings to be associated with the artifact. This can be used to specify headers like 'Content-Type' or custom metadata. For example: 'Content-Type:application/json' or ['X-SourceMap: "),
    version: z.string().describe("The version identifier of the release."),
    organizationIdOrSlug: z.string().describe("The ID or slug of the organization."),
  }),
  execute: async ({ sentryToken, dist, file, name, header, version, organizationIdOrSlug }) => {
    if (!sentryToken) return { error: "Sentry token is required. Connect Sentry first." };
    return sentryUpload(sentryToken, `/organizations/${organizationIdOrSlug}/releases/${version}/files/`, { dist: dist, file: file, name: name, header: header });
  },
});
