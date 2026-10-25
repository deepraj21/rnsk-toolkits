// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, buildForm, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

const audioFileField = z
  .object({
    base64: z.string().describe('Raw base64 audio bytes, or a data:audio/...;base64,... URL'),
    filename: z.string().optional().describe('File name with extension, e.g. interview.mp3'),
    contentType: z.string().optional().describe('MIME type, e.g. audio/mpeg, audio/wav, audio/mp4'),
  })
  .describe('Audio file as base64 (mp3, wav, m4a, ogg, webm, ...)');

export const openaiCreateSpeech = tool({
  description:
    'Text-to-speech: synthesize spoken audio from up to 4096 characters of text. Returns the audio file as base64 that you can write to disk or play.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    model: z.string().describe('TTS model: tts-1, tts-1-hd, or gpt-4o-mini-tts'),
    voice: z
      .string()
      .describe(
        'Voice name, e.g. alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer',
      ),
    input: z.string().describe('Text to speak (max 4096 characters)'),
    instructions: z
      .string()
      .optional()
      .describe('Style guidance, e.g. "Speak in a calm, slow news-anchor tone"'),
    responseFormat: z
      .enum(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'])
      .optional()
      .describe('Audio format (default mp3)'),
    speed: z.number().min(0.25).max(4).optional().describe('Playback speed, 0.25–4.0 (default 1)'),
  }),
  execute: async ({ openaiApiKey, model, voice, input, instructions, responseFormat, speed }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/audio/speech', {
        method: 'POST',
        binary: true,
        body: {
          model,
          voice,
          input,
          ...(instructions ? { instructions } : {}),
          ...(responseFormat ? { response_format: responseFormat } : {}),
          ...(speed !== undefined ? { speed } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to synthesize speech', result);
      return {
        ...result.data,
        note: 'Audio returned as base64. Decode with the declared contentType to save or play it.',
      };
    } catch (error) {
      return toOpenAIError(error, 'Error synthesizing speech');
    }
  },
});

export const openaiCreateTranscription = tool({
  description:
    'Speech-to-text: transcribe an audio file (mp3, wav, m4a, ...) into text in its source language, optionally with word timestamps and speaker diarization.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    file: audioFileField,
    model: z
      .string()
      .describe(
        'Transcription model: whisper-1, gpt-4o-transcribe, gpt-4o-mini-transcribe, or gpt-4o-transcribe-diarize',
      ),
    language: z
      .string()
      .optional()
      .describe('ISO-639-1 language code, e.g. en — improves accuracy when known'),
    prompt: z.string().optional().describe('Hints: names, vocabulary, or formatting instructions'),
    responseFormat: z
      .enum(['json', 'text', 'srt', 'verbose_json', 'vtt', 'diarized_json'])
      .optional()
      .describe('Output format (default json; gpt-4o-transcribe models only support json)'),
    temperature: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Sampling temperature for the decoding stage'),
    timestampGranularities: z
      .array(z.enum(['word', 'segment']))
      .optional()
      .describe('Granularities to return timestamps for, e.g. ["word","segment"]'),
  }),
  execute: async ({
    openaiApiKey,
    file,
    model,
    language,
    prompt,
    responseFormat,
    temperature,
    timestampGranularities,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const form = buildForm({
        file: { ...file, filename: file.filename ?? 'audio.mp3' },
        model,
        ...(language ? { language } : {}),
        ...(prompt ? { prompt } : {}),
        ...(responseFormat ? { response_format: responseFormat } : {}),
        ...(temperature !== undefined ? { temperature } : {}),
        ...(timestampGranularities ? { timestamp_granularities: timestampGranularities } : {}),
      });
      const result = await openaiRequest(openaiApiKey, '/audio/transcriptions', {
        method: 'POST',
        form,
      });
      if (!result.ok) return failedResult('Failed to transcribe audio', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error transcribing audio');
    }
  },
});

export const openaiCreateTranslation = tool({
  description:
    'Translate an audio file into English text (speech-to-English-text). Use for foreign-language recordings when you only need the English transcript.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    file: audioFileField,
    model: z.string().describe('Translation model, e.g. whisper-1'),
    prompt: z.string().optional().describe('Hints: names, vocabulary, or formatting instructions'),
    responseFormat: z
      .enum(['json', 'text', 'srt', 'verbose_json', 'vtt'])
      .optional()
      .describe('Output format (default json)'),
    temperature: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Sampling temperature for the decoding stage'),
  }),
  execute: async ({ openaiApiKey, file, model, prompt, responseFormat, temperature }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const form = buildForm({
        file: { ...file, filename: file.filename ?? 'audio.mp3' },
        model,
        ...(prompt ? { prompt } : {}),
        ...(responseFormat ? { response_format: responseFormat } : {}),
        ...(temperature !== undefined ? { temperature } : {}),
      });
      const result = await openaiRequest(openaiApiKey, '/audio/translations', {
        method: 'POST',
        form,
      });
      if (!result.ok) return failedResult('Failed to translate audio', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error translating audio');
    }
  },
});
