// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteProject = tool({
    description: 'Delete a project.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        project_id: z.number().describe('The unique identifier of the project'),
    }),
    execute: async ({ githubToken, project_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await (octokit.rest.projects as any).delete({
                project_id,
            });
            return { message: `Successfully deleted project ${project_id}` };
        } catch (error: any) {
            return { error: `Failed to delete project: ${error.message}` };
        }
    },
});
