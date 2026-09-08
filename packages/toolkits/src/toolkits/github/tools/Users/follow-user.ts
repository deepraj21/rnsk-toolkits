// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const followUser = tool({
    description: 'Follow or unfollow a GitHub user.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        username: z.string().describe('Username of the user to follow/unfollow'),
        action: z.enum(['follow', 'unfollow']).describe('Action to perform'),
    }),
    execute: async ({ githubToken, username, action }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            if (action === 'follow') {
                await octokit.rest.users.follow({
                    username,
                });
                return { message: `Followed user ${username}` };
            } else {
                await octokit.rest.users.unfollow({
                    username,
                });
                return { message: `Unfollowed user ${username}` };
            }
        } catch (error: any) {
            return { error: `Failed to ${action} user: ${error.message}` };
        }
    },
});
