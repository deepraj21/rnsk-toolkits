// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicDeleteSkill = tool({
  description:
    'Deletes a Claude Skill by ID so it can no longer be used by Claude. Deleting is permanent.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    skillId: z.string().describe('Skill ID to delete'),
  }),
  execute: async ({ anthropicApiKey, skillId }) => {
    if (!skillId) return { error: 'skillId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/skills/${encodeURIComponent(skillId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return result.data ?? { id: skillId, deleted: true };
  },
});
