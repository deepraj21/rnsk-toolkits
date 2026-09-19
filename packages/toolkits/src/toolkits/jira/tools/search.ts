// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { jira, mdToAdf, buildSearchJql } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const jiraAnalyseExpression = tool({
    description: "Analyses Jira expressions for syntax validation, type checking, and complexity analysis. Use when you need to validate Jira expression syntax before using it in automation rules, custom fields, or workflows.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        check: z.enum(["syntax", "type", "complexity"]).optional().describe("Type of check to perform on the expression."),
        expressions: z.array(z.string()).describe("The list of Jira expressions to analyse. Each expression will be checked according to the specified check type."),
        contextVariables: z.record(z.any()).optional().describe("Context variables and their types. The type checker assumes that common context variables (such as 'issue' or 'project') are available in context and sets their type. Use this property to override the default types or provide details of new variables."),
    }),
    execute: async ({ jiraToken, jiraCloudId, check, expressions, contextVariables }) => {
        const queryParams = undefined;
        const body = { expressions: expressions, check: check, contextVariables: contextVariables };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/expression/analyse`, method: 'POST', query: queryParams, body });
    },
});

export const jiraCreateJqlAutocompletedata = tool({
    description: "Retrieves JQL autocomplete reference data including reserved words, field names, and function names. Use when building JQL query editors or validating JQL syntax.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        projectIds: z.array(z.string()).optional().describe("List of project IDs used to filter the visible field details returned. Only fields visible in these projects will be included."),
        includeCollapsedFields: z.boolean().optional().describe("Include collapsed fields for fields that have non-unique names. Set to true to include fields with duplicate names."),
    }),
    execute: async ({ jiraToken, jiraCloudId, projectIds, includeCollapsedFields }) => {
        const queryParams = undefined;
        const body = { projectIds: projectIds, includeCollapsedFields: includeCollapsedFields };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/jql/autocompletedata`, method: 'POST', query: queryParams, body });
    },
});

export const jiraEvaluateJiraExpression = tool({
    description: "Tool to evaluate Jira expressions using the enhanced search API. Use when you need to extract or transform data from Jira using Jira expression language. Useful for complex data queries, transformations, and building custom objects from Jira data.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        expand: z.string().optional().describe("Use expand to include additional information in the response. This parameter accepts 'meta.complexity' that returns information about the expression complexity, such as the number of expensive operations used and how close the expression is to reaching the complexity limit. Useful when designing and debugging your expressions."),
        context: z.record(z.any()).optional().describe("Context in which the Jira expression is evaluated."),
        expression: z.string().describe("The Jira expression to evaluate. Jira expressions allow you to extract and transform data from Jira. For example: 'issue.key' returns the issue key, 'issue.issueType.name' returns the issue type name, or complex expressions like '{ key: issue.key, type: issue.issueType.name, links: issue.links.map(link => link.linkedIssue.id) }' to build custom objects."),
    }),
    execute: async ({ jiraToken, jiraCloudId, expand, context, expression }) => {
        const queryParams = undefined;
        const body = { expression: expression, context: context, expand: expand };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/expression/evaluate`, method: 'POST', query: queryParams, body });
    },
});

export const jiraGetJqlAutocompletedata = tool({
    description: "Tool to retrieve JQL autocomplete reference data. Use when you need to discover available JQL fields, functions, and reserved words for building queries.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
    }),
    execute: async ({ jiraToken, jiraCloudId }) => {
        const queryParams = undefined;
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/jql/autocompletedata`, method: 'GET', query: queryParams });
    },
});

