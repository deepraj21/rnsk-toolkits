// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listPullRequestFiles = tool({
    description: 'List files modified in a pull request.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        pullNumber: z.number().describe('Pull request number'),
        perPage: z.number().optional().default(30),
    }),
    execute: async ({ githubToken, owner, repo, pullNumber, perPage = 30 }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.pulls.listFiles({
                owner,
                repo,
                pull_number: pullNumber,
                per_page: perPage,
            });
            return {
                files: data.map((file) => ({
                    filename: file.filename,
                    status: file.status,
                    additions: file.additions,
                    deletions: file.deletions,
                    changes: file.changes,
                })),
                count: data.length,
            };
        } catch (error: any) {
            return { error: `Failed to list PR files: ${error.message}` };
        }
    },
});
