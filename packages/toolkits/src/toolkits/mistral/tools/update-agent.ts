// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralUpdateAgent = tool({
  description:
    'Updates an existing Mistral agent (partial update — send only the fields to change). Can change name, instructions, model, tools, handoffs, guardrails, and metadata; add versionMessage to describe the change as a new version.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    agentId: z.string().min(1).describe('Agent id to update'),
    name: z.string().optional().describe('New agent name'),
    instructions: z.string().optional().describe('New system prompt'),
    description: z.string().optional().describe('New description'),
    model: z.string().optional().describe('New base model ID'),
    tools: z.array(z.record(z.unknown())).optional().describe('Replacement tool definitions'),
    handoffs: z.array(z.string()).optional().describe('Replacement handoff agent ids'),
    completionArgs: z
      .record(z.unknown())
      .optional()
      .describe('Replacement default completion arguments'),
    guardrails: z.record(z.unknown()).optional().describe('Replacement guardrail configuration'),
    deploymentChat: z.boolean().optional().describe('Update the chat-deployment state'),
    metadata: z.record(z.unknown()).optional().describe('Replacement metadata'),
    versionMessage: z.string().optional().describe('Message describing this version'),
  }),
  execute: async ({
    mistralToken,
    agentId,
    name,
    instructions,
    description,
    model,
    tools,
    handoffs,
    completionArgs,
    guardrails,
    deploymentChat,
    metadata,
    versionMessage,
  }) => {
    if (!agentId) return { error: 'agentId is required.' };

    const body = compact({
      name,
      instructions,
      description,
      model,
      tools,
      handoffs,
      completion_args: completionArgs,
      guardrails,
      deployment_chat: deploymentChat,
      metadata,
      version_message: versionMessage,
    });
    if (Object.keys(body).length === 0) {
      return { error: 'Provide at least one field to update.' };
    }

    const result = await mistralRequest(mistralToken, `/agents/${encodeURIComponent(agentId)}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;

    return result.data;
  },
});