export const jiraGetJqlAutocompletedataSuggestions = tool({
    description: "Tool to get JQL field auto-complete suggestions. Use when building JQL queries to discover valid field values or predicate options.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        fieldName: z.string().optional().describe("The name of the field for which to get suggestions."),
        fieldValue: z.string().optional().describe("The partial field item name entered by the user to filter suggestions."),
        predicateName: z.string().optional().describe("The name of the CHANGED operator predicate for which suggestions are generated. Valid values: 'by', 'from', 'to'."),
        predicateValue: z.string().optional().describe("The partial predicate item name entered by the user to filter suggestions."),
    }),
    execute: async ({ jiraToken, jiraCloudId, fieldName, fieldValue, predicateName, predicateValue }) => {
        const queryParams = { fieldName: fieldName, fieldValue: fieldValue, predicateName: predicateName, predicateValue: predicateValue };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/jql/autocompletedata/suggestions`, method: 'GET', query: queryParams });
    },
});

export const jiraParseJqlQueries = tool({
    description: "Parse and validate JQL queries, returning their abstract syntax tree structure along with any errors or warnings. Use when you need to validate JQL syntax or understand query structure before execution.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        queries: z.array(z.string()).min(1).describe("A list of JQL queries to parse. Each query string must be non-empty and will be validated according to the validation parameter."),
        validation: z.enum(["strict", "warn", "none"]).optional().describe("How to validate the JQL queries and treat the validation results. 'strict': Returns all errors; if validation fails, the query structure is not returned. 'warn': Returns all errors; if validation fails but the JQL query is correctly formed, the query structure is returned. 'none': No validation is performed; if JQL query is correctly formed, the query structure is returned."),
    }),
    execute: async ({ jiraToken, jiraCloudId, queries, validation }) => {
        const queryParams = undefined;
        const body = { queries: queries, validation: validation };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/jql/parse`, method: 'POST', query: queryParams, body });
    },
});

export const jiraSearchApproximateCount = tool({
    description: "Count issues matching a JQL query using approximate count endpoint. Use when you need a fast count of issues without retrieving full issue details. The JQL query must be bounded (include at least one search restriction).",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        jql: z.string().describe("A JQL (Jira Query Language) expression to search for issues. For performance reasons, this parameter requires a bounded query - a query with a search restriction (e.g., 'project = KAN', 'assignee = currentUser()', 'status = Done'). Unbounded queries like empty strings or queries with only 'ORDER BY' clauses are not allowed."),
    }),
    execute: async ({ jiraToken, jiraCloudId, jql }) => {
        const queryParams = undefined;
        const body = { jql: jql };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/search/approximate-count`, method: 'POST', query: queryParams, body });
    },
});

export const jiraSearchForIssuesUsingJqlGet = tool({
    description: "This action retrieves Jira issues based on a specified JQL query. It allows for pagination as well as selection of specific fields to include in the result.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        jql: z.string().optional().describe("Jira Query Language (JQL) string for searching issues. REQUIRED if 'next_page_token' is not provided. Provide this parameter to start a search. To continue a paginated search with a raw Jira token, provide both the original JQL and 'next_page_token'; tokens returned by this action already include that context. IMPORTANT: JQL must include at least one search restriction (filter condition such as project, status, assignee, issuetype, labels, created, updated, etc.). Unbounded queries containing only ORDER BY clauses (e.g., 'order by created DESC') are rejected by the API. Always include a filter like 'project = X' or 'status = Open'. NOTE: This action uses Jira's enhanced search API which has stricter JQL syntax requirements than the Jira UI."),
        expand: z.string().optional().describe("Comma-separated list of entities to expand within issues (e.g., 'renderedFields', 'changelog')."),
        fields: z.array(z.string()).optional().describe("Specific issue fields to retrieve (e.g., 'summary', 'customfield_10010', '*all', '*navigable'). Defaults if omitted."),
        failFast: z.boolean().optional().describe("Fail early on certain errors during search."),
        properties: z.array(z.string()).optional().describe("List of issue property keys (key-value metadata) to retrieve."),
        maxResults: z.number().int().min(1).optional().describe("Maximum issues to retrieve per page. Must be at least 1. Note: Jira Cloud typically limits results to 100 per request for performance reasons."),
        fieldsByKeys: z.boolean().optional().describe("Set to 'True' to identify fields by keys (e.g., 'customfield_10000') instead of IDs."),
        nextPageToken: z.string().optional().describe("Pagination token from a previous enhanced search response. Use the token returned by this action to continue without resending JQL. If you pass a raw Jira nextPageToken, also pass the original JQL."),
        reconcileIssues: z.array(z.number().int()).optional().describe("List of issue IDs to enable read-after-write reconciliation during search."),
    }),
    execute: async ({ jiraToken, jiraCloudId, jql, expand, fields, failFast, properties, maxResults, fieldsByKeys, nextPageToken, reconcileIssues }) => {
        const queryParams = { jql: jql, expand: expand, fields: fields, properties: properties, maxResults: maxResults, fieldsByKeys: fieldsByKeys, nextPageToken: nextPageToken, reconcileIssues: reconcileIssues, failFast: failFast };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/search/jql`, method: 'GET', query: queryParams });
    },
});

