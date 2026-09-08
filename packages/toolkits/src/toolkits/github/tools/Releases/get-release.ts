// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getRelease = tool({
    description: 'Get a release.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        release_id: z.number().describe('The unique identifier of the release'),
    }),
    execute: async ({ githubToken, owner, repo, release_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.getRelease({
                owner,
                repo,
                release_id,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                tag_name: data.tag_name,
                name: data.name,
                body: data.body,
                draft: data.draft,
                prerelease: data.prerelease,
                created_at: data.created_at,
                published_at: data.published_at,
                html_url: data.html_url,
                assets: data.assets.map(asset => ({
                    id: asset.id,
                    name: asset.name,
                    size: asset.size,
                    download_count: asset.download_count,
                    browser_download_url: asset.browser_download_url,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to get release: ${error.message}` };
        }
    },
});
