// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateCodeScanningAlert = tool({
    description: 'Update a code scanning alert.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        alert_number: z.number().describe('The alert number'),
        state: z.enum(['open', 'dismissed']).describe('The state to set'),
        dismissed_reason: z.enum(['false positive', 'won\'t fix', 'used in tests']).optional().describe('Required when state is dismissed'),
    }),
    execute: async ({ githubToken, owner, repo, alert_number, state, dismissed_reason }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.codeScanning.updateAlert({
                owner,
                repo,
                alert_number,
                state,
                dismissed_reason,
            });
            return {
                number: data.number,
                state: data.state,
                dismissed_reason: data.dismissed_reason,
            };
        } catch (error: any) {
            return { error: `Failed to update code scanning alert: ${error.message}` };
        }
    },
});