export const jiraSearchForIssuesUsingJqlPost = tool({
    description: "This action performs the enhanced JQL issue search that supports eventual consistency and token-based pagination. Use it when you need stable results immediately after creating or updating issues, or when paginating large result sets. IMPORTANT: This action only works with Jira Cloud. For Jira Server or Data Center instances, use JIRA_SEARCH_FOR_ISSUES_USING_JQL_GET instead.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        jql: z.string().optional().describe("The JQL (Jira Query Language) query string to use for the search. Must be bounded (for example, include a restriction like 'project = KAN'); unbounded queries such as empty JQL or only 'order by ...' are not accepted. Provide either this 'jql' (for the first page) or 'nextPageToken' (to continue pagination). Use only valid JQL field names (e.g., 'project', 'assignee', 'status', 'created', 'updated', 'reporter', 'priority', 'issuetype', 'summary', 'description', 'key', 'labels', 'component', 'fixVersion', 'resolution', 'sprint', 'timespent', 'worklogDate', 'worklogAuthor', 'worklogComment'). Note that some fields like 'worklogDate' require time-tracking to be enabled in the Jira instance."),
        expand: z.string().optional().describe("A comma-separated list of entities to expand in the response (e.g., 'names', 'schema', 'transitions', 'changelog')."),
        fields: z.array(z.string()).optional().describe("A list of fields to return for each issue (e.g., 'summary', 'status', 'assignee', '*navigable')."),
        maxResults: z.number().int().min(1).max(5000).optional().describe("The maximum number of issues to return per page (1-5000). In practice, values above 100 may be ignored by the API; total results per JQL query are capped at ~10,000 regardless of pagination."),
        properties: z.array(z.string()).optional().describe("A list of issue property keys to return for each issue."),
        fieldsByKeys: z.boolean().optional().describe("If true, treats values in 'fields' as keys (e.g., 'customfield_10000')."),
        nextPageToken: z.string().optional().describe("Opaque token received from a previous response to continue pagination. Tokens returned by this action include the original search context and can be passed alone. Raw Jira nextPageToken values require the original JQL too. IMPORTANT: Tokens are short-lived and expire quickly. They must be used immediately within the same search session. If you receive a 'token is invalid or expired' error, restart the search from the beginning with a fresh JQL query (do not reuse old tokens)."),
        reconcileIssues: z.array(z.number().int()).optional().describe("List of issue IDs to reconcile for read-after-write consistency (maximum 50)."),
    }),
    execute: async ({ jiraToken, jiraCloudId, jql, expand, fields, maxResults, properties, fieldsByKeys, nextPageToken, reconcileIssues }) => {
        const queryParams = undefined;
        const body = { jql: jql, expand: expand, fields: fields, maxResults: maxResults, properties: properties, fieldsByKeys: fieldsByKeys, nextPageToken: nextPageToken, reconcileIssues: reconcileIssues };
        return jira(jiraToken, { cloudId: jiraCloudId, api: 'api/3', path: `/search/jql`, method: 'POST', query: queryParams, body });
    },
});

