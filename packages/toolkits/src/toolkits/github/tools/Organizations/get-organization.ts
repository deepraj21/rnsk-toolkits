// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getOrganization = tool({
    description: 'Get an organization.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
    }),
    execute: async ({ githubToken, org }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.orgs.get({
                org,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                login: data.login,
                id: data.id,
                url: data.url,
                repos_url: data.repos_url,
                events_url: data.events_url,
                hooks_url: data.hooks_url,
                issues_url: data.issues_url,
                members_url: data.members_url,
                public_members_url: data.public_members_url,
                avatar_url: data.avatar_url,
                description: data.description,
                name: data.name,
                company: data.company,
                blog: data.blog,
                location: data.location,
                email: data.email,
                twitter_username: data.twitter_username,
                is_verified: data.is_verified,
                has_organization_projects: data.has_organization_projects,
                has_repository_projects: data.has_repository_projects,
                public_repos: data.public_repos,
                public_gists: data.public_gists,
                followers: data.followers,
                following: data.following,
                html_url: data.html_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                type: data.type,
            };
        } catch (error: any) {
            return { error: `Failed to get organization: ${error.message}` };
        }
    },
});
