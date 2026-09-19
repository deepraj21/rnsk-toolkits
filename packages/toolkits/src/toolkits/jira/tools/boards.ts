// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jira } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const jiraCreateBoard = tool({
    description: "Creates a new Jira board (kanban, scrum, or agility) with optional filter and location configuration. Use this action when you need to set up a new board for a project or create a personal board for tracking work. The board will organize and visualize issues based on the specified filter or project context.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        name: z.string().describe("Name for the new board. Choose a clear, descriptive name that helps users identify the board's purpose."),
        type: z.enum(["kanban", "scrum", "agility"]).describe("Type of board to create. 'kanban' for continuous flow boards, 'scrum' for sprint-based boards, 'agility' for basic agile boards."),
        filterId: z.number().int().optional().describe("ID of an existing Jira filter to use as the board's issue source. The filter defines which issues appear on the board. Use JIRA_LIST_FILTERS or JIRA_GET_FILTER_FAVOURITE to find filter IDs."),
        location: z.record(z.any()).optional().describe("Location configuration for the board."),
    }),
    execute: async ({ jiraToken, jiraCloudId, name, type, filterId, location }) => {
        const queryParams = undefined;
        const body = { name: name, type: type, filterId: filterId, location: location };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'agile/1.0', path: `/board`, method: 'POST', query: queryParams, body });
    },
});

export const jiraCreateSprint = tool({
    description: "This action allows the creation of a new sprint within a specified Jira board. Users can set optional start and end dates, as well as define a primary goal for the sprint.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        goal: z.string().optional().describe("Primary objective or goal for the sprint."),
        name: z.string().max(30).describe("Name for the new sprint. Must be 30 characters or less."),
        endDate: z.string().optional().describe("Intended end date and time for the sprint (ISO 8601 format)."),
        startDate: z.string().optional().describe("Intended start date and time for the sprint (ISO 8601 format)."),
        originBoardId: z.number().int().describe("Identifier of the Jira board for the new sprint. You can find board IDs using the JIRA_LIST_BOARDS action."),
        additionalProperties: z.record(z.any()).optional().describe("Additional properties to include in the sprint creation request. Use this for any extra fields supported by the Jira API that are not covered by the standard parameters. Provide as a dictionary with field names and their values. Note: Jira Cloud has strict schema validation and may reject unknown properties with a 400 error. This field is primarily useful for Jira Server/Data Center deployments or future API additions. Use with caution."),
    }),
    execute: async ({ jiraToken, jiraCloudId, goal, name, endDate, startDate, originBoardId, additionalProperties }) => {
        const queryParams = undefined;
        const body = { name: name, originBoardId: originBoardId, startDate: startDate, endDate: endDate, goal: goal };
        if (additionalProperties && typeof additionalProperties === "object") Object.assign(body, additionalProperties);
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'agile/1.0', path: `/sprint`, method: 'POST', query: queryParams, body });
    },
});

export const jiraGetSprint = tool({
    description: "Retrieves detailed information about a specific sprint by its ID. Use this action when you need to fetch a single sprint's details directly by ID, such as checking sprint status, dates, goal, or metadata. For finding sprint IDs, use JIRA_LIST_SPRINTS first.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        sprintId: z.number().int().describe("The unique identifier of the sprint to retrieve. Use JIRA_LIST_SPRINTS to find sprint IDs for a board."),
    }),
    execute: async ({ jiraToken, jiraCloudId, sprintId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'agile/1.0', path: `/sprint/${encodeURIComponent(sprintId)}`, method: 'GET', query: queryParams });
    },
});

