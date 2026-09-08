// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getCodeScanningAlert = tool({
    description: 'Get a code scanning alert.',
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
            const { data } = await octokit.rest.codeScanning.getAlert({
                owner,
                repo,
                alert_number,
            });
            return {
                number: data.number,
                state: data.state,
                rule: {
                    id: data.rule?.id,
                    description: data.rule?.description,
                    severity: data.rule?.severity,
                },
                created_at: data.created_at,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to get code scanning alert: ${error.message}` };
        }
    },
});
