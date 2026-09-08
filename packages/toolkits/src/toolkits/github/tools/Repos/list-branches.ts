// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listBranches = tool({
    description: 'List branches of a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listBranches({
                owner,
                repo,
                per_page: perPage,
            });
            return {
                branches: data.map((branch) => ({
                    name: branch.name,
                    sha: branch.commit.sha,
                    protected: branch.protected,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list branches: ${error.message}` };
        }
    },
});
