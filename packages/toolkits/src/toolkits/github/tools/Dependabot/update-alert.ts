// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const updateDependabotAlert = tool({
    description: 'Update a Dependabot alert.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        alert_number: z.number().describe('The alert number'),
        state: z.enum(['dismissed', 'open']).describe('The state to set'),
        dismissed_reason: z.enum(['fix_started', 'inaccurate', 'no_bandwidth', 'not_used', 'tolerable_risk']).optional().describe('Required when state is dismissed'),
    }),
    execute: async ({ githubToken, owner, repo, alert_number, state, dismissed_reason }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.dependabot.updateAlert({
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
            return { error: `Failed to update Dependabot alert: ${error.message}` };
        }
    },
});
