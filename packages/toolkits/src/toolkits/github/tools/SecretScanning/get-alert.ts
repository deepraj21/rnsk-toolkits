// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getSecretScanningAlert = tool({
    description: 'Get a secret scanning alert.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        alert_number: z.number().describe('The alert number'),
    }),
    execute: async ({ githubToken, owner, repo, alert_number }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.secretScanning.getAlert({
                owner,
                repo,
                alert_number,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                number: data.number,
                created_at: data.created_at,
                updated_at: data.updated_at,
                url: data.url,
                html_url: data.html_url,
                state: data.state,
                resolution: data.resolution,
                resolved_at: data.resolved_at,
                resolved_by: data.resolved_by?.login,
                secret_type: data.secret_type,
                secret: data.secret,
            };
        } catch (error: any) {
            return { error: `Failed to get secret scanning alert: ${error.message}` };
        }
    },
});
