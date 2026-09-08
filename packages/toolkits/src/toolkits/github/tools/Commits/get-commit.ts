// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getCommit = tool({
    description: 'Get a commit',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('The account owner of the repository. The name is not case sensitive.'),
        repo: z.string().describe('The name of the repository without the .git extension. The name is not case sensitive.'),
        ref: z.string().describe('The commit reference. Can be a commit SHA, branch name, or tag name.'),
        perPage: z.number().optional().default(30),
        page: z.number().optional().default(1),
    }),
    execute: async ({ githubToken, owner, repo, ref, perPage = 30, page = 1 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getCommit({
                owner,
                repo,
                ref,
                per_page: perPage,
                page,
            });
            return { commit: data };
        } catch (error: any) {
            return { error: `Failed to get commit: ${error.message}` };
        }
    },
});
