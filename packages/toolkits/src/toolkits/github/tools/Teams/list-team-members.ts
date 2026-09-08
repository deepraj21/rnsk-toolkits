// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listTeamMembers = tool({
    description: 'List team members.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        team_slug: z.string().describe('The slug of the team'),
        role: z.enum(['member', 'maintainer', 'all']).optional().describe('Filter members by role'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, org, team_slug, role, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.teams.listMembersInOrg({
                org,
                team_slug,
                role,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(member => ({
                login: member.login,
                id: member.id,
                avatar_url: member.avatar_url,
                type: member.type,
            }));
        } catch (error: any) {
            return { error: `Failed to list team members: ${error.message}` };
        }
    },
});
