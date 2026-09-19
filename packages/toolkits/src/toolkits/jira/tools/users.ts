// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jira } from './client.js';
import { ATLASSIAN_API } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const jiraAddUserToGroup = tool({
    description: "This action adds a user to a Jira group. The user is identified by their Atlassian account ID, and the group is identified by either its name or ID.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        groupId: z.string().optional().describe("The ID of the group to add the user to. Either group_name or group_id must be provided."),
        accountId: z.string().describe("The Atlassian account ID of the user to add to the group."),
        groupName: z.string().optional().describe("The name of the group to add the user to. Either group_name or group_id must be provided. Must be an exact match; prefer group_id for precision."),
    }),
    execute: async ({ jiraToken, jiraCloudId, groupId, accountId, groupName }) => {
        const queryParams = { groupname: groupName, groupId: groupId };
        const body = { accountId: accountId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/group/user`, method: 'POST', query: queryParams, body });
    },
});

export const jiraCreateGroup = tool({
    description: "This action creates a new group in Jira. Groups are used to organize users and manage permissions across projects and issues.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        name: z.string().describe("The name of the group to create. Must be unique within the Jira instance."),
    }),
    execute: async ({ jiraToken, jiraCloudId, name }) => {
        const queryParams = undefined;
        const body = { name: name };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/group`, method: 'POST', query: queryParams, body });
    },
});

export const jiraFindUsers = tool({
    description: "This action allows you to search for Jira users using various parameters like email or display name. It returns a list of users that match the search criteria for further operations.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        query: z.string().optional().describe("A query string that is matched against user attributes. This can be used to search by display name or email address. For example, 'john@company.com' to find a user by email. At least one of 'query' or 'account_id' must be provided. Plain-text only — JQL-style functions like currentUser() are unsupported and return no results. Email fields in results may be redacted due to privacy settings; use display_name for disambiguation when email is unavailable."),
        active: z.boolean().optional().describe("Filter users by active status. When true, only active users are returned. When false, only inactive users are returned. If not provided, the search returns active users."),
        startAt: z.number().int().optional().describe("The 0-based index of the first item to return in the page of results. Used for pagination."),
        accountId: z.string().optional().describe("The account ID to search for. Use this to get user details when you already have the account ID. At least one of 'query' or 'account_id' must be provided."),
        maxResults: z.number().int().optional().describe("The maximum number of items to return per page. Defaults to 50. Maximum allowed is typically 1000."),
    }),
    execute: async ({ jiraToken, jiraCloudId, query, active, startAt, accountId, maxResults }) => {
        const queryParams = { query: query, accountId: accountId, active: active, startAt: startAt, maxResults: maxResults };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/user/search`, method: 'GET', query: queryParams });
    },
});

export const jiraFindUsers2 = tool({
    description: "Tool to find users in Jira by query string, account ID, or property search. Use when you need to search for users to assign to issues, add as watchers, or perform other user-related operations.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        query: z.string().optional().describe("A query string that is matched against user attributes (displayName, and emailAddress) to find relevant users. The string can match the prefix of the attribute's value. For example, 'john' matches a user with a displayName of 'John Smith' and a user with an emailAddress of 'johnson@example.com'. Required, unless accountId or property is specified."),
        startAt: z.number().int().min(0).optional().describe("The index of the first item to return in a page of filtered results (page offset)."),
        property: z.string().optional().describe("A query string used to search properties. Property keys are specified by path, so property keys containing dot (.) or equals (=) characters cannot be used. The query string cannot be specified using a JSON object. Example: To search for the value of 'nested' from {\"something\":{\"nested\":1,\"other\":2}} use 'thepropertykey.something.nested=1'. Required, unless accountId or query is specified."),
        username: z.string().optional().describe("This parameter is no longer available. See the deprecation notice for details."),
        accountId: z.string().optional().describe("A query string that is matched exactly against a user accountId. Required, unless query or property is specified."),
        maxResults: z.number().int().min(1).max(1000).optional().describe("The maximum number of items to return per page."),
    }),
    execute: async ({ jiraToken, jiraCloudId, query, startAt, property, username, accountId, maxResults }) => {
        const queryParams = { query: query, accountId: accountId, startAt: startAt, maxResults: maxResults, property: property, username: username };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/user/search`, method: 'GET', query: queryParams });
    },
});

