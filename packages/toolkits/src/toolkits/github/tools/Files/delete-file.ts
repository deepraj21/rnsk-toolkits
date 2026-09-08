// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteFile = tool({
    description: 'Delete a file from a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        path: z.string().describe('Path to the file'),
        message: z.string().describe('Commit message'),
        sha: z.string().describe('SHA of the file to delete'),
        branch: z.string().optional().describe('Branch name'),
    }),
    execute: async ({ githubToken, owner, repo, path, message, sha, branch }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.deleteFile({
                owner,
                repo,
                path,
                message,
                sha,
                branch,
            });
            return {
                commit: data.commit.sha,
                message: 'File deleted successfully',
            };
        } catch (error: any) {
            return { error: `Failed to delete file: ${error.message}` };
        }
    },
});
