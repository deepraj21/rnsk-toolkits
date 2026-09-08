// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const addIssueLabels = tool({
    description: 'Add labels to a GitHub issue.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        labels: z.array(z.string()).describe('Array of label names'),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, labels }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.issues.addLabels({
                owner,
                repo,
                issue_number: issueNumber,
                labels,
            });
            return {
                labels: data.map((l) => l.name),
            };
        } catch (error: any) {
            return { error: `Failed to add labels: ${error.message}` };
        }
    },
});
