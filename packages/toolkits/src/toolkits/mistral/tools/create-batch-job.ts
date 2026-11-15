// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest, compact } from './client.js';

export const mistralCreateBatchJob = tool({
  description:
    'Creates an async batch job that runs many inference requests at a reduced rate. Provide inputFiles (uploaded file ids, one JSONL row per request) or an inline requests array, plus the endpoint (e.g. "/v1/chat/completions") and model (or an agent_id). Returns the queued job — poll with mistralGetBatchJob until status is SUCCESS/FAILED.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    endpoint: z
      .string()
      .describe(
        'Inference endpoint to run, e.g. "/v1/chat/completions", "/v1/embeddings", "/v1/fim/completions"',
      ),
    inputFiles: z
      .array(z.string())
      .optional()
      .describe(
        'Uploaded file ids containing the request JSONL (purpose "batch") — alternative to requests',
      ),
    requests: z
      .array(z.record(z.unknown()))
      .optional()
      .describe('Inline request objects (max 10000) — alternative to inputFiles'),
    model: z.string().optional().describe('Model ID (required unless agent_id is given)'),
    agentId: z
      .string()
      .optional()
      .describe('Agent id to run the batch with, instead of a plain model'),
    metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata stored on the job'),
    timeoutHours: z.number().min(1).optional().describe('Hours before the job times out'),
  }),
  execute: async ({
    mistralToken,
    endpoint,
    inputFiles,
    requests,
    model,
    agentId,
    metadata,
    timeoutHours,
  }) => {
    if (!endpoint) return { error: 'endpoint is required.' };
    if ((!inputFiles || inputFiles.length === 0) && (!requests || requests.length === 0)) {
      return { error: 'Provide inputFiles (file ids) or requests (inline request objects).' };
    }
    if (!model && !agentId) return { error: 'Provide model or agentId.' };

    const result = await mistralRequest(mistralToken, '/batch/jobs', {
      method: 'POST',
      body: compact({
        endpoint,
        input_files: inputFiles && inputFiles.length > 0 ? inputFiles : undefined,
        requests: requests && requests.length > 0 ? requests : undefined,
        model,
        agent_id: agentId,
        metadata,
        timeout_hours: timeoutHours,
      }),
    });
    if (result.error) return result;

    return result.data;
  },
});
