// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const markNotificationsRead = tool({
    description: 'Mark notifications as read for the authenticated user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        last_read_at: z.string().optional().describe('Describes the last point that notifications were checked (ISO 8601 timestamp)'),
    }),
    execute: async ({ githubToken, last_read_at }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await octokit.rest.activity.markNotificationsAsRead({
                last_read_at: last_read_at ?? new Date().toISOString(),
            });
            return { message: 'Successfully marked notifications as read' };
        } catch (error: any) {
            return { error: `Failed to mark notifications as read: ${error.message}` };
        }
    },
});
