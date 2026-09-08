// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getInstallation = tool({
    description: 'Get a specific installation for the authenticated GitHub App.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        installation_id: z.number().describe('The unique identifier of the installation'),
    }),
    execute: async ({ githubToken, installation_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.apps.getInstallation({
                installation_id,
            });
            return {
                id: data.id,
                account: (data.account as any)?.login || (data.account as any)?.name,
                app_id: data.app_id,
                target_type: data.target_type,
                permissions: data.permissions,
                events: data.events,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };
        } catch (error: any) {
            return { error: `Failed to get installation: ${error.message}` };
        }
    },
});
