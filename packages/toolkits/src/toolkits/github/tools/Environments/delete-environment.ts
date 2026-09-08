// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteEnvironment = tool({
    description: 'Delete an environment from a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        environment_name: z.string().describe('The name of the environment'),
    }),
    execute: async ({ githubToken, owner, repo, environment_name }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.repos.deleteAnEnvironment({
                owner,
                repo,
                environment_name,
            });
            return { message: `Successfully deleted environment ${environment_name}` };
        } catch (error: any) {
            return { error: `Failed to delete environment: ${error.message}` };
        }
    },
});
