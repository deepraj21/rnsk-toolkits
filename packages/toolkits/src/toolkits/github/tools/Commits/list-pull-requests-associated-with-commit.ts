// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listPullRequestsAssociatedWithCommit = tool({
    description: 'List pull requests associated with a commit',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('The account owner of the repository. The name is not case sensitive.'),
        repo: z.string().describe('The name of the repository without the .git extension. The name is not case sensitive.'),
        commit_sha: z.string().describe('The SHA of the commit.'),
        perPage: z.number().optional().default(30),
        page: z.number().optional().default(1),
    }),
    execute: async ({ githubToken, owner, repo, commit_sha, perPage = 30, page = 1 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
                owner,
                repo,
                commit_sha,
                per_page: perPage,
                page,
            });
            return { pullRequests: data };
        } catch (error: any) {
            return { error: `Failed to list PRs associated with commit: ${error.message}` };
        }
    },
});