export const jiraListBoards = tool({
    description: "Retrieves a list of Jira boards based on specified criteria.      Supports pagination via start_at and max_results. The response also includes convenience fields nextStartAt, hasNextPage, and nextPageToken to help iterate through pages.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        name: z.string().optional().describe("Filters results to boards whose name contains the string (case-insensitive). Board names do not necessarily correspond to project keys; enumerate all boards to confirm the correct match."),
        type: z.enum(["scrum", "kanban"]).optional().describe("Filters results to boards of the specified type. Valid values: 'scrum', 'kanban'. Other types (e.g., 'simple') are not filterable server-side; filter those from the response."),
        orderBy: z.string().optional().describe("Field to order boards by (e.g., 'name', '-name' for descending). Refer to Jira API docs for all sortable fields."),
        startAt: z.number().int().min(0).optional().describe("Index of the first board to return (0-based) for pagination."),
        maxResults: z.number().int().optional().describe("Maximum number of boards to return per page."),
        includePrivate: z.boolean().optional().describe("Include private boards in the results."),
        projectKeyOrId: z.string().optional().describe("Filters results to boards for the specified project. Must be a project KEY (e.g., 'KAN', 'PROJ') or numeric project ID (e.g., '10000'). Do NOT use the project name (e.g., 'My Project') - use the short key instead."),
    }),
    execute: async ({ jiraToken, jiraCloudId, name, type, orderBy, startAt, maxResults, includePrivate, projectKeyOrId }) => {
        const queryParams = { name: name, type: type, projectKeyOrId: projectKeyOrId, startAt: startAt, maxResults: maxResults, orderBy: orderBy, includePrivate: includePrivate };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'agile/1.0', path: `/board`, method: 'GET', query: queryParams });
    },
});

export const jiraListSprints = tool({
    description: "Retrieves and lists sprints associated with a specified Jira board.      Users can filter results based on the state of the sprints, allowing for better management and visibility.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        state: z.string().optional().describe("Filters sprints by state. Accepts single value ('active') or comma-separated values ('active,closed'). Valid states: 'future', 'active', 'closed'. Returns all states if omitted."),
        boardId: z.number().int().describe("Unique identifier of the Jira board. Must be a Scrum board ID; Kanban boards do not support sprints and will return no results. Use JIRA_LIST_BOARDS to identify the correct board."),
        startAt: z.number().int().min(0).optional().describe("0-based starting index for pagination. Increment by 'max_results' each iteration; stop when response field 'isLast' is true."),
        maxResults: z.number().int().min(1).max(50).optional().describe("Maximum number of sprints per page."),
    }),
    execute: async ({ jiraToken, jiraCloudId, state, boardId, startAt, maxResults }) => {
        const queryParams = { state: state, startAt: startAt, maxResults: maxResults };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'agile/1.0', path: `/board/${encodeURIComponent(boardId)}/sprint`, method: 'GET', query: queryParams });
    },
});

export const jiraMoveIssueToSprint = tool({
    description: "This action takes multiple issues and moves them to a specified sprint in Jira.      It ensures that the issues are successfully added to the targeted sprint based on the provided sprint ID.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        issues: z.array(z.string()).describe("A list of issue keys (e.g., 'PROJ-123') to be moved to the specified sprint."),
        sprintId: z.number().int().describe("Unique identifier for the target sprint. Must belong to the same board/project as the issues being moved."),
        rankAfterIssue: z.string().optional().describe("The issue key or ID to rank the moved issues after. If specified, the moved issues will be placed immediately after this issue in the sprint backlog."),
        rankBeforeIssue: z.string().optional().describe("The issue key or ID to rank the moved issues before. If specified, the moved issues will be placed immediately before this issue in the sprint backlog."),
        rankCustomFieldId: z.number().int().optional().describe("The ID of the rank custom field to use for ordering. This is typically the 'Rank' field ID in your Jira instance. Only needed if you have multiple rank fields."),
    }),
    execute: async ({ jiraToken, jiraCloudId, issues, sprintId, rankAfterIssue, rankBeforeIssue, rankCustomFieldId }) => {
        const queryParams = undefined;
        const body = { issues: issues, rankBeforeIssue: rankBeforeIssue, rankAfterIssue: rankAfterIssue, rankCustomFieldId: rankCustomFieldId };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'agile/1.0', path: `/sprint/${encodeURIComponent(sprintId)}/issue`, method: 'POST', query: queryParams, body });
    },
});
