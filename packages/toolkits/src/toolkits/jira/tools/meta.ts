// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jira } from './client.js';
import { ATLASSIAN_API, getCloudId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
async function fetchAvatar(jiraToken, jiraCloudId, avatarPath, params, fallbackName) {
    const cid = await getCloudId(jiraToken, jiraCloudId);
    if (!cid) return { error: 'Could not determine your Jira Cloud site. Reconnect Jira and try again.' };
    const qs = new URLSearchParams();
    if (params?.size) qs.append('size', params.size);
    if (params?.format) qs.append('format', params.format);
    const url = `${ATLASSIAN_API}/ex/jira/${cid}/rest/api/3${avatarPath}${qs.toString() ? `?${qs}` : ''}`;
    try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${jiraToken}` } });
        if (!response.ok) return { error: `Jira API request failed with status ${response.status}` };
        const buf = await response.arrayBuffer();
        return { avatarUrl: url, contentType: response.headers.get('content-type'), contentLength: buf.byteLength, fileName: fallbackName };
    } catch (error) {
        return { error: 'Error fetching avatar from Jira', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export const jiraCheckPermissions = tool({
    description: "Check user permissions for global and project-level operations in Jira. Use this action to verify whether a user has specific permissions at the system level or within projects. Useful for authorization checks before performing operations, or for auditing user access rights.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        accountId: z.string().optional().describe("The account ID of the user to check permissions for. If not provided, checks permissions for the currently authenticated user. Account ID format: '712020:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' or '5b10a2844c20165700ede21g'."),
        globalPermissions: z.array(z.string()).optional().describe("List of global (system-level) permission keys to check (e.g., 'ADMINISTER', 'SYSTEM_ADMIN', 'CREATE_SHARED_OBJECTS', 'MANAGE_GROUP_FILTER_SUBSCRIPTIONS'). These permissions apply to the entire Jira instance."),
        projectPermissions: z.array(z.record(z.any())).optional().describe("List of project-level permission checks. Each item specifies permissions to validate along with optional project and issue IDs for context."),
    }),
    execute: async ({ jiraToken, jiraCloudId, accountId, globalPermissions, projectPermissions }) => {
        const queryParams = undefined;
        const body = { accountId: accountId, globalPermissions: globalPermissions, projectPermissions: projectPermissions };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/permissions/check`, method: 'POST', query: queryParams, body });
    },
});

export const jiraGetAllStatuses = tool({
    description: "This action retrieves issue statuses that are associated with workflows in Jira.                            It provides detailed information about each status including name, description, and category.                            Note: This may not include statuses from team-managed (Next-Gen) projects or unused statuses.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/status`, method: 'GET', query: queryParams });
    },
});

export const jiraGetAttachmentMeta = tool({
    description: "Tool to retrieve Jira attachment settings including upload limits and enabled status. Use when you need to check if attachments are enabled or determine the maximum file size allowed.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/attachment/meta`, method: 'GET', query: queryParams });
    },
});

export const jiraGetCreateMetadataIssueTypeFields = tool({
    description: "Tool to retrieve field metadata for a specific issue type in a project. Use this to discover required fields, allowed values, and field configurations before creating issues of a specific type.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        startAt: z.number().int().optional().describe("The index of the first item to return in a page of results (page offset). Default is 0."),
        maxResults: z.number().int().min(1).max(200).optional().describe("The maximum number of items to return per page. Default is 50. Maximum allowed value is 200."),
        issueTypeId: z.string().describe("The issue type ID. This is the numeric identifier for the issue type (e.g., '10001' for Task, '10002' for Story). Use JIRA_GET_ISSUE_TYPES to discover available issue type IDs for a project."),
        projectIdOrKey: z.string().describe("The ID or key of the project. For example, '10000' or 'KAN'. Use the project key (e.g., 'KAN') for easier identification, or the numeric project ID."),
    }),
    execute: async ({ jiraToken, jiraCloudId, startAt, maxResults, issueTypeId, projectIdOrKey }) => {
        const queryParams = { startAt: startAt, maxResults: maxResults };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/createmeta/${encodeURIComponent(projectIdOrKey)}/issuetypes/${encodeURIComponent(issueTypeId)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetDashboards = tool({
    description: "Tool to list and search Jira dashboards visible to the current user. Use when you need to discover available dashboards, filter by ownership or favorites, or retrieve dashboard details including permissions and popularity.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        filter: z.enum(["my", "favourite"]).optional().describe("Filter options for dashboard search."),
        startAt: z.number().int().min(0).optional().describe("The index of the first item to return in a page of results (page offset). Defaults to 0 if not specified."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page. Defaults to 20 if not specified."),
    }),
    execute: async ({ jiraToken, jiraCloudId, filter, startAt, maxResults }) => {
        const queryParams = { filter: filter, startAt: startAt, maxResults: maxResults };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/dashboard`, method: 'GET', query: queryParams });
    },
});

export const jiraGetFavoriteFilters = tool({
    description: "Tool to retrieve favorite filters for the current user. Use when you need to discover which saved filters the user has marked as favorites.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information about filter in the response. This parameter accepts a comma-separated list. Expand options include: 'sharedUsers' (returns users the filter is shared with, limited to 1000; append [start-index:end-index] for pagination, e.g., 'sharedUsers[1001:2000]'), 'subscriptions' (returns users subscribed to the filter, limited to 1000; append [start-index:end-index] for pagination, e.g., 'subscriptions[1001:2000]')."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand }) => {
        const queryParams = { expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/filter/favourite`, method: 'GET', query: queryParams });
    },
});