export const jiraFindUsersForPicker = tool({
    description: "Find users for picker components by matching query against user attributes like display name and email.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        query: z.string().describe("A query string that is matched against user attributes, such as 'displayName', and 'emailAddress', to find relevant users. The string can match the prefix of the attribute's value. For example, *query=john* matches a user with a 'displayName' of *John Smith* and a user with an 'emailAddress' of *johnson@example.com*."),
        avatarSize: z.string().optional().describe("The size of the avatar to return. Only used when 'show_avatar' is true."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return. The total number of matched users is returned in 'total'. Defaults to 50."),
        showAvatar: z.boolean().optional().describe("Include the URI to the user's avatar. Defaults to false."),
        excludeAccountIds: z.array(z.string()).optional().describe("A list of account IDs to exclude from the search results. Cannot be provided with 'exclude'."),
        excludeConnectUsers: z.boolean().optional().describe("Exclude Connect app users from the search results. Defaults to false."),
    }),
    execute: async ({ jiraToken, jiraCloudId, query, avatarSize, maxResults, showAvatar, excludeAccountIds, excludeConnectUsers }) => {
        const queryParams = { query: query, maxResults: maxResults, showAvatar: showAvatar, avatarSize: avatarSize, excludeAccountIds: excludeAccountIds, excludeConnectUsers: excludeConnectUsers };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/user/picker`, method: 'GET', query: queryParams });
    },
});

export const jiraGetAllGroups = tool({
    description: "This action retrieves a single page of groups from the Jira instance. Use 'start_at' and 'max_results' to page through results; the response includes 'has_next_page' and 'next_start_at' to drive pagination.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        startAt: z.number().int().min(0).optional().describe("The 0-based index of the first item to return in the page of results. Defaults to 0. To paginate, use 'next_start_at' from the response (or increment 'start_at' by 'max_results'); stop when 'has_next_page' is false."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page. Defaults to 50. The Jira instance might have its own maximum limit for this value. A single page is returned per call; use 'has_next_page'/'next_start_at' to fetch more."),
    }),
    execute: async ({ jiraToken, jiraCloudId, startAt, maxResults }) => {
        const perPage = maxResults ?? 50;
        const start = startAt ?? 0;
        const res = await jira(jiraToken, { cloudId: jiraCloudId, path: "/groups/picker", query: { startAt: start, maxResults: perPage } });
        if (res?.error) return res;
        const list = Array.isArray(res?.values) ? res.values : [];
        const isLast = res?.isLast ?? list.length < perPage;
        return { groups: list, total: res?.total ?? list.length, startAt: start, maxResults: perPage, isLast, hasNextPage: !isLast, nextStartAt: isLast ? null : start + perPage };
    },
});

export const jiraGetAllUsers = tool({
    description: "This action retrieves a single page of users from the Jira instance. Use 'start_at' and 'max_results' to page through results; the response includes 'has_next_page' and 'next_start_at' to drive pagination.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        startAt: z.number().int().min(0).optional().describe("The 0-based index of the first item to return in the page of results. Defaults to 0. To paginate, increment 'start_at' by 'max_results' each request (or use 'next_start_at' from the response); stop when 'has_next_page' is false."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of items to return per page. Defaults to 50. The Jira instance might have its own maximum limit for this value. A single page is returned per call; use 'has_next_page'/'next_start_at' from the response to fetch subsequent pages."),
    }),
    execute: async ({ jiraToken, jiraCloudId, startAt, maxResults }) => {
        const perPage = maxResults ?? 50;
        const start = startAt ?? 0;
        const users = await jira(jiraToken, { cloudId: jiraCloudId, path: "/users/search", query: { startAt: start, maxResults: perPage } });
        if (users?.error) return users;
        const list = Array.isArray(users) ? users : [];
        const isLast = list.length < perPage;
        return { users: list, startAt: start, maxResults: perPage, isLast, hasNextPage: !isLast, nextStartAt: isLast ? null : start + perPage };
    },
});

export const jiraGetCurrentUser = tool({
    description: "This action retrieves detailed information about the currently authenticated Jira user. It provides data such as the user's display name, email address, groups, and application roles.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Comma-separated list of user properties to expand, e.g., 'groups', 'applicationRoles'. Omitting this parameter returns only the base user profile without group membership or role data."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand }) => {
        const queryParams = { expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/myself`, method: 'GET', query: queryParams });
    },
});

