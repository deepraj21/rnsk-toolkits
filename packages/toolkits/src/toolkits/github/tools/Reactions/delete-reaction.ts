// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const deleteReaction = tool({
    description: 'Delete a reaction.',
    inputSchema: z.object({
        githubToken: z.string().optional().describe('Injected by system; do not provide'),
        reaction_id: z.number().describe('The unique identifier of the reaction'),
    }),
    execute: async ({ githubToken, reaction_id }) => {
        if (!githubToken) {
            return { error: 'GitHub token is required. Connect GitHub first.' };
        }
        const octokit = new Octokit({ auth: githubToken });
        try {
            await (octokit.rest.reactions as any).deleteLegacy({
                reaction_id,
            });
            return { message: `Successfully deleted reaction ${reaction_id}` };
        } catch (error: any) {
            return { error: `Failed to delete reaction: ${error.message}` };
        }
    },
});
