// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jira } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const jiraAddUsersToProjectRole = tool({
    description: "This action adds one or more users (and optionally groups) to a specific project role in Jira. Users are identified by their Atlassian account IDs, and roles are identified by their role ID.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        roleId: z.number().int().describe("The ID of the project role to add users to. Use get_project_roles action to find available role IDs."),
        groupIds: z.array(z.string()).optional().describe("Optional list of group IDs to add to the project role. Mutually exclusive with group_names (Jira's ActorsMap rejects sending both)."),
        groupNames: z.array(z.string()).optional().describe("Optional list of group names to add to the project role. Mutually exclusive with group_ids (Jira's ActorsMap rejects sending both)."),
        userAccountIds: z.array(z.string()).optional().describe("List of Atlassian account IDs of users to add to the project role. Must be Atlassian account IDs (alphanumeric strings), not email addresses or display names; use JIRA_FIND_USERS to resolve account IDs first. Optional, but at least one of user_account_ids, group_names, or group_ids must be provided."),
        projectIdOrKey: z.string().describe("The project ID (numeric) or project key (e.g., 'PROJ') of the project."),
    }),
    execute: async ({ jiraToken, jiraCloudId, roleId, groupIds, groupNames, userAccountIds, projectIdOrKey }) => {
        const queryParams = undefined;
        const body = { user: userAccountIds, group: groupNames, groupId: groupIds };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/${encodeURIComponent(projectIdOrKey)}/role/${encodeURIComponent(roleId)}`, method: 'POST', query: queryParams, body });
    },
});

export const jiraCreateProject = tool({
    description: "This action creates a new Jira project with the necessary configurations. It requires information such as the project key, name, type, and template to successfully set up a project in Jira.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        key: z.string().max(10).describe("Unique key for the project. Must be unique across all Jira projects. Must be uppercase letters only, no spaces or special characters."),
        url: z.string().optional().describe("Optional URL for the project, like a Confluence space link or external website."),
        name: z.string().describe("Human-readable name for the project."),
        avatarId: z.number().int().optional().describe("Optional ID of an existing avatar for the project."),
        categoryId: z.number().int().optional().describe("Optional ID of an existing project category."),
        description: z.string().optional().describe("Optional detailed textual description of the project."),
        assigneeType: z.enum(["PROJECT_LEAD", "UNASSIGNED"]).optional().describe("Default assignee for new issues: 'PROJECT_LEAD' (assigns to project lead) or 'UNASSIGNED' (issues remain unassigned)."),
        leadAccountId: z.string().describe("Atlassian Account ID (not username or email) of the project lead. Must be a valid account ID from your Jira instance, typically in format like '712020:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'."),
        projectTypeKey: z.enum(["business", "software", "service_desk"]).describe("Type of project. Must match the template prefix: 'business' for jira-core-project-templates, 'software' for greenhopper templates, 'service_desk' for servicedesk templates."),
        permissionScheme: z.number().int().optional().describe("Optional ID of an existing permission scheme that is accessible in your Jira instance. The scheme ID must exist and you must have permission to use it. If invalid or inaccessible, project creation will fail."),
        notificationScheme: z.number().int().optional().describe("Optional ID of an existing notification scheme that is accessible in your Jira instance. The scheme ID must exist and you must have permission to use it. If invalid or inaccessible, project creation will fail."),
        projectTemplateKey: z.string().describe("Key of the project template. MUST be compatible with project_type_key. Valid combinations: For 'business': 'com.atlassian.jira-core-project-templates:jira-core-project-management', 'com.atlassian.jira-core-project-templates:jira-core-simplified-process-control'. For 'software': 'com.pyxis.greenhopper.jira:gh-simplified-agility-kanban', 'com.pyxis.greenhopper.jira:gh-simplified-agility-scrum', 'com.pyxis.greenhopper.jira:gh-simplified-scrum-classic'. For 'service_desk': 'com.atlassian.servicedesk:simplified-it-service-desk', 'com.atlassian.servicedesk:simplified-internal-service-desk'."),
        additionalProperties: z.record(z.any()).optional().describe("Additional properties to include in the project creation request. Use this for any extra fields supported by the Jira API that are not covered by the standard parameters. Provide as a dictionary with field names and their values (using camelCase for field names as expected by the Jira API). IMPORTANT: The scheme fields (fieldConfigurationScheme, workflowScheme, issueTypeScreenScheme, issueTypeScheme) cannot be used when projectTemplateKey is provided - they are mutually exclusive. If you include these fields alongside a project template, they will be automatically removed. Note: The Jira API may ignore unsupported fields."),
        issueSecurityScheme: z.number().int().optional().describe("Optional ID of an existing issue security scheme that is accessible in your Jira instance. The scheme ID must exist and you must have permission to use it. If invalid or inaccessible, project creation will fail."),
    }),
    execute: async ({ jiraToken, jiraCloudId, key, url, name, avatarId, categoryId, description, assigneeType, leadAccountId, projectTypeKey, permissionScheme, notificationScheme, projectTemplateKey, additionalProperties, issueSecurityScheme }) => {
        const queryParams = undefined;
        const body = { key: key, name: name, projectTypeKey: projectTypeKey, projectTemplateKey: projectTemplateKey, leadAccountId: leadAccountId, url: url, description: description, assigneeType: assigneeType, avatarId: avatarId, categoryId: categoryId, permissionScheme: permissionScheme, notificationScheme: notificationScheme, issueSecurityScheme: issueSecurityScheme };
        if (additionalProperties && typeof additionalProperties === "object") Object.assign(body, additionalProperties);
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project`, method: 'POST', query: queryParams, body });
    },
});

