// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const removeTeamRepo = tool({
    description: 'Remove a repository from a team.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        team_slug: z.string().describe('The slug of the team'),
        owner: z.string().describe('The owner of the repository'),
        repo: z.string().describe('The name of the repository'),
    }),
    execute: async ({ githubToken, org, team_slug, owner, repo }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.teams.removeRepoInOrg({
                org,
                team_slug,
                owner,
                repo,
            });
            return { message: `Successfully removed ${owner}/${repo} from team ${team_slug}` };
        } catch (error: any) {
            return { error: `Failed to remove team repo: ${error.message}` };
        }
    },
});
