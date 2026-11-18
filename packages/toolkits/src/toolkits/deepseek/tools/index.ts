// @ts-nocheck
import type { ToolDefinition } from '../../../core/types.js';
import {
  deepseekCreateChatCompletion,
  deepseekFimCompletion,
  deepseekCreateAnthropicMessage,
  deepseekCreateResponse,
} from './chat.js';
import { deepseekListModels, deepseekGetUserBalance } from './account.js';
import {
  deepseekUploadFile,
  deepseekListFiles,
  deepseekRetrieveFile,
  deepseekDeleteFile,
} from './files.js';
import { deepseekFetchUrl, deepseekWebSearch } from './web-tools.js';
import { deepseekSpeechToText, deepseekTextToSpeech, deepseekOcr } from './media.js';

export {
  deepseekCreateChatCompletion,
  deepseekFimCompletion,
  deepseekCreateAnthropicMessage,
  deepseekCreateResponse,
  deepseekListModels,
  deepseekGetUserBalance,
  deepseekUploadFile,
  deepseekListFiles,
  deepseekRetrieveFile,
  deepseekDeleteFile,
  deepseekFetchUrl,
  deepseekWebSearch,
  deepseekSpeechToText,
  deepseekTextToSpeech,
  deepseekOcr,
};

export const deepseekTools: ToolDefinition[] = [
  {
    name: 'deepseekCreateChatCompletion',
    description:
      'Sends a conversation to a DeepSeek model and returns the generated reply (OpenAI-compatible chat completions). Configure the model (deepseek-flash for speed/price, deepseek-v4-pro for max quality), the messages, and optional thinking mode, reasoning effort, tools (function tools plus DeepSeek built-ins like {"type":"deepseek_web_search"} and {"type":"deepseek_read_url"}), JSON output via responseFormat, safety checks, and a conversation title. Streaming is not supported — the complete response comes back as JSON. Use deepseekListModels to discover current model IDs.',
    tool: deepseekCreateChatCompletion,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'llm', 'prompt', 'conversation', 'generate'],
  },
  {
    name: 'deepseekFimCompletion',
    description:
      'Fill-in-the-middle (FIM) code completion — given code with a gap, DeepSeek inserts the missing span (POST /beta/completions). Put the cursor position in prompt and any trailing code in suffix; the model returns the inserted text between them. Also usable as plain text completion. Echo the prompt, stop sequences, and temperature are supported. Streaming is not supported — the complete response comes back as JSON.',
    tool: deepseekFimCompletion,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'autocomplete', 'code', 'predict', 'inline'],
  },
  {
    name: 'deepseekCreateAnthropicMessage',
    description:
      "Sends a conversation using the Anthropic Messages format (POST /anthropic/v1/messages) — use this when your prompts, tool definitions, or client code are shaped for the Claude/Anthropic API instead of OpenAI's. Accepts Anthropic message arrays, system prompt, thinking config, tools/tool_choice, and stop_sequences; Claude model aliases (claude-*) are accepted alongside deepseek-flash and deepseek-v4-pro. Returns an Anthropic-style message with content blocks. Streaming is not supported.",
    tool: deepseekCreateAnthropicMessage,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'claude', 'prompt', 'sdk', 'compatible'],
  },
  {
    name: 'deepseekCreateResponse',
    description:
      'Runs an OpenAI Responses-style request (POST /responses) — a single input (string or item list) plus optional instructions, reasoning effort, structured text output (json_object/json_schema), and function tools. Use it when you want OpenAI Responses API semantics (stateless input + instructions) rather than a full messages array. Streaming is not supported — the completed response comes back as JSON.',
    tool: deepseekCreateResponse,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'openai', 'prompt', 'instructions', 'answers'],
  },
  {
    name: 'deepseekListModels',
    description:
      'Lists the DeepSeek models available to your account with metadata — display name, context window, max output tokens, supported input/output modalities, reasoning effort levels, and per-protocol (OpenAI/Anthropic) API capabilities. Run this first to discover current model IDs (e.g. deepseek-flash, deepseek-v4-pro) before calling the chat, completion, message, or response tools.',
    tool: deepseekListModels,
    requiredAuth: 'deepseekToken' as const,
    scope: 'read' as const,
    keywords: ['deepseek', 'catalog', 'available', 'pricing', 'capabilities'],
  },
  {
    name: 'deepseekGetUserBalance',
    description:
      "Checks the DeepSeek account balance — whether charging is currently available (is_available) plus each currency's total, granted, and topped-up balances (e.g. CNY/USD). Use it before running expensive jobs to confirm the account can spend.",
    tool: deepseekGetUserBalance,
    requiredAuth: 'deepseekToken' as const,
    scope: 'read' as const,
    keywords: ['deepseek', 'credits', 'funds', 'wallet', 'billing', 'quota'],
  },
  {
    name: 'deepseekUploadFile',
    description:
      'Uploads a file to the DeepSeek Files API — send purpose first (user_data for general files, text_recognition or rich_layout_recognition for documents that later go through deepseekOcr), then the file content (base64 for binary, utf8 for text) with its filename. Returns a file object with its file_id for later retrieval or deletion. Optionally set expiration (3600s–30 days). Confirm with the user before uploading sensitive data.',
    tool: deepseekUploadFile,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'attach', 'document', 'storage', 'import'],
  },
  {
    name: 'deepseekListFiles',
    description:
      'Lists files in the DeepSeek Files API — id, size, filename, purpose, and created/expired timestamps. Paginates with the after cursor (a file_id) and limit (up to 1000), sorted asc/desc by creation time, optionally filtered by purpose. Use it to discover file IDs before retrieving or deleting.',
    tool: deepseekListFiles,
    requiredAuth: 'deepseekToken' as const,
    scope: 'read' as const,
    keywords: ['deepseek', 'documents', 'storage', 'browse', 'inventory'],
  },
  {
    name: 'deepseekRetrieveFile',
    description:
      "Retrieves one file's metadata by file_id — bytes, filename, purpose, created_at, and optional expiration. Returns metadata only (not the bytes); it is the safest way to confirm a file exists before deleting it.",
    tool: deepseekRetrieveFile,
    requiredAuth: 'deepseekToken' as const,
    scope: 'read' as const,
    keywords: ['deepseek', 'metadata', 'inspect', 'document', 'info'],
  },
  {
    name: 'deepseekDeleteFile',
    description:
      'Deletes one file from the DeepSeek Files API by file_id — permanent and immediate, anything referencing the file stops working. Confirm with the user first; check existence with deepseekRetrieveFile if unsure.',
    tool: deepseekDeleteFile,
    requiredAuth: 'deepseekToken' as const,
    scope: 'delete' as const,
    keywords: ['deepseek', 'remove', 'purge', 'trash', 'erase'],
  },
  {
    name: 'deepseekFetchUrl',
    description:
      'Fetches one web page and returns its title plus full content as Markdown — use it to read an article, doc page, or any HTTP(S) URL the model (or you) needs the text of. Prefer this over search when the exact URL is already known; pair with deepseekWebSearch to first find the URL. Billed per fetch; content comes back trimmed to an excerpt for long pages.',
    tool: deepseekFetchUrl,
    requiredAuth: 'deepseekToken' as const,
    scope: 'read' as const,
    keywords: ['deepseek', 'webpage', 'scrape', 'link', 'markdown'],
  },
  {
    name: 'deepseekWebSearch',
    description:
      'Runs a web search and returns ranked results with title, URL, snippet, summary, and rerank score (optionally full page content). Supports search operators like site:, -site:, and "quoted phrases". Use it to ground answers in current events or to find pages for deepseekFetchUrl to read afterwards.',
    tool: deepseekWebSearch,
    requiredAuth: 'deepseekToken' as const,
    scope: 'read' as const,
    keywords: ['deepseek', 'google', 'internet', 'research', 'serp'],
  },
  {
    name: 'deepseekSpeechToText',
    description:
      'Transcribes spoken audio to text (ASR) — upload a 16-bit PCM WAV or Ogg Opus recording and get back the recognized text with its duration. Use it for voice notes, call recordings, or dictation; the transcript comes back as plain text ready to feed into a chat model.',
    tool: deepseekSpeechToText,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'transcribe', 'transcription', 'audio', 'asr', 'voice'],
  },
  {
    name: 'deepseekTextToSpeech',
    description:
      'Converts text to spoken audio (TTS) — pick a voice (stella = female, tide = male) and format (wav or raw pcm), and get back the audio bytes as base64 plus the content type. Use it for read-aloud features, voice responses, or audio rendering of messages; decode the base64 data to play or save it.',
    tool: deepseekTextToSpeech,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'tts', 'voice', 'narrate', 'speak', 'audio'],
  },
  {
    name: 'deepseekOcr',
    description:
      'Extracts text from a document or image with OCR — upload the file (PDF, Word, PowerPoint, image) and get back per-page text plus usage counts. purpose "text_recognition" extracts plain text directly; "rich_layout_recognition" preserves layout structure including images. Use it to turn scans or Office documents into text a model can read.',
    tool: deepseekOcr,
    requiredAuth: 'deepseekToken' as const,
    scope: 'write' as const,
    keywords: ['deepseek', 'scan', 'extract', 'image', 'recognize', 'pdf'],
  },
];
