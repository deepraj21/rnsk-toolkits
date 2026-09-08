// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createOrUpdateFile = tool({
    description: 'Create or update a file in a GitHub repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        path: z.string().describe('Path to the file'),
        message: z.string().describe('Commit message'),
        content: z.string().describe('File content (will be base64 encoded)'),
        sha: z.string().optional().describe('SHA of the file being replaced (required if updating)'),
        branch: z.string().optional().describe('Branch name'),
    }),
    execute: async ({ githubToken, owner, repo, path, message, content, sha, branch }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const encodedContent = Buffer.from(content).toString('base64');
            const { data } = await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: encodedContent,
                sha,
                branch,
            });
            return {
                content: data.content?.name,
                commit: data.commit.sha,
                html_url: data.content?.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to create/update file: ${error.message}` };
        }
    },
});
