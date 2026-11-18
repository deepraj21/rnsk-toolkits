// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { deepseekRequest, deepseekUpload, deepseekDownload, decodeBuffer } from './client.js';

export const deepseekSpeechToText = tool({
  description:
    'Transcribes spoken audio to text (ASR) — upload a 16-bit PCM WAV or Ogg Opus recording and get back the recognized text with its duration. Use it for voice notes, call recordings, or dictation; the transcript comes back as plain text ready to feed into a chat model.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    audioContent: z
      .string()
      .min(1)
      .describe('Audio bytes — base64 by default, or plain text when encoding is "utf8"'),
    filename: z
      .string()
      .min(1)
      .describe('Audio file name with extension, e.g. "meeting.wav" (16-bit PCM WAV or Ogg Opus)'),
    encoding: z
      .enum(['base64', 'utf8'])
      .optional()
      .describe('How audioContent is encoded (default base64)'),
    mimeType: z
      .string()
      .optional()
      .describe('MIME type, e.g. "audio/wav" (default application/octet-stream)'),
  }),
  execute: async ({ deepseekToken, audioContent, filename, encoding, mimeType }) => {
    if (!audioContent) return { error: 'audioContent is required.' };
    if (!filename) return { error: 'filename is required.' };

    const result = await deepseekUpload(deepseekToken, '/v1/tools/asr', {
      file: {
        field: 'file',
        content: audioContent,
        encoding: encoding ?? 'base64',
        mimeType: mimeType ?? 'audio/wav',
        filename,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const deepseekTextToSpeech = tool({
  description:
    'Converts text to spoken audio (TTS) — pick a voice (stella = female, tide = male) and format (wav or raw pcm), and get back the audio bytes as base64 plus the content type. Use it for read-aloud features, voice responses, or audio rendering of messages; decode the base64 data to play or save it.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    text: z.string().min(1).describe('The text to read aloud (must not be empty)'),
    voice: z
      .enum(['stella', 'tide'])
      .optional()
      .describe('Voice: "stella" (female) or "tide" (male)'),
    format: z
      .enum(['wav', 'pcm'])
      .optional()
      .describe(
        '"wav" returns an audio/wav file; "pcm" returns raw 16-bit signed mono PCM at 24 kHz',
      ),
    filterMarkdown: z
      .boolean()
      .optional()
      .describe('Strip Markdown formatting before speaking (default false)'),
  }),
  execute: async ({ deepseekToken, text, voice, format, filterMarkdown }) => {
    if (!text) return { error: 'text is required.' };

    const result = await deepseekDownload(deepseekToken, '/v1/tools/tts', {
      body: {
        text,
        voice_id: voice,
        format,
        filter_markdown: filterMarkdown,
      },
    });
    if (result.error) return result;

    const decoded = decodeBuffer(result.buffer);
    return {
      contentType: result.contentType || (format === 'pcm' ? 'audio/pcm' : 'audio/wav'),
      encoding: decoded.encoding,
      audio: decoded.content,
      note:
        decoded.encoding === 'base64'
          ? 'audio is base64-encoded — decode before playing or saving'
          : 'audio is utf8 text',
    };
  },
});

export const deepseekOcr = tool({
  description:
    'Extracts text from a document or image with OCR — upload the file (PDF, Word, PowerPoint, image) and get back per-page text plus usage counts. purpose "text_recognition" extracts plain text directly; "rich_layout_recognition" preserves layout structure including images. Use it to turn scans or Office documents into text a model can read.',
  inputSchema: z.object({
    deepseekToken: z.string().optional().describe('DeepSeek API key (injected by system)'),
    fileContent: z
      .string()
      .min(1)
      .describe('File bytes — base64 by default, or plain text when encoding is "utf8"'),
    filename: z
      .string()
      .min(1)
      .describe('File name with extension, e.g. "scan.pdf" (accepted types depend on purpose)'),
    purpose: z
      .enum(['text_recognition', 'rich_layout_recognition'])
      .describe(
        '"text_recognition" extracts text directly (Word/PowerPoint without images, other files page by page); "rich_layout_recognition" keeps the layout incl. images',
      ),
    encoding: z
      .enum(['base64', 'utf8'])
      .optional()
      .describe('How fileContent is encoded (default base64)'),
    mimeType: z
      .string()
      .optional()
      .describe('MIME type of the file, e.g. "application/pdf" (default application/octet-stream)'),
  }),
  execute: async ({ deepseekToken, fileContent, filename, purpose, encoding, mimeType }) => {
    if (!fileContent) return { error: 'fileContent is required.' };
    if (!filename) return { error: 'filename is required.' };
    if (!purpose) return { error: 'purpose is required.' };

    const result = await deepseekUpload(deepseekToken, '/v1/tools/ocr', {
      fields: { purpose },
      file: {
        field: 'file',
        content: fileContent,
        encoding: encoding ?? 'base64',
        mimeType: mimeType ?? 'application/octet-stream',
        filename,
      },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
