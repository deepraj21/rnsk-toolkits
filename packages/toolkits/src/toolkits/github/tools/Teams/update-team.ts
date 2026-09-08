// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateTeam = tool({
    description: 'Update a team.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        team_slug: z.string().describe('The slug of the team'),
        name: z.string().optional().describe('The name of the team'),
        description: z.string().optional().describe('The description of the team'),
        privacy: z.enum(['secret', 'closed']).optional().describe('The level of privacy this team should have'),
        permission: z.enum(['pull', 'push', 'admin', 'maintain', 'triage']).optional().describe('The default permission for new repositories added to this team'),
        parent_team_id: z.number().optional().describe('The ID of a team to set as the parent team'),
    }),
    execute: async ({ githubToken, org, team_slug, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.teams.updateInOrg({
                org,
                team_slug,
                ...options,
            } as any);
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                name: data.name,
                slug: data.slug,
                description: data.description,
                privacy: data.privacy,
                permission: data.permission,
            };
        } catch (error: any) {
            return { error: `Failed to update team: ${error.message}` };
        }
    },
});