export const jiraGetFields = tool({
    description: "Retrieves metadata for Jira issue fields so you can identify custom field IDs before editing an issue.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issueType: z.string().optional().describe("Filter fields by issue type. Can be issue type ID (e.g., '10001') or name (e.g., 'Bug', 'Task', 'Story'). Requires 'project_id' to be specified."),
        projectId: z.string().optional().describe("Filter fields by project ID (e.g., '10000')."),
        customOnly: z.boolean().optional().describe("If true, returns only custom fields; otherwise returns all fields."),
    }),
    execute: async ({ jiraToken, jiraCloudId, issueType, projectId, customOnly }) => {
        const all = await jira(jiraToken, { cloudId: jiraCloudId, path: "/field" });
        if (all?.error) return all;
        const list = Array.isArray(all) ? all : [];
        const fields = customOnly ? list.filter((f) => f.custom === true) : list;
        return { fields };
    },
});

export const jiraGetFieldsPaginated = tool({
    description: "Tool to retrieve Jira fields in pages. Use when you need to filter or page through custom and system fields.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        id: z.array(z.string()).optional().describe("Filter fields by their IDs. Provide a list of field ID strings."),
        type: z.array(z.string()).optional().describe("Filter fields by type. One or more of 'custom' or 'system'."),
        query: z.string().optional().describe("Case-insensitive partial match string for field names or descriptions."),
        expand: z.array(z.string()).optional().describe("Additional information to include in the response; comma-separated options."),
        orderBy: z.enum(["contextsCount", "-contextsCount", "+contextsCount", "lastUsed", "-lastUsed", "+lastUsed", "name", "-name", "+name", "screensCount", "-screensCount", "+screensCount", "projectsCount", "-projectsCount", "+projectsCount"]).optional().describe("Order the results by the selected field. Prefix with '-' or '+' for descending/ascending."),
        startAt: z.number().int().min(0).optional().describe("The index of the first item to return in a page of results. Default is 0."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page. Default is 50."),
        projectIds: z.array(z.number().int()).optional().describe("Filter fields by these project IDs. Inaccessible projects are excluded."),
    }),
    execute: async ({ jiraToken, jiraCloudId, id, type, query, expand, orderBy, startAt, maxResults, projectIds }) => {
        const queryParams = { query: query, type: type, id: id, expand: expand, orderBy: orderBy, startAt: startAt, maxResults: maxResults, projectIds: projectIds };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/field/search`, method: 'GET', query: queryParams });
    },
});

export const jiraGetFilter = tool({
    description: "This action retrieves a specific Jira saved filter using its ID. It returns the filter's JQL query, owner, sharing permissions, and other metadata. This enables a workflow pattern: (1) list/search filters, (2) get filter details including JQL, (3) use that JQL with JIRA_SEARCH_* actions to retrieve matching issues.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        id: z.string().describe("The ID of the filter to retrieve (numeric string, e.g., '10000')."),
        expand: z.string().optional().describe("Use expand to include additional information about the filter. Available expansions include 'sharedUsers' (users the filter is shared with), 'subscriptions' (filter subscriptions). Provide as a comma-separated list (e.g., 'sharedUsers,subscriptions')."),
        overrideSharePermissions: z.boolean().optional().describe("Set to true to override share permissions and retrieve filters not shared with the user. Requires administrative privileges. Defaults to false."),
    }),
    execute: async ({ jiraToken, jiraCloudId, id, expand, overrideSharePermissions }) => {
        const queryParams = { expand: expand, overrideSharePermissions: overrideSharePermissions };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/filter/${encodeURIComponent(id)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetInfo = tool({
    description: "Retrieves runtime information for the Jira Service Management instance. Use when you need to check the version, build date, or license status.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'servicedeskapi', path: `/info`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueCreateMetadata = tool({
    description: "DEPRECATED: Use JIRA_GET_CREATE_METADATA_ISSUE_TYPE_FIELDS instead. This action wraps the deprecated query-based GET /issue/createmeta endpoint. Tool to retrieve issue creation metadata for Jira projects (available projects, issue types, and required fields).",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information about issue metadata in the response. This parameter accepts 'projects.issuetypes.fields', which returns information about the fields in the issue creation screen for each issue type. Fields hidden from the screen are not returned. Use the information to populate the 'fields' and 'update' fields in Create issue and Create issues endpoints."),
        projectIds: z.array(z.string()).optional().describe("List of project IDs to filter the results. This parameter accepts a comma-separated list. Multiple project IDs can also be provided using an ampersand-separated list. For example, 'projectIds=10000,10001&projectIds=10020,10021'. This parameter may be provided with 'projectKeys'."),
        projectKeys: z.array(z.string()).optional().describe("List of project keys to filter the results. This parameter accepts a comma-separated list. Multiple project keys can also be provided using an ampersand-separated list. For example, 'projectKeys=proj1,proj2&projectKeys=proj3'. This parameter may be provided with 'projectIds'."),
        issuetypeIds: z.array(z.string()).optional().describe("List of issue type IDs to filter the results. This parameter accepts a comma-separated list. Multiple issue type IDs can also be provided using an ampersand-separated list. For example, 'issuetypeIds=10000,10001&issuetypeIds=10020,10021'. This parameter may be provided with 'issuetypeNames'."),
        issuetypeNames: z.array(z.string()).optional().describe("List of issue type names to filter the results. This parameter accepts a comma-separated list. Multiple issue type names can also be provided using an ampersand-separated list. For example, 'issuetypeNames=name1,name2&issuetypeNames=name3'. This parameter may be provided with 'issuetypeIds'."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, projectIds, projectKeys, issuetypeIds, issuetypeNames }) => {
        const queryParams = { projectIds: projectIds, projectKeys: projectKeys, issuetypeIds: issuetypeIds, issuetypeNames: issuetypeNames, expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issue/createmeta`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueResolutions = tool({
    description: "This action fetches all issue resolutions available in Jira. It retrieves resolution types such as 'Done' or 'Fixed' that can be applied to issues.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/resolution`, method: 'GET', query: queryParams });
    },
});

export const jiraGetIssueTypes = tool({
    description: "Retrieves a list of all available Jira issue types for the user. This action allows access to Jira's issue type details that can be utilized within the application.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issuetype`, method: 'GET', query: queryParams });
    },
});

