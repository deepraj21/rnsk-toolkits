// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateProject = tool({
    description: 'Update a project.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        project_id: z.number().describe('The unique identifier of the project'),
        name: z.string().optional().describe('The name of the project'),
        body: z.string().optional().describe('The body of the project'),
        state: z.enum(['open', 'closed']).optional().describe('State of the project'),
        organization_permission: z.enum(['read', 'write', 'admin', 'none']).optional().describe('The baseline permission that all organization members have on this project'),
        private: z.boolean().optional().describe('Whether or not this project can be seen by everyone'),
    }),
    execute: async ({ githubToken, project_id, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await (octokit.rest.projects as any).update({
                project_id,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            const d = data as any;
            return {
                id: d.id,
                name: d.name,
                state: d.state,
                updated_at: d.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to update project: ${error.message}` };
        }
    },
});
