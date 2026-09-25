// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID"). Generate tokens from Settings > Integration > Dynatrace API.',
    );
const timeFields = {
    from: z
        .string()
        .optional()
        .describe('Start of timeframe: relative ("now-2h", "now-7d") or ISO timestamp (default now-2h where applicable)'),
    to: z.string().optional().describe('End of timeframe: relative or ISO timestamp (default now)'),
};

export const listProblems = tool({
    description:
        'List Davis AI problems (open incidents) with severity, status, affected entities and root cause. Filter by problemSelector (e.g. status("open"),severity("ERROR")) or entitySelector. Start here for incident triage.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemSelector: z
            .string()
            .optional()
            .describe('Problem selector, e.g. \'status("open")\', \'severity("ERROR")\', \'impactLevel("APPLICATION")\'. Defaults to open problems.'),
        entitySelector: z
            .string()
            .optional()
            .describe('Entity scope, e.g. \'type("SERVICE"),tag("team:backend")\''),
        fields: z
            .string()
            .optional()
            .describe('Extra fields, e.g. "+evidenceDetails,+recentComments"'),
        sort: z.string().optional().describe('Sort, e.g. "-startTime" (prefix - for descending)'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 50)'),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, problemSelector, entitySelector, fields, sort, pageSize, from, to }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/problems', {
                query: { problemSelector, entitySelector, fields, from, to, sort, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace problems', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace problems');
        }
    },
});

export const getProblem = tool({
    description: 'Get a single Davis problem with evidence, impacted entities, root cause and recent comments. Requires problems.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemId: z.string().describe('Problem ID, e.g. "1234567890123456789_1234567890123"'),
        fields: z.string().optional().describe('Extra fields, e.g. "+evidenceDetails,+recentComments"'),
    }),
    execute: async ({ dynatraceCredentials, problemId, fields }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/problems/${encodeURIComponent(problemId)}`,
                { query: { fields } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace problem "${problemId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace problem "${problemId}"`);
        }
    },
});

export const closeProblem = tool({
    description: 'Manually close an open Davis problem, leaving a closing comment. Requires problems.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemId: z.string().describe('Problem ID to close'),
        message: z.string().describe('Closing comment, e.g. "Fixed by rolling back deploy v42"'),
    }),
    execute: async ({ dynatraceCredentials, problemId, message }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/problems/${encodeURIComponent(problemId)}/close`,
                { method: 'POST', query: { message } },
            );
            if (!result.ok)
                return failedResult(`Failed to close Dynatrace problem "${problemId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error closing Dynatrace problem "${problemId}"`);
        }
    },
});

export const listProblemComments = tool({
    description: 'List comments on a Davis problem (triage notes, updates). Requires problems.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemId: z.string().describe('Problem ID'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Comments per page (default 10)'),
    }),
    execute: async ({ dynatraceCredentials, problemId, pageSize }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/problems/${encodeURIComponent(problemId)}/comments`,
                { query: { pageSize } },
            );
            if (!result.ok)
                return failedResult(`Failed to list comments for problem "${problemId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error listing comments for problem "${problemId}"`);
        }
    },
});

export const addProblemComment = tool({
    description: 'Add a comment to a Davis problem (triage note, status update). Requires problems.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemId: z.string().describe('Problem ID'),
        message: z.string().describe('Comment text'),
        context: z.string().optional().describe('Optional comment context label'),
    }),
    execute: async ({ dynatraceCredentials, problemId, message, context }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/problems/${encodeURIComponent(problemId)}/comments`,
                { method: 'POST', query: { message, context } },
            );
            if (!result.ok)
                return failedResult(`Failed to add comment to problem "${problemId}"`, result);
            return { success: true, problemId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error adding comment to problem "${problemId}"`);
        }
    },
});

export const updateProblemComment = tool({
    description: 'Update a comment on a Davis problem. Requires problems.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemId: z.string().describe('Problem ID'),
        commentId: z.string().describe('Comment ID to update'),
        message: z.string().describe('Replacement comment text'),
        context: z.string().optional().describe('Optional replacement context label'),
    }),
    execute: async ({ dynatraceCredentials, problemId, commentId, message, context }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/problems/${encodeURIComponent(problemId)}/comments/${encodeURIComponent(commentId)}`,
                { method: 'PUT', query: { message, context } },
            );
            if (!result.ok)
                return failedResult(`Failed to update comment on problem "${problemId}"`, result);
            return { success: true, problemId, commentId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error updating comment on problem "${problemId}"`);
        }
    },
});

export const deleteProblemComment = tool({
    description: 'Delete a comment from a Davis problem. Requires problems.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        problemId: z.string().describe('Problem ID'),
        commentId: z.string().describe('Comment ID to delete'),
    }),
    execute: async ({ dynatraceCredentials, problemId, commentId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/problems/${encodeURIComponent(problemId)}/comments/${encodeURIComponent(commentId)}`,
                { method: 'DELETE' },
            );
            if (!result.ok)
                return failedResult(`Failed to delete comment on problem "${problemId}"`, result);
            return { success: true, problemId, commentId, statusCode: result.status };
        } catch (error) {
            return toDynatraceError(error, `Error deleting comment on problem "${problemId}"`);
        }
    },
});

export const listSecurityProblems = tool({
    description:
        'List Dynatrace application-security vulnerabilities (security problems) with risk scores, affected entities and CVE references. Requires securityProblems.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        securityProblemSelector: z
            .string()
            .optional()
            .describe('Selector, e.g. \'status("OPEN")\', \'riskLevel("CRITICAL")\''),
        sort: z.string().optional().describe('Sort, e.g. "-firstSeenTimestamp"'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 50)'),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, securityProblemSelector, sort, pageSize, from, to }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/securityProblems', {
                query: { securityProblemSelector, from, to, sort, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace security problems', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace security problems');
        }
    },
});

export const getSecurityProblem = tool({
    description: 'Get a single Dynatrace security problem with vulnerabilities, reachable data assets and remediation. Requires securityProblems.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        securityProblemId: z.string().describe('Security problem ID'),
    }),
    execute: async ({ dynatraceCredentials, securityProblemId }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/securityProblems/${encodeURIComponent(securityProblemId)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get security problem "${securityProblemId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting security problem "${securityProblemId}"`);
        }
    },
});