export const jiraGetMyPermissions = tool({
    description: "Tool to retrieve the user's permissions in Jira. Use when checking what actions the authenticated user can perform in a specific context (project, issue, or comment).",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issueId: z.string().optional().describe("The ID of the issue."),
        issueKey: z.string().optional().describe("The key of the issue. Ignored if 'issueId' is provided."),
        commentId: z.string().optional().describe("The ID of the comment."),
        projectId: z.string().optional().describe("The ID of the project."),
        projectKey: z.string().optional().describe("The key of the project. Ignored if 'projectId' is provided."),
        permissions: z.string().describe("A comma-separated list of permission keys to check. Required: the API returns 400 if omitted. To get the list of available permissions, use the Get all permissions action."),
        projectUuid: z.string().optional().describe("The UUID of the project."),
        projectConfigurationUuid: z.string().optional().describe("The UUID of the project configuration."),
    }),
    execute: async ({ jiraToken, jiraCloudId, issueId, issueKey, commentId, projectId, projectKey, permissions, projectUuid, projectConfigurationUuid }) => {
        const queryParams = { permissions: permissions, projectKey: projectKey, projectId: projectId, issueKey: issueKey, issueId: issueId, projectUuid: projectUuid, projectConfigurationUuid: projectConfigurationUuid, commentId: commentId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/mypermissions`, method: 'GET', query: queryParams });
    },
});

export const jiraGetPermissions = tool({
    description: "This action retrieves all available permissions in Jira, including both project-level and global permissions. It provides details about each permission such as its ID, key, name, type, and description.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/permissions`, method: 'GET', query: queryParams });
    },
});

