// @ts-nocheck
import { ollamaChat, ollamaGenerate, ollamaOpenAiChat, ollamaOpenAiComplete } from './inference.js';
import {
  ollamaListModels,
  ollamaOpenAiListModels,
  ollamaShowModel,
  ollamaVersion,
} from './models.js';

export {
  ollamaChat,
  ollamaGenerate,
  ollamaOpenAiChat,
  ollamaOpenAiComplete,
  ollamaListModels,
  ollamaOpenAiListModels,
  ollamaShowModel,
  ollamaVersion,
};

const AUTH = 'ollamaCredentials' as const;

export const ollamaTools = [
  {
    name: 'ollamaChat',
    description: 'Multi-turn chat with an Ollama model: tools, thinking, JSON format, images.',
    tool: ollamaChat,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['conversation', 'llm', 'inference', 'completion'],
  },
  {
    name: 'ollamaGenerate',
    description: 'Generate text from an Ollama model for a prompt with system, images, raw mode.',
    tool: ollamaGenerate,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['llm', 'inference', 'prompt', 'completion'],
  },
  {
    name: 'ollamaOpenAiChat',
    description: 'OpenAI-compatible chat completion via an Ollama model.',
    tool: ollamaOpenAiChat,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['openai', 'llm', 'conversation'],
  },
  {
    name: 'ollamaOpenAiComplete',
    description: 'OpenAI-compatible plain text completion via an Ollama model.',
    tool: ollamaOpenAiComplete,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['openai', 'llm', 'prompt'],
  },
  {
    name: 'ollamaListModels',
    description: 'List locally available Ollama models with metadata.',
    tool: ollamaListModels,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['installed', 'library', 'tags'],
  },
  {
    name: 'ollamaOpenAiListModels',
    description: 'List Ollama models in OpenAI model-list format.',
    tool: ollamaOpenAiListModels,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['openai', 'installed', 'library'],
  },
  {
    name: 'ollamaShowModel',
    description: 'Show model details: template, parameters, license, system prompt.',
    tool: ollamaShowModel,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['info', 'modelfile', 'details'],
  },
  {
    name: 'ollamaVersion',
    description: 'Get the running Ollama server version.',
    tool: ollamaVersion,
    requiredAuth: AUTH,
    scope: 'read' as const,
    keywords: ['server', 'release', 'build'],
  },
];
