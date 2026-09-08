// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listBranchesForHeadCommit = tool({
    description: 'List branches for HEAD commit',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('The account owner of the repository. The name is not case sensitive.'),
        repo: z.string().describe('The name of the repository without the .git extension. The name is not case sensitive.'),
        commit_sha: z.string().describe('The SHA of the commit.'),
    }),
    execute: async ({ githubToken, owner, repo, commit_sha }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listBranchesForHeadCommit({
                owner,
                repo,
                commit_sha,
            });
            return { branches: data };
        } catch (error: any) {
            return { error: `Failed to list branches for HEAD commit: ${error.message}` };
        }
    },
});
