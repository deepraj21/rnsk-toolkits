// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const addIssueAssignees = tool({
    description: 'Add assignees to a GitHub issue.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        issueNumber: z.number().describe('Issue number'),
        assignees: z.array(z.string()).describe('Array of usernames'),
    }),
    execute: async ({ githubToken, owner, repo, issueNumber, assignees }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.issues.addAssignees({
                owner,
                repo,
                issue_number: issueNumber,
                assignees,
            });
            return {
                assignees: data.assignees?.map((a) => a.login),
            };
        } catch (error: any) {
            return { error: `Failed to add assignees: ${error.message}` };
        }
    },
});
