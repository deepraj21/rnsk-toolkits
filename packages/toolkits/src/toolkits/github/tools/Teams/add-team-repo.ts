// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const addTeamRepo = tool({
    description: 'Add or update team repository permissions.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        team_slug: z.string().describe('The slug of the team'),
        owner: z.string().describe('The owner of the repository'),
        repo: z.string().describe('The name of the repository'),
        permission: z.enum(['pull', 'push', 'admin', 'maintain', 'triage']).optional().describe('The permission to grant the team on this repository'),
    }),
    execute: async ({ githubToken, org, team_slug, owner, repo, permission }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
                org,
                team_slug,
                owner,
                repo,
                permission: permission ?? 'push',
            });
            return { message: `Successfully updated permissions for ${owner}/${repo} for team ${team_slug}` };
        } catch (error: any) {
            return { error: `Failed to add team repo: ${error.message}` };
        }
    },
});
