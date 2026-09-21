// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexMgmt, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const convexDeleteCustomDomain = tool({
    description:
        'Remove a custom domain from a deployment. Specify whether it serves the Convex Cloud backend or the Convex Site frontend. Confirm with the user first.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe('Deployment the domain is configured on'),
        domain: z.string().describe("Custom domain to delete, e.g. 'app.mydomain.com'"),
        requestDestination: z.enum(['convexCloud', 'convexSite']).describe('Domain destination to remove'),
    }),
    execute: async ({ convexToken, deploymentName, domain, requestDestination }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'POST', `/deployments/${deploymentName}/delete_custom_domain`, {
                body: { requestDestination, domain },
            });
            return data && Object.keys(data).length ? data : { success: true, domain };
        } catch (error) {
            return toConvexError(error, 'Failed to delete custom domain');
        }
    },
});
