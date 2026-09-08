// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteTeam = tool({
    description: 'Delete a team.',
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
            await octokit.rest.teams.deleteInOrg({
                org,
                team_slug,
            });
            return { message: `Successfully deleted team ${team_slug} from ${org}` };
        } catch (error: any) {
            return { error: `Failed to delete team: ${error.message}` };
        }
    },
});
