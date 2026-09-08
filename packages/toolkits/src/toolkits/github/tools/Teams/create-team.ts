// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createTeam = tool({
    description: 'Create a team.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        name: z.string().describe('The name of the team'),
        description: z.string().optional().describe('The description of the team'),
        maintainers: z.array(z.string()).optional().describe('List of GitHub usernames for organization members who will become team maintainers'),
        repo_names: z.array(z.string()).optional().describe('The full name (e.g., "organization-name/repository-name") of repositories to add the team to'),
        privacy: z.enum(['secret', 'closed']).optional().describe('The level of privacy this team should have'),
        permission: z.enum(['pull', 'push', 'admin', 'maintain', 'triage']).optional().describe('The default permission for new repositories added to this team'),
        parent_team_id: z.number().optional().describe('The ID of a team to set as the parent team'),
    }),
    execute: async ({ githubToken, org, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.teams.create({
                org,
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
                url: data.url,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to create team: ${error.message}` };
        }
    },
});
