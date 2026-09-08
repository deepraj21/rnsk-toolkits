// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createRepo = tool({
    description:
        'Create a new repository for the authenticated GitHub user. Use when the user asks to create a new repo, start a new project on GitHub, or initialize a repository.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        name: z.string().describe('The name of the repository.'),
        description: z.string().optional().describe('A short description of the repository.'),
        homepage: z.string().optional().describe('A URL with more information about the repository.'),
        private: z.boolean().optional().default(false).describe('Whether the repository is private.'),
        has_issues: z.boolean().optional().default(true).describe('Whether issues are enabled.'),
        has_projects: z.boolean().optional().default(true).describe('Whether projects are enabled.'),
        has_wiki: z.boolean().optional().default(true).describe('Whether the wiki is enabled.'),
        auto_init: z.boolean().optional().default(false).describe('Whether the repository is initialized with a minimal README.'),
        gitignore_template: z.string().optional().describe('The desired language or platform to apply to the .gitignore. (e.g., "Node", "Python")'),
        license_template: z.string().optional().describe('The license keyword of the open source license for this repository. (e.g., "mit", "apache-2.0")'),
    }),
    execute: async ({
        githubToken,
        name,
        description,
        homepage,
        private: isPrivate,
        has_issues,
        has_projects,
        has_wiki,
        auto_init,
        gitignore_template,
        license_template
    }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.repos.createForAuthenticatedUser({
                name,
                description,
                homepage,
                private: isPrivate,
                has_issues,
                has_projects,
                has_wiki,
                auto_init,
                gitignore_template,
                license_template,
            });
            return {
                success: true,
                repo: {
                    name: data.name,
                    full_name: data.full_name,
                    description: data.description,
                    html_url: data.html_url,
                    private: data.private,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to create repository',
            };
        }
    },
});
