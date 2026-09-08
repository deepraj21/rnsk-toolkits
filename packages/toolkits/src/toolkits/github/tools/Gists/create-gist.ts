// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createGist = tool({
    description: 'Create a new gist.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        description: z.string().optional().describe('Description of the gist'),
        public: z.boolean().optional().default(false).describe('True for public, false for secret'),
        files: z.record(z.string(), z.object({
            content: z.string().describe('File content'),
        })).describe('Object where keys are filenames and values are objects with content'),
    }),
    execute: async ({ githubToken, description, public: isPublic = false, files }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.gists.create({
                description,
                public: isPublic,
                files,
            });
            return {
                id: data.id,
                html_url: data.html_url,
                files: Object.keys(data.files || {}),
            };
        } catch (error: any) {
            return { error: `Failed to create gist: ${error.message}` };
        }
    },
});
