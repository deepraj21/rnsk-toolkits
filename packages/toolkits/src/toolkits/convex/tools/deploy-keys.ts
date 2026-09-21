// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexMgmt, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const convexCreateDeployKey = tool({
    description:
        'Create a deploy key for CLI development or deployment workflows. The key grants admin access — store it securely and confirm with the user first.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe('Deployment to create the key for'),
        name: z.string().describe("Human-readable key name, e.g. 'ci-cd-key'"),
    }),
    execute: async ({ convexToken, deploymentName, name }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'POST', `/deployments/${deploymentName}/create_deploy_key`, {
                body: { name },
            });
        } catch (error) {
            return toConvexError(error, 'Failed to create deploy key');
        }
    },
});

export const convexListDeployKeys = tool({
    description:
        'List deploy keys for a deployment (names, creators, creation and last-used times). Key values are not returned — create a new key if one is lost.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe('Deployment to list keys for'),
    }),
    execute: async ({ convexToken, deploymentName }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'GET', `/deployments/${deploymentName}/list_deploy_keys`);
            return Array.isArray(data) ? { deploy_keys: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to list deploy keys');
        }
    },
});
