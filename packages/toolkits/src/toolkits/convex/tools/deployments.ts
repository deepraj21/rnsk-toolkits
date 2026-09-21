// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexMgmt, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const convexCreateDeployment = tool({
    description:
        'Create a dev, prod, or custom deployment in a project, with optional class, reference, and region. Returns the deployment name and URL.',
    inputSchema: z.object({
        convexToken: tokenField,
        projectId: z.number().describe('Numeric project ID'),
        type: z.enum(['dev', 'prod', 'custom']).describe('Deployment type'),
        deploymentClass: z.string().optional().describe('Deployment class (defaults to the team default)'),
        reference: z.string().optional().describe('Unique reference within the project (auto-generated when omitted)'),
        region: z.string().optional().describe('Hosting region (defaults to the team default)'),
    }),
    execute: async ({ convexToken, projectId, type, deploymentClass, reference, region }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'POST', `/projects/${projectId}/create_deployment`, {
                body: {
                    type,
                    class: deploymentClass,
                    reference,
                    region,
                },
            });
        } catch (error) {
            return toConvexError(error, 'Failed to create deployment');
        }
    },
});

export const convexListDeployments = tool({
    description:
        'List deployments for a project (production, preview, and optionally local), with filters for default status, type, and local inclusion.',
    inputSchema: z.object({
        convexToken: tokenField,
        projectId: z.number().describe('Numeric project ID'),
        isDefault: z.boolean().optional().describe('True for default deployments only, false for non-default only'),
        includeLocal: z.boolean().optional().describe('Include local deployments (only your own)'),
        deploymentType: z.string().optional().describe('Filter by deployment type'),
    }),
    execute: async ({ convexToken, projectId, isDefault, includeLocal, deploymentType }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'GET', `/projects/${projectId}/list_deployments`, {
                query: {
                    isDefault,
                    includeLocal,
                    deploymentType,
                },
            });
            return Array.isArray(data) ? { items: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to list deployments');
        }
    },
});

export const convexGetDeployment = tool({
    description:
        'Get details for a deployment by name: configuration, region, creation time, and status.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe("Deployment name, e.g. 'quiet-llama-744'"),
    }),
    execute: async ({ convexToken, deploymentName }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'GET', `/deployments/${deploymentName}`);
        } catch (error) {
            return toConvexError(error, 'Failed to get deployment');
        }
    },
});

export const convexUpdateDeployment = tool({
    description:
        'Update deployment settings (reference, dashboard edit confirmation). Only provided fields are modified.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe('Deployment name to update'),
        reference: z.string().optional().describe('Unique reference (3-100 chars, lowercase, numbers, - and /)'),
        dashboardEditConfirmation: z.boolean().optional().describe('Require dashboard confirmation before edits'),
    }),
    execute: async ({ convexToken, deploymentName, reference, dashboardEditConfirmation }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'PATCH', `/deployments/${deploymentName}`, {
                body: {
                    reference,
                    dashboardEditConfirmation,
                },
            });
            return data && Object.keys(data).length ? data : { success: true, deployment_name: deploymentName };
        } catch (error) {
            return toConvexError(error, 'Failed to update deployment');
        }
    },
});

export const convexDeleteDeployment = tool({
    description:
        'Permanently delete a deployment and all its data and files. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        convexToken: tokenField,
        deploymentName: z.string().describe('Deployment name to delete'),
    }),
    execute: async ({ convexToken, deploymentName }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            await convexMgmt(convexToken, 'POST', `/deployments/${deploymentName}/delete`, { body: {} });
            return { success: true, deployment_name: deploymentName };
        } catch (error) {
            return toConvexError(error, 'Failed to delete deployment');
        }
    },
});
