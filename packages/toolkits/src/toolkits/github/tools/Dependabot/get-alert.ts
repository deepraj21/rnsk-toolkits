// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const getDependabotAlert = tool({
    description: 'Get a Dependabot alert.',
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
            const { data } = await octokit.rest.dependabot.getAlert({
                owner,
                repo,
                alert_number,
            });
            return {
                number: data.number,
                state: data.state,
                dependency: data.dependency,
                security_advisory: data.security_advisory,
                html_url: data.html_url,
            };
        } catch (error: any) {
            return { error: `Failed to get Dependabot alert: ${error.message}` };
        }
    },
});