export const jiraSearchIssues = tool({
    description: "This action performs advanced searches for Jira issues using either structured filters or raw JQL queries. It supports various search criteria including project, assignee, status, priority, and date ranges.",
    inputSchema: z.object({
        jiraToken: tokenField,
        jiraCloudId: z.string().optional().describe('Optional Jira Cloud site ID. If omitted, your first accessible site is used automatically.'),
        jql: z.string().optional().describe("Raw JQL (Jira Query Language) query for advanced users. Takes precedence over filters. Can be a complete JQL query with filters and/or ORDER BY clause, or just an ORDER BY clause. CRITICAL JQL SYNTAX RULES - Every comparison needs field + operator + value: (1) WRONG: '(\"val1\" OR \"val2\")' - bare values without field reference cause 'Expecting operator' errors. (2) RIGHT: 'status = \"val1\" OR status = \"val2\"' - each value has field and operator. (3) BETTER: 'status IN (\"val1\", \"val2\", \"val3\")' - use IN for multiple values on same field. (4) Text search uses ~: 'summary ~ \"keyword\"' or 'text ~ \"keyword\"'. (5) Valid operators: =, !=, <, >, <=, >=, ~, !~, IN, NOT IN, IS, IS NOT. COMMON MISTAKE: Do NOT pass ('value1' OR 'value2') - this is invalid. Instead use: field IN ('value1', 'value2') or field = 'value1' OR field = 'value2'."),
        fields: z.array(z.string()).optional().describe("List of fields to return for each issue (for example: summary, status, assignee). If omitted, a sensible default set is requested to populate common fields."),
        labels: z.array(z.string()).optional().describe("Filter by labels (all labels must match)."),
        assignee: z.string().optional().describe("Filter by assignee. Can be account ID (e.g., '712020:abc...'), email (e.g., 'john@company.com'), display name (e.g., 'John Doe'), or 'unassigned'."),
        maxResults: z.number().int().optional().describe("Maximum number of issues to return per page. Capped at 100 per page; total results per JQL query capped at ~10,000. Use next_page_token to paginate."),
        projectKey: z.string().optional().describe("Filter by project key (e.g., 'PROJ')."),
        textSearch: z.string().optional().describe("Search in summary and description text."),
        createdAfter: z.string().optional().describe("Filter issues created after this date. Supports YYYY-MM-DD format or relative dates like '-30m' (last 30 minutes), '-7d' (last 7 days), '-1w' (last week), '-1M' (last month)."),
        updatedAfter: z.string().optional().describe("Filter issues updated after this date. Supports YYYY-MM-DD format or relative dates like '-30m' (last 30 minutes), '-7d' (last 7 days), '-1w' (last week), '-1M' (last month)."),
        createdBefore: z.string().optional().describe("Filter issues created before this date (YYYY-MM-DD format)."),
        updatedBefore: z.string().optional().describe("Filter issues updated before this date (YYYY-MM-DD format)."),
        nextPageToken: z.string().optional().describe("Cursor token used to fetch the next page when using enhanced search. Tokens returned by this action include the original search context and can be passed alone. Raw Jira nextPageToken values require the same JQL or filters used for the original search."),
        sprintIdOrName: z.string().optional().describe("Filter by sprint. Can be sprint ID (e.g., '123') or name (e.g., 'Sprint 1', 'Release Sprint')."),
        statusIdOrName: z.string().optional().describe("Filter by status. Can be either a status ID (e.g., '10001') or name (e.g., 'To Do', 'In Progress', 'Done')."),
        preservedOrderBy: z.string().optional().describe("Internal: preserved ORDER BY clause from ORDER-BY-only JQL input"),
        priorityIdOrName: z.string().optional().describe("Filter by priority. Can be either a priority ID (e.g., '1', '2') or name (e.g., 'High', 'Medium', 'Low')."),
        issueTypeIdOrName: z.string().optional().describe("Filter by issue type. Can be either an issue type ID (e.g., '10001') or name (e.g., 'Bug', 'Task', 'Story')."),
    }),
    execute: async ({ jiraToken, jiraCloudId, jql, fields, labels, assignee, maxResults, projectKey, textSearch, createdAfter, updatedAfter, createdBefore, updatedBefore, nextPageToken, sprintIdOrName, statusIdOrName, preservedOrderBy, priorityIdOrName, issueTypeIdOrName }) => {
        if (nextPageToken) {
            return jira(jiraToken, { cloudId: jiraCloudId, path: '/search/jql', method: 'POST', body: { jql, nextPageToken } });
        }
        const built = jql ?? buildSearchJql({ projectKey, assignee, statusIdOrName, priorityIdOrName, issueTypeIdOrName, labels, textSearch, createdAfter, updatedAfter, createdBefore, updatedBefore, sprintIdOrName, preservedOrderBy });
        if (!built) return { error: "Provide at least one filter: jql, projectKey, assignee, status, textSearch, dates, etc." };
        const body = { jql: built };
        if (fields) body.fields = fields;
        if (maxResults !== undefined) body.maxResults = maxResults;
        return jira(jiraToken, { cloudId: jiraCloudId, path: '/search/jql', method: 'POST', body });
    },
});
