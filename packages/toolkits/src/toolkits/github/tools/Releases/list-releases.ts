// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listReleases = tool({
    description: 'List releases for a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, owner, repo, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.listReleases({
                owner,
                repo,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(release => ({
                id: release.id,
                tag_name: release.tag_name,
                target_commitish: release.target_commitish,
                name: release.name,
                body: release.body,
                draft: release.draft,
                prerelease: release.prerelease,
                created_at: release.created_at,
                published_at: release.published_at,
                html_url: release.html_url,
                author: release.author?.login,
            }));
        } catch (error: any) {
            return { error: `Failed to list releases: ${error.message}` };
        }
    },
});
