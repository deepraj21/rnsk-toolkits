// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getGist = tool({
    description: 'Get a specific gist.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        gistId: z.string().describe('ID of the gist'),
    }),
    execute: async ({ githubToken, gistId }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.gists.get({
                gist_id: gistId,
            });
            return {
                id: data.id,
                description: data.description,
                public: data.public,
                owner: data.owner?.login,
                files: Object.entries(data.files || {}).reduce((acc, [filename, file]) => {
                    acc[filename] = {
                        content: file?.content,
                        size: file?.size,
                        truncated: file?.truncated,
                        language: file?.language,
                    };
                    return acc;
                }, {} as Record<string, any>),
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get gist: ${error.message}` };
        }
    },
});