export const jiraCreateVersion = tool({
    description: "This action creates a new version within a specified Jira project, allowing users to manage project milestones effectively. It includes attributes such as name, description, and release dates that provide context to the version being created.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        name: z.string().describe("Name for the new version. It is recommended that version names be unique within a project."),
        archived: z.boolean().optional().describe("Indicates if the version is marked as archived."),
        released: z.boolean().optional().describe("Indicates if the version is marked as released."),
        projectId: z.number().int().describe("Numeric ID of the Jira project to which this version will be added. The project must exist."),
        startDate: z.string().optional().describe("Start date for work on the version (YYYY-MM-DD format)."),
        description: z.string().optional().describe("Textual description for the version, providing more context about its purpose or content."),
        releaseDate: z.string().optional().describe("Release date for the version (YYYY-MM-DD format). Relevant if the version is marked as released or has a planned release."),
        additionalProperties: z.record(z.any()).optional().describe("Additional properties to include in the version creation request. Use this for any extra fields supported by the Jira API that are not covered by the standard parameters. Provide as a dictionary with field names and their values. Note: Jira Cloud has strict schema validation and may reject unknown properties with a 400 error. This field is primarily useful for Jira Server/Data Center deployments or future API additions. Use with caution."),
    }),
    execute: async ({ jiraToken, jiraCloudId, name, archived, released, projectId, startDate, description, releaseDate, additionalProperties }) => {
        const queryParams = undefined;
        const body = { name: name, projectId: projectId, description: description, released: released, archived: archived, startDate: startDate, releaseDate: releaseDate };
        if (additionalProperties && typeof additionalProperties === "object") Object.assign(body, additionalProperties);
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/version`, method: 'POST', query: queryParams, body });
    },
});

export const jiraDeleteVersion = tool({
    description: "This action deletes a specified version in Jira.      It can also optionally move issues associated with the deleted version to another specified version.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        versionId: z.string().describe("The unique identifier of the version to be deleted."),
        moveFixIssuesTo: z.string().optional().describe("The ID of an alternative version to which issues with the deleted version as their fix version will be moved. If unspecified or null, these issues will remain unassigned from a fix version."),
        moveAffectedIssuesTo: z.string().optional().describe("The ID of an alternative version to which issues with the deleted version as their affected version will be moved. If unspecified or null, these issues will remain unassigned from an affected version."),
    }),
    execute: async ({ jiraToken, jiraCloudId, versionId, moveFixIssuesTo, moveAffectedIssuesTo }) => {
        const queryParams = { moveFixIssuesTo: moveFixIssuesTo, moveAffectedIssuesTo: moveAffectedIssuesTo };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/version/${encodeURIComponent(versionId)}`, method: 'DELETE', query: queryParams });
    },
});

