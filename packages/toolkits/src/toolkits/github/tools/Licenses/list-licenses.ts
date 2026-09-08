// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listLicenses = tool({
    description: 'Get all commonly used licenses.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
    }),
    execute: async ({ githubToken }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.licenses.getAllCommonlyUsed();
            if (!data) return { error: 'No data returned from GitHub API' };
            return data.map(license => ({
                key: license.key,
                name: license.name,
                spdx_id: license.spdx_id,
                url: license.url,
                node_id: license.node_id,
            }));
        } catch (error: any) {
            return { error: `Failed to list licenses: ${error.message}` };
        }
    },
});
