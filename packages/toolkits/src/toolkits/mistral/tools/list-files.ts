// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralListFiles = tool({
  description:
    'Lists files in the Mistral workspace with their id, purpose, size, and mimetype. Filter by purpose, mimetype, search text, or source; page through with page/pageSize (page is 0-indexed). includeTotal returns the total count.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    page: z.number().min(0).optional().describe('Page number, 0-indexed (default 0)'),
    pageSize: z.number().min(1).optional().describe('Items per page (default 100)'),
    includeTotal: z
      .boolean()
      .optional()
      .describe('Include the total number of files (default true)'),
    search: z.string().optional().describe('Substring filter on the filename'),
    purpose: z
      .enum(['fine-tune', 'batch', 'ocr', 'agentic_safety'])
      .optional()
      .describe('Filter by file purpose'),
    mimetypes: z.array(z.string()).optional().describe('Filter by one or more MIME types'),
    sampleType: z
      .array(z.enum(['pretrain', 'instruct', 'batch_request', 'batch_result', 'batch_error']))
      .optional()
      .describe('Filter by sample type'),
    source: z
      .array(z.enum(['upload', 'repository', 'mistral']))
      .optional()
      .describe('Filter by file source'),
  }),
  execute: async ({
    mistralToken,
    page,
    pageSize,
    includeTotal,
    search,
    purpose,
    mimetypes,
    sampleType,
    source,
  }) => {
    const result = await mistralRequest(mistralToken, '/files', {
      query: {
        page,
        page_size: pageSize,
        include_total: includeTotal,
        search,
        purpose,
        mimetypes,
        sample_type: sampleType,
        source,
      },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      object: data.object,
      data: Array.isArray(data.data) ? data.data : [],
      total: data.total,
    };
  },
});
