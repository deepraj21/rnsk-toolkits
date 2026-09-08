// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getTeam = tool({
    description: 'Get a team by name (slug).',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        team_slug: z.string().describe('The slug of the team'),
    }),
    execute: async ({ githubToken, org, team_slug }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.teams.getByName({
                org,
                team_slug,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                name: data.name,
                slug: data.slug,
                description: data.description,
                privacy: data.privacy,
                permission: data.permission,
                members_count: data.members_count,
                repos_count: data.repos_count,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to get team: ${error.message}` };
        }
    },
});
