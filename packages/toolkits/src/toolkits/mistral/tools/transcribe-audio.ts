// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralUpload, compact } from './client.js';

export const mistralTranscribeAudio = tool({
  description:
    'Transcribes speech to text with a Mistral audio model (e.g. "voxtral-mini-latest"). Provide audio as file content (base64/utf8 with filename) or reference an existing file by fileUrl/fileId. Supports language, diarization, and word/segment timestamps.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    model: z.string().describe('Audio model ID, e.g. "voxtral-mini-latest"'),
    fileContent: z
      .string()
      .optional()
      .describe('Audio bytes as a string — base64 for binary (mp3/wav/…), or raw text'),
    fileEncoding: z
      .enum(['utf8', 'base64'])
      .optional()
      .describe('How to interpret fileContent (default "utf8"; use "base64" for binary)'),
    filename: z.string().optional().describe('Filename with extension, e.g. "meeting.mp3"'),
    mimeType: z.string().optional().describe('MIME type of the file, e.g. "audio/mpeg"'),
    fileUrl: z
      .string()
      .optional()
      .describe('Public URL of the audio to transcribe (alternative to fileContent)'),
    fileId: z
      .string()
      .optional()
      .describe('File id from mistralUploadFile (alternative to fileContent)'),
    language: z
      .string()
      .regex(/^\w{2}$/, 'Must be a 2-letter language code')
      .optional()
      .describe('Two-letter language code, e.g. "en"'),
    temperature: z.number().min(0).max(1).optional().describe('Sampling temperature (0-1)'),
    diarize: z.boolean().optional().describe('Identify who spoke each segment (speaker labels)'),
    timestampGranularities: z
      .array(z.string())
      .optional()
      .describe('Granularity of timestamps, e.g. ["word", "segment"]'),
    contextBias: z
      .string()
      .optional()
      .describe('Bias the transcription with domain context/keywords'),
    speakerReferences: z
      .array(z.string())
      .optional()
      .describe('Known speaker names to map onto diarized labels'),
  }),
  execute: async ({
    mistralToken,
    model,
    fileContent,
    fileEncoding,
    filename,
    mimeType,
    fileUrl,
    fileId,
    language,
    temperature,
    diarize,
    timestampGranularities,
    contextBias,
    speakerReferences,
  }) => {
    if (!model) return { error: 'model is required.' };
    if (!fileContent && !fileUrl && !fileId) {
      return { error: 'One of fileContent (with filename), fileUrl, or fileId is required.' };
    }

    const fields = compact({
      model,
      file_url: fileUrl,
      file_id: fileId,
      language,
      temperature,
      diarize,
      timestamp_granularities: timestampGranularities,
      context_bias: contextBias,
      speaker_references: speakerReferences,
    });

    const result = await mistralUpload(mistralToken, '/audio/transcriptions', {
      fields,
      file: fileContent
        ? {
            field: 'file',
            content: fileContent,
            encoding: fileEncoding ?? 'utf8',
            mimeType: mimeType ?? 'application/octet-stream',
            filename: filename ?? 'audio',
          }
        : undefined,
    });
    if (result.error) return result;

    return result.data;
  },
});
