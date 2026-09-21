// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexDeployment, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const convexListLogStreams = tool({
    description:
        'List log stream configurations (Datadog, Webhook, Axiom, Sentry) for a deployment, with per-stream status.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentUrl: z.string().describe("Full deployment URL, e.g. 'https://quiet-llama-744.convex.cloud'"),
    }),
    execute: async ({ convexToken, deploymentUrl }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexDeployment(convexToken, deploymentUrl, 'GET', '/api/v1/list_log_streams');
            return Array.isArray(data) ? { log_streams: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to list log streams');
        }
    },
});
