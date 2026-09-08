// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const generateReleaseNotes = tool({
    description: 'Generate release notes content for a release.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        tag_name: z.string().describe('The name of the tag'),
        target_commitish: z.string().optional().describe('Specifies the commitish value that will be the target for the release\'s tag'),
        previous_tag_name: z.string().optional().describe('The name of the previous tag to use as the starting point for the release notes'),
        configuration_file_path: z.string().optional().describe('Specifies a path to a file in the repository containing configuration settings used for generating release notes'),
    }),
    execute: async ({ githubToken, owner, repo, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.generateReleaseNotes({
                owner,
                repo,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                name: data.name,
                body: data.body,
            };
        } catch (error: any) {
            return { error: `Failed to generate release notes: ${error.message}` };
        }
    },
});