export const jiraGetAllIssueTypeSchemes = tool({
    description: "This action retrieves a list of all issue type schemes from Jira. It allows for optional filtering based on specific IDs and supports pagination for large sets of data.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        id: z.array(z.number().int()).optional().describe("The list of issue type scheme IDs to filter results. Returns only schemes with these IDs."),
        startAt: z.number().int().optional().describe("The index of the first item to return in a page of results (page offset). Default is 0."),
        maxResults: z.number().int().optional().describe("The maximum number of items to return per page. Default is 50, maximum is 100."),
    }),
    execute: async ({ jiraToken, jiraCloudId, id, startAt, maxResults }) => {
        const queryParams = { startAt: startAt, maxResults: maxResults, id: id };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/issuetypescheme`, method: 'GET', query: queryParams });
    },
});

export const jiraGetAllProjects = tool({
    description: "Retrieves a list of all projects that the user has visibility over. This action allows filtering, sorting, and pagination of project results based on specified criteria.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        name: z.string().optional().describe("DEPRECATED: Use 'query' parameter instead. The project name (or part of it) to filter the results. This will be mapped to the 'query' parameter."),
        query: z.string().optional().describe("Filter the results using a query string. Projects with a name or key that contains the query string are returned. The search is case-insensitive. May return multiple partial matches — verify the correct project by exact name or key before using the result. Use the returned project ID or key to pass to tools like JIRA_GET_PROJECT that require a stable identifier."),
        action: z.enum(["view", "browse", "edit", "create"]).optional().describe("Action types for filtering projects by user permissions."),
        expand: z.string().optional().describe("A comma-separated list of entities to expand in the response for additional project details. Valid options include: 'description' (to include the project description), 'issueTypes' (to include all issue types associated with the project), 'lead' (to include information about the project lead), and 'projectKeys' (to include all project keys associated with the project)."),
        status: z.array(z.string()).optional().describe("EXPERIMENTAL. Filter results by project status. Valid values: 'live', 'archived', 'deleted'."),
        orderBy: z.string().optional().describe("Order the results by a field. Valid values: 'category', 'issueCount', 'key', 'lastIssueUpdatedTime', 'name', 'owner', 'archivedDate', 'deletedDate'. Prefix with '-' for descending order."),
        startAt: z.number().int().optional().describe("The index of the first item to return in a page of results (page offset). The base index is 0."),
        categoryId: z.number().int().optional().describe("The ID of the project category to filter by."),
        maxResults: z.number().int().optional().describe("The maximum number of projects to return per page. Maximum allowed value is 100."),
        properties: z.array(z.string()).optional().describe("A list of project property keys to include in the response for each project, allowing retrieval of custom project entity properties. For example, if a project has a property with key 'com.example.property', including this key here as part of the list will return its value. Provide as a list of strings, e.g., '['property1', 'property2']'."),
    }),
    execute: async ({ jiraToken, jiraCloudId, name, query, action, expand, status, orderBy, startAt, categoryId, maxResults, properties }) => {
        const queryParams = { query: query, action: action, expand: expand, status: status, orderBy: orderBy, startAt: startAt, categoryId: categoryId, maxResults: maxResults, properties: properties };
        const body = { name: name };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/search`, method: 'GET', query: queryParams, body });
    },
});

