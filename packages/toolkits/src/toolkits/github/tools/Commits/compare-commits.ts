// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const compareCommits = tool({
    description: 'Compare two commits',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('The account owner of the repository. The name is not case sensitive.'),
        repo: z.string().describe('The name of the repository without the .git extension. The name is not case sensitive.'),
        base: z.string().describe('The base branch or commit SHA to compare against.'),
        head: z.string().describe('The head branch or commit SHA to compare.'),
        perPage: z.number().optional().default(30),
        page: z.number().optional().default(1),
    }),
    execute: async ({ githubToken, owner, repo, base, head, perPage = 30, page = 1 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.compareCommits({
                owner,
                repo,
                base,
                head,
                per_page: perPage,
                page,
            });
            return { comparison: data };
        } catch (error: any) {
            return { error: `Failed to compare commits: ${error.message}` };
        }
    },
});
