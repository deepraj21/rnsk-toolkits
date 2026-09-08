// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateAuthenticatedUser = tool({
    description: 'Update the authenticated GitHub user profile.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        name: z.string().optional().describe('The new name of the user.'),
        email: z.string().optional().describe('The publicly visible email address.'),
        blog: z.string().optional().describe('The new blog URL of the user.'),
        company: z.string().optional().describe('The new company of the user.'),
        location: z.string().optional().describe('The new location of the user.'),
        hireable: z.boolean().optional().describe('The new hireable status of the user.'),
        bio: z.string().optional().describe('The new short biography of the user.'),
    }),
    execute: async ({ githubToken, name, email, blog, company, location, hireable, bio }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.users.updateAuthenticated({
                name,
                email,
                blog,
                company,
                location,
                hireable,
                bio,
            });
            return data;
        } catch (error: any) {
            return { error: `Failed to update authenticated user: ${error.message}` };
        }
    },
});
