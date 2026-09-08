// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateRelease = tool({
    description: 'Update a release.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        release_id: z.number().describe('The unique identifier of the release'),
        tag_name: z.string().optional().describe('The name of the tag'),
        target_commitish: z.string().optional().describe('Specifies the commitish value that determines where the Git tag is created from'),
        name: z.string().optional().describe('The name of the release'),
        body: z.string().optional().describe('Text describing the contents of the tag'),
        draft: z.boolean().optional().describe('true to create a draft (unpublished) release, false to create a published one'),
        prerelease: z.boolean().optional().describe('true to identify the release as a prerelease, false to identify the release as a full release'),
    }),
    execute: async ({ githubToken, owner, repo, release_id, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.updateRelease({
                owner,
                repo,
                release_id,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                tag_name: data.tag_name,
                name: data.name,
                body: data.body,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to update release: ${error.message}` };
        }
    },
});
