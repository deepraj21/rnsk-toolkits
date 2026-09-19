// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFilesInAProject = tool({
    description:
        'Lists files in a project, optionally with branch metadata. Get project_id from the team projects list.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        projectId: z.string().describe('Project ID'),
        branchData: z.boolean().optional().describe('Include branch metadata (default false)'),
    }),
    execute: async ({ figmaToken, projectId, branchData }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/projects/${projectId}/files`, {
                query: { branch_data: branchData },
            });
            if (!result.ok) return { error: 'Failed to get project files', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting project files',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