export const jiraGetGroup = tool({
    description: "This action retrieves information about a specific Jira group. You can fetch the group by its name or unique ID, and optionally expand to include the list of users in the group.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Additional properties to expand in the response. Use 'users' to include group members. Useful for verifying membership state after group modification operations."),
        groupId: z.string().optional().describe("The unique ID of the group to retrieve. Either group_name or group_id must be provided."),
        groupName: z.string().optional().describe("The name of the group to retrieve. Either group_name or group_id must be provided."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, groupId, groupName }) => {
        const queryParams = { groupname: groupName, groupId: groupId, expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/group`, method: 'GET', query: queryParams });
    },
});

export const jiraGetMypreferencesLocale = tool({
    description: "Tool to retrieve the locale preference of the currently authenticated Jira user. Use when you need to know the user's language and regional settings.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/mypreferences/locale`, method: 'GET', query: queryParams });
    },
});

export const jiraGetUserGroups = tool({
    description: "Retrieves all groups for a specific Jira user by account ID. Use this action when you need to check group membership for a particular user, verify permissions, or audit user access. Essential for understanding which groups a user belongs to before performing group-related operations.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        accountId: z.string().describe("The Atlassian account ID of the user whose groups you want to retrieve."),
    }),
    execute: async ({ jiraToken, jiraCloudId, accountId }) => {
        const queryParams = { accountId: accountId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/user/groups`, method: 'GET', query: queryParams });
    },
});

export const jiraListGroupsPicker = tool({
    description: "This action searches and lists groups using Jira's picker endpoint, which is optimized for autocomplete and search scenarios. It allows filtering by name and excluding specific groups.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        query: z.string().optional().describe("The string to find in group names. Use this to search for groups matching a specific text."),
        exclude: z.array(z.string()).optional().describe("A list of group names to exclude from the result. As a group's name can change, use of 'exclude_id' is recommended to identify a group. This parameter cannot be used with 'exclude_id' parameter."),
        excludeId: z.array(z.string()).optional().describe("A list of group IDs to exclude from the result. This parameter cannot be used with the 'exclude' parameter."),
        maxResults: z.number().int().min(1).optional().describe("The maximum number of groups to return. The maximum number of groups that can be returned is limited by the system property 'jira.ajax.autocomplete.limit'."),
        caseInsensitive: z.boolean().optional().describe("Whether the search for groups should be case insensitive. Defaults to false if not specified."),
    }),
    execute: async ({ jiraToken, jiraCloudId, query, exclude, excludeId, maxResults, caseInsensitive }) => {
        const queryParams = { query: query, exclude: exclude, excludeId: excludeId, maxResults: maxResults, caseInsensitive: caseInsensitive };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/groups/picker`, method: 'GET', query: queryParams });
    },
});

export const jiraRemoveUserFromGroup = tool({
    description: "This action removes a user from a Jira group. The user is identified by their Atlassian account ID, and the group is identified by either its name or ID.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        groupId: z.string().optional().describe("The ID of the group to remove the user from. Either group_name or group_id must be provided."),
        accountId: z.string().describe("The Atlassian account ID of the user to remove from the group. System and app accounts cannot be modified; attempting removal returns a 400 'User not modifiable' error."),
        groupName: z.string().optional().describe("The name of the group to remove the user from. Either group_name or group_id must be provided."),
    }),
    execute: async ({ jiraToken, jiraCloudId, groupId, accountId, groupName }) => {
        const queryParams = { groupname: groupName, groupId: groupId, accountId: accountId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/group/user`, method: 'DELETE', query: queryParams });
    },
});

export const jiraWhoAmI = tool({
    description: "Return the Atlassian (Jira) sites accessible to the connection. Identity is workspace-level.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        try {
            const response = await fetch(`${ATLASSIAN_API}/oauth/token/accessible-resources`, { headers: { Authorization: `Bearer ${jiraToken}`, Accept: "application/json" } });
            if (!response.ok) return { error: `Failed to list accessible sites with status ${response.status}` };
            const sites = await response.json();
            return { sites: (Array.isArray(sites) ? sites : []).map((s) => ({ id: s.id, name: s.name, url: s.url })), accountId: null };
        } catch (error) { return { error: "Error listing accessible Jira sites", message: error instanceof Error ? error.message : "Unknown error" }; }
    },
});