export const jiraGetPermittedProjects = tool({
    description: "This action retrieves a list of projects where the current user has all the specified permissions. It's useful for determining which projects a user can perform certain actions in.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        permissions: z.array(z.string()).min(1).describe("A list of permission keys to filter projects. Only projects where the user has ALL specified permissions will be returned. Common permission keys: BROWSE_PROJECTS, CREATE_ISSUES, EDIT_ISSUES, DELETE_ISSUES, ADMINISTER_PROJECTS, ASSIGN_ISSUES, CLOSE_ISSUES, TRANSITION_ISSUES. See Jira's project permissions documentation for the full list of valid keys."),
    }),
    execute: async ({ jiraToken, jiraCloudId, permissions }) => {
        const queryParams = undefined;
        const body = { permissions: permissions };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/permissions/project`, method: 'POST', query: queryParams, body });
    },
});

export const jiraGetServerInfo = tool({
    description: "Retrieves detailed information about the Jira instance, including version, build number, deployment type, server time, and URLs.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/serverInfo`, method: 'GET', query: queryParams });
    },
});

export const jiraGetServiceDeskRequestTypeFields = tool({
    description: "Retrieves the field metadata for a specific Jira Service Management request type, including required fields and valid values needed to submit a request.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        requestTypeId: z.string().describe("The ID of the request type (e.g., '25')."),
        serviceDeskId: z.string().describe("The ID or project key of the service desk (e.g., '10' or 'SD')."),
    }),
    execute: async ({ jiraToken, jiraCloudId, requestTypeId, serviceDeskId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'servicedeskapi', path: `/servicedesk/${encodeURIComponent(serviceDeskId)}/requesttype/${encodeURIComponent(requestTypeId)}/field`, method: 'GET', query: queryParams });
    },
});

export const jiraGetSystemAvatars = tool({
    description: "Tool to retrieve all system avatars for a specific type (issuetype, project, user, or priority). Use when you need to get a list of available default avatars that can be assigned to Jira entities.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        type: z.enum(["issuetype", "project", "user", "priority"]).describe("The avatar type to retrieve system avatars for. Options: issuetype, project, user, priority."),
    }),
    execute: async ({ jiraToken, jiraCloudId, type }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/avatar/${encodeURIComponent(type)}/system`, method: 'GET', query: queryParams });
    },
});

export const jiraGetUniversalAvatarTypeOwner = tool({
    description: "Tool to retrieve all avatars (system and custom) for a specific type and entity in Jira. Use when you need to view available avatar options for projects, issue types, or priorities.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        type: z.enum(["project", "issuetype", "priority"]).describe("The avatar type. Must be one of: project, issuetype, or priority."),
        entityId: z.string().describe("The ID of the item the avatar is associated with (e.g., project ID, issue type ID, or priority ID)."),
    }),
    execute: async ({ jiraToken, jiraCloudId, type, entityId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/universal_avatar/type/${encodeURIComponent(type)}/owner/${encodeURIComponent(entityId)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetUniversalAvatarViewType = tool({
    description: "Tool to retrieve the default avatar image for a specific type (project, issuetype, or priority) from Jira. Use when you need to download the default avatar for a type.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        size: z.enum(["xsmall", "small", "medium", "large", "xlarge"]).optional().describe("The size of the avatar image."),
        type: z.enum(["issuetype", "project", "priority"]).describe("The icon type of the avatar (issuetype, project, or priority)."),
        format: z.enum(["png", "svg"]).optional().describe("The format of the avatar image."),
    }),
    execute: async ({ jiraToken, jiraCloudId, size, type, format }) => {
        return fetchAvatar(jiraToken, jiraCloudId, `/universal_avatar/view/type/${type}`, { size, format }, `avatar-${type}`);
    },
});

export const jiraGetViewTypeAvatar = tool({
    description: "Tool to retrieve a specific avatar image by type and ID from Jira. Use when you need to download avatar images for projects, issue types, or priorities.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        id: z.number().int().min(1).describe("The ID of the avatar."),
        size: z.enum(["xsmall", "small", "medium", "large", "xlarge"]).optional().describe("The size of the avatar image."),
        type: z.enum(["issuetype", "project", "priority"]).describe("The icon type of the avatar (issuetype, project, or priority)."),
        format: z.enum(["png", "svg"]).optional().describe("The format of the avatar image."),
    }),
    execute: async ({ jiraToken, jiraCloudId, id, size, type, format }) => {
        return fetchAvatar(jiraToken, jiraCloudId, `/avatar/${type}/${id}`, { size, format }, `avatar-${type}-${id}`);
    },
});

export const jiraListFilters = tool({
    description: "Tool to search and list Jira saved filters (saved searches) visible to the current user. Use when you need to discover existing filters, find filters by name or owner, or get filter details including JQL queries and sharing permissions.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        id: z.array(z.number().int()).optional().describe("Filter results by filter IDs. Multiple IDs can be provided."),
        owner: z.string().optional().describe("Filter results by owner username. This parameter cannot be used with the accountId parameter."),
        expand: z.string().optional().describe("Comma-separated list of properties to expand in the response. Valid values: description, favourite, favouritedCount, jql, owner, searchUrl, sharePermissions, subscriptions, viewUrl."),
        groupId: z.string().optional().describe("Filter results by group ID. Filters are returned if they are shared with the specified group."),
        orderBy: z.string().optional().describe("Order the results by a field. Valid values: description, favourite_count, is_favourite, id, name, owner. Add '-' prefix for descending order."),
        startAt: z.number().int().min(0).optional().describe("The 0-based index of the first item to return in the page of results. Used for pagination."),
        accountId: z.string().optional().describe("Filter results by owner account ID."),
        groupname: z.string().optional().describe("Filter results by group name. Filters are returned if they are shared with the specified group."),
        projectId: z.number().int().optional().describe("Filter results by project ID. Filters are returned if they are shared with the specified project."),
        filterName: z.string().optional().describe("Filter results by filter name. Partial matches are supported."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page. Maximum value is typically 50."),
    }),
    execute: async ({ jiraToken, jiraCloudId, id, owner, expand, groupId, orderBy, startAt, accountId, groupname, projectId, filterName, maxResults }) => {
        const queryParams = { filterName: filterName, accountId: accountId, owner: owner, groupname: groupname, groupId: groupId, projectId: projectId, id: id, orderBy: orderBy, startAt: startAt, maxResults: maxResults, expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/filter/search`, method: 'GET', query: queryParams });
    },
});

