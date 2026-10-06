// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ollamaRequest, failedResult, toOllamaError } from './client.js';

const credentialsField = z
  .string()
  .optional()
  .describe(
    'Ollama credentials JSON like {"baseUrl":"http://localhost:11434"}; add "apiKey" for Ollama Cloud; defaults to local Ollama',
  );

export const ollamaListModels = tool({
  description:
    'List locally available Ollama models with size, digest, modified time, and format details.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
  }),
  execute: async ({ ollamaCredentials }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/api/tags');
      if (!result.ok) return failedResult('Failed to list Ollama models', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error listing Ollama models');
    }
  },
});

export const ollamaOpenAiListModels = tool({
  description: 'List available Ollama models in OpenAI model-list format.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
  }),
  execute: async ({ ollamaCredentials }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/v1/models');
      if (!result.ok) return failedResult('Failed to list Ollama models (OpenAI format)', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error listing Ollama models (OpenAI format)');
    }
  },
});

export const ollamaShowModel = tool({
  description:
    'Show comprehensive info about an Ollama model: parameters, template, license, system prompt, capabilities.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
    model: z.string().describe("Model name, e.g. 'llama3.1', 'mistral'"),
    verbose: z.boolean().optional().describe('Include large verbose fields in the response'),
  }),
  execute: async ({ ollamaCredentials, model, verbose }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/api/show', {
        method: 'POST',
        body: { model, ...(verbose !== undefined ? { verbose } : {}) },
      });
      if (!result.ok) return failedResult('Failed to show Ollama model info', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error showing Ollama model info');
    }
  },
});

export const ollamaVersion = tool({
  description: 'Get the version of the running Ollama server.',
  inputSchema: z.object({
    ollamaCredentials: credentialsField,
  }),
  execute: async ({ ollamaCredentials }) => {
    try {
      const result = await ollamaRequest(ollamaCredentials, '/api/version');
      if (!result.ok) return failedResult('Failed to get Ollama version', result);
      return result.data;
    } catch (error) {
      return toOllamaError(error, 'Error getting Ollama version');
    }
  },
});
