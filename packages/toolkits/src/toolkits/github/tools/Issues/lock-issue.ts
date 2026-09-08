// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const lockIssue = tool({
    description: 'Lock or unlock a GitHub issue.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        lockReason: z.enum(['off-topic', 'too heated', 'resolved', 'spam']).optional(),
        unlock: z.boolean().optional().describe('If true, unlock the issue. Default is false (lock).'),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, lockReason, unlock = false }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            if (unlock) {
                await octokit.rest.issues.unlock({
                    owner,
                    repo,
                    issue_number: issueNumber,
                });
                return { message: `Unlocked issue #${issueNumber}` };
            } else {
                await octokit.rest.issues.lock({
                    owner,
                    repo,
                    issue_number: issueNumber,
                    lock_reason: lockReason,
                });
                return { message: `Locked issue #${issueNumber}` };
            }
        } catch (error: any) {
            return { error: `Failed to lock/unlock issue: ${error.message}` };
        }
    },
});
