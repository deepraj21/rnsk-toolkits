// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateSecretScanningAlert = tool({
    description: 'Update a secret scanning alert.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        alert_number: z.number().describe('The alert number'),
        state: z.enum(['open', 'resolved']).describe('The state to set'),
        resolution: z.enum(['false_positive', 'wont_fix', 'revoked', 'used_in_tests']).optional().describe('Required when state is resolved'),
    }),
    execute: async ({ githubToken, owner, repo, alert_number, state, resolution }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.secretScanning.updateAlert({
                owner,
                repo,
                alert_number,
                state,
                resolution: state === 'resolved' ? resolution : undefined,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                number: data.number,
                state: data.state,
                resolution: data.resolution,
            };
        } catch (error: any) {
            return { error: `Failed to update secret scanning alert: ${error.message}` };
        }
    },
});
