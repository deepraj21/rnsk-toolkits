// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listUserAccountIssues = tool({
    description:
        'List issues assigned to the authenticated user across their own user repositories.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        filter: z.enum(['assigned', 'created', 'mentioned', 'subscribed', 'all']).optional().describe('Indicates which sorts of issues to return.'),
        state: z.enum(['open', 'closed', 'all']).optional().describe('Indicates the state of the issues to return.'),
        labels: z.string().optional().describe('A list of comma separated label names.'),
        sort: z.enum(['created', 'updated', 'comments']).optional().describe('What to sort results by.'),
        direction: z.enum(['asc', 'desc']).optional().describe('The direction to sort the results by.'),
        since: z.string().optional().describe('Only show issues updated after this time (ISO 8601 format).'),
        per_page: z.number().optional().describe('The number of results per page (max 100).'),
        page: z.number().optional().describe('Page number of the results to fetch.'),
    }),
    execute: async ({ githubToken, ...params }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        const { data } = await octokit.rest.issues.list({
            ...params,
        });
        return data.map((issue) => ({
            number: issue.number,
            title: issue.title,
            state: issue.state,
            repository: issue.repository?.full_name,
            html_url: issue.html_url,
            created_at: issue.created_at,
        }));
    },
});