export const jiraSearchDashboards = tool({
    description: "Tool to search for Jira dashboards with filtering, sorting, and pagination support. Use when you need to find dashboards by name, owner, sharing permissions, or status. Supports filtering by owner account ID, group, project, and dashboard name.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        owner: z.string().optional().describe("User name used to return dashboards with the matching owner.name. This parameter is deprecated due to privacy changes - use accountId instead. Cannot be used with accountId parameter."),
        expand: z.string().optional().describe("Comma-separated list of properties to expand. Options: description, owner, viewUrl, favourite, favouritedCount, sharePermissions, editPermissions, isWritable."),
        status: z.enum(["active", "archived", "deleted"]).optional().describe("Enum for dashboard status filter."),
        groupId: z.string().optional().describe("Group ID used to return dashboards that are shared with a group matching sharePermissions.group.groupId. Cannot be used with groupname parameter."),
        orderBy: z.enum(["description", "-description", "+description", "id", "-id", "+id", "name", "-name", "+name", "owner", "-owner", "+owner"]).optional().describe("Enum for dashboard ordering options."),
        startAt: z.number().int().min(0).optional().describe("The index of the first item to return in a page of results (page offset)."),
        accountId: z.string().optional().describe("User account ID used to return dashboards with the matching owner.accountId. This parameter cannot be used with the owner parameter."),
        groupname: z.string().optional().describe("Group name used to return dashboards that are shared with a group matching sharePermissions.group.name. As a group's name can change, use of groupId is recommended. Cannot be used with groupId parameter."),
        projectId: z.number().int().optional().describe("Project ID used to return dashboards that are shared with a project matching sharePermissions.project.id."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page."),
        dashboardName: z.string().optional().describe("String used to perform a case-insensitive partial match with dashboard name."),
    }),
    execute: async ({ jiraToken, jiraCloudId, owner, expand, status, groupId, orderBy, startAt, accountId, groupname, projectId, maxResults, dashboardName }) => {
        const queryParams = { dashboardName: dashboardName, accountId: accountId, owner: owner, groupname: groupname, groupId: groupId, projectId: projectId, orderBy: orderBy, startAt: startAt, maxResults: maxResults, expand: expand, status: status };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/dashboard/search`, method: 'GET', query: queryParams });
    },
});
