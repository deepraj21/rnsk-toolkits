// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const unlockIssue = tool({
    description: 'Unlock a GitHub issue. Use when the user wants to unlock an issue to allow new comments.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        issue_number: z.number().describe('The number that identifies the issue'),
    }),
    execute: async ({ githubToken, owner, repo, issue_number }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.issues.unlock({
                owner,
                repo,
                issue_number,
            });
            return { message: `Successfully unlocked issue #${issue_number} in ${owner}/${repo}` };
        } catch (error: any) {
            return { error: `Failed to unlock issue: ${error.message}` };
        }
    },
});
