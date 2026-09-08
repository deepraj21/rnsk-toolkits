// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getLatestRelease = tool({
    description: 'Get the latest release for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
    }),
    execute: async ({ githubToken, owner, repo }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getLatestRelease({
                owner,
                repo,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                tag_name: data.tag_name,
                name: data.name,
                body: data.body,
                published_at: data.published_at,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to get latest release: ${error.message}` };
        }
    },
});
