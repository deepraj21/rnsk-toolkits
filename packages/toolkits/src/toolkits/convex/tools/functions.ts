// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexDeployment, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

const queryItem = z.object({
    path: z.string().describe("Query function path, e.g. 'messages:list'"),
    args: z.record(z.any()).optional().describe('Named arguments (empty object when none)'),
    format: z.string().optional().describe("Output format (only 'json' is supported)"),
});

export const convexExecuteQueryBatch = tool({
    description:
        'Run multiple query functions against a deployment in one batch call. Results come back in request order with per-query status, value, and log lines.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentUrl: z.string().describe("Full deployment URL, e.g. 'https://quiet-llama-744.convex.cloud'"),
        queries: z.array(queryItem).min(1).describe('Queries to execute in order'),
    }),
    execute: async ({ convexToken, deploymentUrl, queries }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexDeployment(convexToken, deploymentUrl, 'POST', '/api/query_batch', queries);
            return Array.isArray(data) ? { results: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to execute query batch');
        }
    },
});

export const convexGetQueryTimestamp = tool({
    description:
        'Get the latest query timestamp (base64) for a deployment. Use for consistent reads or auditing the deployment state.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe("Deployment name, e.g. 'quiet-llama-744'"),
    }),
    execute: async ({ convexToken, deploymentName }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexDeployment(convexToken, `https://${deploymentName}.convex.cloud`, 'POST', '/api/query_ts');
        } catch (error) {
            return toConvexError(error, 'Failed to get query timestamp');
        }
    },
});
