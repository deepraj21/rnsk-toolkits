// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createIssueReaction = tool({
    description: 'Create a reaction for an issue.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        owner: z.string().describe('Repository owner (username or org)'),
        repo: z.string().describe('Repository name'),
        issue_number: z.number().describe('The number of the issue'),
        content: z.enum(['+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes']).describe('The reaction type to add'),
    }),
    execute: async ({ githubToken, owner, repo, issue_number, content }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.reactions.createForIssue({
                owner,
                repo,
                issue_number,
                content,
            });
            if (!data) return { error: 'No data returned from GitHub API' };
            return {
                id: data.id,
                user: data.user?.login,
                content: data.content,
                created_at: data.created_at,
            };
        } catch (error: any) {
            return { error: `Failed to create issue reaction: ${error.message}` };
        }
    },
});
