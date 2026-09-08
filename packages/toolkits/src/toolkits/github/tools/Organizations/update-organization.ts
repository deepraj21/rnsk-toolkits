// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateOrganization = tool({
    description: 'Update an organization.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        org: z.string().describe('The organization name'),
        billing_email: z.string().optional().describe('Billing email address. This address is use to send notifications about billing for GitHub.com.'),
        company: z.string().optional().describe('The company name'),
        email: z.string().optional().describe('The publicly visible email address'),
        location: z.string().optional().describe('The location'),
        name: z.string().optional().describe('The shorthand name of the company'),
        description: z.string().optional().describe('The description of the company'),
        has_organization_projects: z.boolean().optional().describe('Whether organization projects are enabled'),
        has_repository_projects: z.boolean().optional().describe('Whether repository projects are enabled'),
        default_repository_permission: z.enum(['read', 'write', 'admin', 'none']).optional().describe('Default permission level members have for organization repositories'),
        members_can_create_repositories: z.boolean().optional().describe('Whether of not organization members can create repositories'),
        members_can_create_internal_repositories: z.boolean().optional().describe('Whether of not organization members can create internal repositories'),
        members_can_create_private_repositories: z.boolean().optional().describe('Whether of not organization members can create private repositories'),
        members_can_create_public_repositories: z.boolean().optional().describe('Whether of not organization members can create public repositories'),
        members_allowed_repository_creation_type: z.enum(['all', 'private', 'none']).optional().describe('Specifies which repository creation type is allowed for organization members'),
    }),
    execute: async ({ githubToken, org, ...options }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.orgs.update({
                org,
                ...options,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                login: data.login,
                name: data.name,
                email: data.email,
                description: data.description,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to update organization: ${error.message}` };
        }
    },
});
