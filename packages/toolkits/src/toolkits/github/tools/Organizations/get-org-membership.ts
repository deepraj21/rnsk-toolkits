// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getOrgMembership = tool({
    description: 'Get organization membership for a user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        username: z.string().describe('The handle for the GitHub user'),
    }),
    execute: async ({ githubToken, org, username }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.orgs.getMembershipForUser({
                org,
                username,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                url: data.url,
                state: data.state,
                role: data.role,
                organization_url: data.organization_url,
                organization: data.organization,
                user: data.user,
            };
        } catch (error: any) {
            return { error: `Failed to get org membership: ${error.message}` };
        }
    },
});
