// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const removeIssueLabel = tool({
    description: 'Remove a label from a GitHub issue.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        label: z.string().describe('Label name'),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, label }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.issues.removeLabel({
                owner,
                repo,
                issue_number: issueNumber,
                name: label,
            });
            return { message: `Removed label ${label} from issue #${issueNumber}` };
        } catch (error: any) {
            return { error: `Failed to remove label: ${error.message}` };
        }
    },
});
