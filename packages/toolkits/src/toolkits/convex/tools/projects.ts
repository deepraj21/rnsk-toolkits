// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { convexMgmt, toConvexError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const teamIdField = z.union([z.string(), z.number()]).describe('Team ID (numeric)');

export const convexCreateProject = tool({
    description:
        'Create a project on a team, optionally provisioning a dev or prod deployment alongside it. Returns the projectId (and deployment URL/name when requested).',
    inputSchema: z.object({
        convexToken: tokenField,
        teamId: teamIdField,
        projectName: z.string().describe('Project name as shown in the dashboard'),
        deploymentType: z.string().optional().describe("Provision a deployment: 'dev' or 'prod' (omit for none)"),
        deploymentClass: z.string().optional().describe('Deployment class (defaults to the team default)'),
        deploymentRegion: z.string().optional().describe('Deployment region (defaults to the team default)'),
    }),
    execute: async ({ convexToken, teamId, projectName, deploymentType, deploymentClass, deploymentRegion }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'POST', `/teams/${teamId}/create_project`, {
                body: {
                    projectName,
                    deploymentType,
                    deploymentClass,
                    deploymentRegion,
                },
            });
        } catch (error) {
            return toConvexError(error, 'Failed to create project');
        }
    },
});

export const convexListProjects = tool({
    description:
        'List all projects for a team by team ID. Use to discover project IDs before deployment operations.',
    inputSchema: z.object({
        convexToken: tokenField,
        teamId: teamIdField,
    }),
    execute: async ({ convexToken, teamId }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            const data = await convexMgmt(convexToken, 'GET', `/teams/${teamId}/projects`);
            return Array.isArray(data) ? { projects: data } : data;
        } catch (error) {
            return toConvexError(error, 'Failed to list projects');
        }
    },
});

export const convexGetProjectById = tool({
    description:
        'Get project metadata (name, slug, team, creation time) by numeric project ID.',
    inputSchema: z.object({
        convexToken: tokenField,
        projectId: z.number().describe('Numeric project ID'),
    }),
    execute: async ({ convexToken, projectId }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'GET', `/projects/${projectId}`);
        } catch (error) {
            return toConvexError(error, 'Failed to get project');
        }
    },
});

export const convexGetProjectBySlug = tool({
    description:
        'Get a project by its human-readable slug within a team. Accepts a numeric team ID or team slug.',
    inputSchema: z.object({
        convexToken: tokenField,
        teamIdOrSlug: z.union([z.string(), z.number()]).describe('Team ID (numeric) or team slug'),
        projectSlug: z.string().describe('Project slug within the team'),
    }),
    execute: async ({ convexToken, teamIdOrSlug, projectSlug }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            return await convexMgmt(convexToken, 'GET', `/teams/${teamIdOrSlug}/projects/${projectSlug}`);
        } catch (error) {
            return toConvexError(error, 'Failed to get project');
        }
    },
});

export const convexDeleteProject = tool({
    description:
        'Permanently delete a project and all its deployments and data. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        convexToken: tokenField,
        projectId: z.number().describe('Numeric project ID to delete'),
    }),
    execute: async ({ convexToken, projectId }) => {
        try {
            const missing = requireToken(convexToken);
            if (missing) return missing;
            await convexMgmt(convexToken, 'POST', `/projects/${projectId}/delete`, { body: {} });
            return { success: true, project_id: projectId };
        } catch (error) {
            return toConvexError(error, 'Failed to delete project');
        }
    },
});
