// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralDownload, decodeBuffer } from './client.js';

const MAX_INLINE_BYTES = 2 * 1024 * 1024; // 2 MiB

export const mistralGetFileContent = tool({
  description:
    'Downloads a Mistral file’s content: text files come back as utf8 content (JSONL fine-tune/batch files are parsed into objects), binary files as base64. Files larger than 2 MiB return metadata only — use mistralGetFileUrl for those.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    fileId: z.string().min(1).describe('File id from mistralUploadFile / mistralListFiles'),
  }),
  execute: async ({ mistralToken, fileId }) => {
    if (!fileId) return { error: 'fileId is required.' };

    const result = await mistralDownload(
      mistralToken,
      `/files/${encodeURIComponent(fileId)}/content`,
    );
    if (result.error) return result;

    const buffer = result.buffer ?? Buffer.alloc(0);

    if (buffer.length > MAX_INLINE_BYTES) {
      return {
        encoding: 'omitted',
        size: buffer.length,
        contentType: result.contentType,
        note: 'File exceeds the 2 MiB inline limit, so content was not returned. Use mistralGetFileUrl to get a temporary download URL instead.',
      };
    }

    const decoded = decodeBuffer(buffer);

    // JSONL (fine-tune / batch files): parse each line when it looks like JSON.
    if (decoded.encoding === 'utf8' && decoded.content.trimStart().startsWith('{')) {
      const lines = decoded.content.split('\n').filter((l) => l.trim());
      const parsed = lines.map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return l;
        }
      });
      if (parsed.length > 0 && parsed.every((p) => typeof p === 'object')) {
        return { encoding: 'jsonl', count: parsed.length, records: parsed, size: buffer.length };
      }
    }

    return { ...decoded, size: buffer.length, contentType: result.contentType };
  },
});
