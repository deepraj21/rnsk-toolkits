// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetSkill = tool({
  description:
    'Gets one Claude Skill by ID, including its files, version, display name, and status.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    skillId: z.string().describe('Skill ID from createSkill or listSkills'),
  }),
  execute: async ({ anthropicApiKey, skillId }) => {
    if (!skillId) return { error: 'skillId is required.' };

    const result = await anthropicRequest(
      anthropicApiKey,
      `/v1/skills/${encodeURIComponent(skillId)}`,
    );
    if (result.error) return result;

    return result.data;
  },
});
