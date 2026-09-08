// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getLicense = tool({
    description: 'Get an individual license.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        license: z.string().describe('The key of the license (e.g., mit)'),
    }),
    execute: async ({ githubToken, license }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.licenses.get({
                license,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                key: data.key,
                name: data.name,
                spdx_id: data.spdx_id,
                url: data.url,
                node_id: data.node_id,
                description: data.description,
                implementation: data.implementation,
                permissions: data.permissions,
                conditions: data.conditions,
                limitations: data.limitations,
                body: data.body,
                featured: data.featured,
            };
        } catch (error: any) {
            return { error: `Failed to get license: ${error.message}` };
        }
    },
});
