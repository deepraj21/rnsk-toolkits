// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexMgmt, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const teamIdField = z.union([z.string(), z.number()]).describe('Team ID (numeric)');

export const convexGetTokenDetails = tool({
    description:
        'Get details for the connected token itself: type (team or project) and the team or project ID it belongs to. No parameters. Use after connecting to identify the token scope.',
    inputSchema: z.object({
        convexToken: tokenField,
    }),
    execute: async ({ convexToken }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'GET', '/token_details');
        } catch (error) {
            return toConvexError(error, 'Failed to get token details');
        }
    },
});

export const convexListDeploymentClasses = tool({
    description:
        'List deployment classes available to a team with availability flags. Use before creating a deployment with an explicit class.',
    inputSchema: z.object({
        convexToken: tokenField,
        teamId: teamIdField,
    }),
    execute: async ({ convexToken, teamId }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'GET', `/teams/${teamId}/list_deployment_classes`);
            return Array.isArray(data) ? { items: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to list deployment classes');
        }
    },
});

export const convexListDeploymentRegions = tool({
    description:
        'List deployment regions available to a team with availability flags. Use before creating a deployment in a specific region.',
    inputSchema: z.object({
        convexToken: tokenField,
        teamId: teamIdField,
    }),
    execute: async ({ convexToken, teamId }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'GET', `/teams/${teamId}/list_deployment_regions`);
            return Array.isArray(data) ? { items: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to list deployment regions');
        }
    },
});