export const jiraGetComponents = tool({
    description: "Tool to retrieve components from Jira projects with search and filtering. Use when you need to list or find components across projects, optionally filtered by project IDs/keys or search query.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        query: z.string().optional().describe("Filter the results using a literal string. Components with a matching name or description are returned (case insensitive)."),
        orderBy: z.enum(["description", "-description", "+description", "name", "-name", "+name"]).optional().describe("Enum for orderBy parameter values."),
        startAt: z.number().int().min(0).optional().describe("The index of the first item to return in a page of results (page offset). Used for pagination."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page. Used for pagination."),
        projectIdsOrKeys: z.array(z.string()).optional().describe("The project IDs and/or project keys (case sensitive) to filter components by. Returns components from all projects if not specified."),
    }),
    execute: async ({ jiraToken, jiraCloudId, query, orderBy, startAt, maxResults, projectIdsOrKeys }) => {
        const queryParams = { projectIdsOrKeys: projectIdsOrKeys, query: query, orderBy: orderBy, startAt: startAt, maxResults: maxResults };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/component`, method: 'GET', query: queryParams });
    },
});

export const jiraGetProject = tool({
    description: "This action retrieves detailed information about a specific Jira project using its project ID or key. It returns project metadata including name, key, type, and optional expanded fields.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information about project in the response. Available options: description, issueTypes, lead, projectKeys, issueTypeHierarchy."),
        properties: z.string().optional().describe("A comma-separated list of project properties to return for the project. Maximum 100 keys can be specified."),
        projectIdOrKey: z.string().describe("The project ID (numeric) or project key (e.g., 'PROJ') of the project to retrieve. Prefer the numeric ID for durable references, as project keys are mutable and can be renamed."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, properties, projectIdOrKey }) => {
        const queryParams = { expand: expand, properties: properties };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/${encodeURIComponent(projectIdOrKey)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetProjectRoles = tool({
    description: "This action retrieves all available roles for a specific Jira project. It returns role IDs, names, and descriptions which are needed when adding or removing users from project roles.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        projectIdOrKey: z.string().describe("The project ID (numeric) or project key (e.g., 'PROJ') of the project."),
    }),
    execute: async ({ jiraToken, jiraCloudId, projectIdOrKey }) => {
        const map = await jira(jiraToken, { cloudId: jiraCloudId, path: `/project/${encodeURIComponent(projectIdOrKey)}/role` });
        if (map?.error) return map;
        const entries = Object.entries(map);
        const roles = await Promise.all(entries.map(async ([name, url]) => {
            const id = String(url).split("/").pop();
            const detail = await jira(jiraToken, { cloudId: jiraCloudId, path: `/project/${encodeURIComponent(projectIdOrKey)}/role/${id}` });
            return { id: Number(id), name, description: detail?.description ?? null, actors: detail?.actors ?? [] };
        }));
        return { roles };
    },
});

export const jiraGetProjectTemplates = tool({
    description: "Retrieves available Jira project templates for creating projects. Returns template keys that can be used with the Create Project action. Use this action when you need to discover valid project template keys before creating a project.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        projectTypeKey: z.string().optional().describe("Filter templates by project type key. Valid values: 'software', 'business', 'service_desk', 'product_discovery'. If not provided, returns templates for all project types."),
    }),
    execute: async ({ jiraToken, jiraCloudId, projectTypeKey }) => {
        const queryParams = { projectTypeKey: projectTypeKey };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/projectTemplate`, method: 'GET', query: queryParams });
    },
});

