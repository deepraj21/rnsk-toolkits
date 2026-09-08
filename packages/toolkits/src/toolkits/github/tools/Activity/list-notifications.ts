// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listNotifications = tool({
    description: 'List notifications for the authenticated user. Returns unread notifications by default.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        all: z.boolean().optional().describe('If true, show notifications marked as read'),
        participating: z.boolean().optional().describe('If true, only show notifications in which the user is directly participating'),
        per_page: z.number().optional().describe('Number of results per page (max 100)'),
        page: z.number().optional().describe('Page number of results to fetch'),
    }),
    execute: async ({ githubToken, all, participating, per_page, page }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            const { data } = await octokit.rest.activity.listNotificationsForAuthenticatedUser({
                all: all ?? false,
                participating: participating ?? false,
                per_page: per_page ?? 30,
                page: page ?? 1,
            });
            return {
                notifications: data.map(notification => ({
                    id: notification.id,
                    repository: notification.repository?.full_name,
                    subject: {
                        title: notification.subject?.title,
                        type: notification.subject?.type,
                    },
                    reason: notification.reason,
                    unread: notification.unread,
                    updated_at: notification.updated_at,
                })),
            };
        } catch (error: any) {
            return { error: `Failed to list notifications: ${error.message}` };
        }
    },
});