export const jiraGetProjectType = tool({
    description: "Retrieves detailed information about a specific Jira project type using its key identifier. Returns metadata including the project type's key, formatted name, description key, icon, and color.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        projectTypeKey: z.enum(["software", "service_desk", "business", "product_discovery"]).describe("The key of the project type to retrieve. Valid values are: software (for software projects), service_desk (for service desk projects), business (for business projects), or product_discovery (for product discovery projects)."),
    }),
    execute: async ({ jiraToken, jiraCloudId, projectTypeKey }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/type/${encodeURIComponent(projectTypeKey)}`, method: 'GET', query: queryParams });
    },
});

export const jiraGetProjectVersions = tool({
    description: "This action retrieves all versions associated with a specific Jira project.      It can include additional properties for each version based on the request parameters.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Comma-separated string of properties to expand for each version (e.g., 'operations', 'issuesstatus')."),
        projectIdOrKey: z.string().describe("The ID or unique key of the Jira project for which versions are to be retrieved. For example, '10000' or 'PROJECTKEY'."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, projectIdOrKey }) => {
        const queryParams = { expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/${encodeURIComponent(projectIdOrKey)}/version`, method: 'GET', query: queryParams });
    },
});

export const jiraGetRecentProjects = tool({
    description: "This action retrieves a list of Jira projects that were recently accessed by the authenticated user. Use this to quickly find projects the user has been working with recently.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information in the response. This parameter accepts a comma-separated list. Expanded options include: description (returns the project description), projectKeys (returns all project keys associated with a project), lead (returns information about the project lead), issueTypes (returns all issue types associated with the project), url (returns the URL associated with the project), permissions (returns the permissions associated with the project), insight (EXPERIMENTAL - returns the insight details of total issue count and last issue update time for the project), * (returns the project with all available expand options)."),
        properties: z.array(z.string()).optional().describe("EXPERIMENTAL. A list of project properties to return for the project. This parameter accepts a comma-separated list. Invalid property names are ignored."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, properties }) => {
        const queryParams = { expand: expand, properties: properties };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/recent`, method: 'GET', query: queryParams });
    },
});

export const jiraListAllProjects = tool({
    description: "DEPRECATED: Use JIRA_GET_ALL_PROJECTS instead. Tool to list all projects accessible to the user. Wraps the deprecated GET /project endpoint; prefer the paginated JIRA_GET_ALL_PROJECTS (GET /project/search).",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information in the response. This parameter accepts a comma-separated list. Expanded options include: 'description' (Returns the project description), 'issueTypes' (Returns all issue types associated with the project), 'lead' (Returns information about the project lead), 'projectKeys' (Returns all project keys associated with the project)."),
        recent: z.number().int().min(1).max(20).optional().describe("Returns the user's most recently accessed projects. You may specify the number of results to return up to a maximum of 20. If access is anonymous, then the recently accessed projects are based on the current HTTP session."),
        properties: z.array(z.string()).optional().describe("A list of project properties to return for the project. This parameter accepts a comma-separated list."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, recent, properties }) => {
        const queryParams = { expand: expand, recent: recent, properties: properties };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project`, method: 'GET', query: queryParams });
    },
});

export const jiraListProjectTypes = tool({
    description: "Retrieves a list of all project types available in your Jira instance. Returns details about each project type including keys, formatted names, descriptions, icons, and colors.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/type`, method: 'GET', query: queryParams });
    },
});

export const jiraRemoveUserFromProjectRole = tool({
    description: "This action removes a user or group from a specific project role in Jira. Either a user account ID or group name must be provided.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        roleId: z.number().int().describe("The ID of the project role to remove the user from. Use get_project_roles action to find available role IDs."),
        groupName: z.string().optional().describe("The name of the group to remove from the project role. Either user_account_id or group_name must be provided."),
        userAccountId: z.string().optional().describe("The Atlassian account ID of the user to remove from the project role. Either user_account_id or group_name must be provided."),
        projectIdOrKey: z.string().describe("The project ID (numeric) or project key (e.g., 'PROJ') of the project."),
    }),
    execute: async ({ jiraToken, jiraCloudId, roleId, groupName, userAccountId, projectIdOrKey }) => {
        const queryParams = { user: userAccountId, group: groupName };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/project/${encodeURIComponent(projectIdOrKey)}/role/${encodeURIComponent(roleId)}`, method: 'DELETE', query: queryParams });
    },
});
