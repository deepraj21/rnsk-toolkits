// @ts-nocheck
import { mistralAppendConversationMessage } from './append-conversation-message.js';
import { mistralCancelBatchJob } from './cancel-batch-job.js';
import { mistralChatCompletion } from './chat-completion.js';
import { mistralCompleteAgent } from './complete-agent.js';
import { mistralCreateAgent } from './create-agent.js';
import { mistralCreateBatchJob } from './create-batch-job.js';
import { mistralCreateConversation } from './create-conversation.js';
import { mistralCreateEmbeddings } from './create-embeddings.js';
import { mistralDeleteAgent } from './delete-agent.js';
import { mistralDeleteBatchJob } from './delete-batch-job.js';
import { mistralDeleteConversation } from './delete-conversation.js';
import { mistralDeleteFile } from './delete-file.js';
import { mistralFimCompletion } from './fim-completion.js';
import { mistralGetAgent } from './get-agent.js';
import { mistralGetBatchJob } from './get-batch-job.js';
import { mistralGetConversation } from './get-conversation.js';
import { mistralGetConversationMessages } from './get-conversation-messages.js';
import { mistralGetFile } from './get-file.js';
import { mistralGetFileContent } from './get-file-content.js';
import { mistralGetFileUrl } from './get-file-url.js';
import { mistralGetModel } from './get-model.js';
import { mistralListAgents } from './list-agents.js';
import { mistralListBatchJobs } from './list-batch-jobs.js';
import { mistralListConversations } from './list-conversations.js';
import { mistralListFiles } from './list-files.js';
import { mistralListModels } from './list-models.js';
import { mistralModerateText } from './moderate-text.js';
import { mistralRunOcr } from './run-ocr.js';
import { mistralTranscribeAudio } from './transcribe-audio.js';
import { mistralUpdateAgent } from './update-agent.js';
import { mistralUploadFile } from './upload-file.js';
import { mistralWhoami } from './whoami.js';

export {
  mistralAppendConversationMessage,
  mistralCancelBatchJob,
  mistralChatCompletion,
  mistralCompleteAgent,
  mistralCreateAgent,
  mistralCreateBatchJob,
  mistralCreateConversation,
  mistralCreateEmbeddings,
  mistralDeleteAgent,
  mistralDeleteBatchJob,
  mistralDeleteConversation,
  mistralDeleteFile,
  mistralFimCompletion,
  mistralGetAgent,
  mistralGetBatchJob,
  mistralGetConversation,
  mistralGetConversationMessages,
  mistralGetFile,
  mistralGetFileContent,
  mistralGetFileUrl,
  mistralGetModel,
  mistralListAgents,
  mistralListBatchJobs,
  mistralListConversations,
  mistralListFiles,
  mistralListModels,
  mistralModerateText,
  mistralRunOcr,
  mistralTranscribeAudio,
  mistralUpdateAgent,
  mistralUploadFile,
  mistralWhoami,
};

export const mistralTools = [
  {
    name: 'mistralChatCompletion',
    description:
      'Sends a chat prompt to a Mistral model and returns the generated message(s). Configure the model, the conversation messages, and optional settings like temperature, max_tokens, tools, tool_choice, response_format (text/json), and reasoning_effort. Use model IDs from mistralListModels (e.g. mistral-small-latest, mistral-large-latest, codestral-latest).',
    tool: mistralChatCompletion,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'chat',
      'completion',
      'llm',
      'generate',
      'prompt',
      'message',
      'inference',
      'text',
      'model',
      'conversation',
      'ai',
    ],
  },
  {
    name: 'mistralFimCompletion',
    description:
      'Fill-in-the-middle (FIM) code completion: given a code prefix (and optional suffix), returns the code that fits between them. Use for IDE-style completion with codestral — provide prompt as the code before the cursor and suffix as the code after it.',
    tool: mistralFimCompletion,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'fim',
      'code completion',
      'codestral',
      'autocomplete',
      'code',
      'fill in the middle',
      'ide',
      'generate',
      'programming',
    ],
  },
  {
    name: 'mistralCreateEmbeddings',
    description:
      'Converts text into embedding vectors with a Mistral embedding model (e.g. "mistral-embed"). Accepts one string or an array of strings; returns one vector per input. Use for semantic search, clustering, and similarity.',
    tool: mistralCreateEmbeddings,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'embeddings',
      'embedding',
      'vector',
      'vectors',
      'semantic search',
      'similarity',
      'clustering',
      'mistral-embed',
      'rag',
    ],
  },
  {
    name: 'mistralRunOcr',
    description:
      'Runs OCR on a document and returns structured markdown/text of its contents, including extracted images and tables. Provide exactly one source: documentUrl (PDF/URL), imageUrl, or fileId (from mistralUploadFile). Page numbers start at 0.',
    tool: mistralRunOcr,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'ocr',
      'document',
      'scan',
      'pdf',
      'text extraction',
      'recognize',
      'image to text',
      'tables',
      'layout',
    ],
  },
  {
    name: 'mistralModerateText',
    description:
      'Classifies text for moderation flags (sexual, hate_and_discrimination, violence, self_harm, etc.) using Mistral’s moderation model. Accepts one string or an array of strings; returns a categories + scores result per input.',
    tool: mistralModerateText,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'moderation',
      'moderate',
      'classify',
      'classification',
      'safety',
      'content filter',
      'toxicity',
      'flags',
      'hate speech',
    ],
  },
  {
    name: 'mistralTranscribeAudio',
    description:
      'Transcribes speech to text with a Mistral audio model (e.g. "voxtral-mini-latest"). Provide audio as file content (base64/utf8 with filename) or reference an existing file by fileUrl/fileId. Supports language, diarization, and word/segment timestamps.',
    tool: mistralTranscribeAudio,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'transcribe',
      'transcription',
      'speech to text',
      'audio',
      'stt',
      'voice',
      'diarization',
      'voxtral',
      'recordings',
      'minutes',
    ],
  },
  {
    name: 'mistralListModels',
    description:
      'Lists the Mistral models available to the connected account — model IDs, capabilities, context window, and owned_by. Use the returned IDs with chatCompletion, fimCompletion, createEmbeddings, and the other model-driven tools.',
    tool: mistralListModels,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'models',
      'list',
      'model ids',
      'capabilities',
      'available models',
      'catalog',
      'llm',
      'discover',
    ],
  },
  {
    name: 'mistralGetModel',
    description:
      'Gets the details of a single Mistral model by ID — capabilities, context window, name, and owner. Use mistralListModels to discover valid IDs first.',
    tool: mistralGetModel,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: ['mistral', 'model', 'details', 'lookup', 'capabilities', 'context window', 'info'],
  },
  {
    name: 'mistralUploadFile',
    description:
      'Uploads a file to the Mistral workspace and returns its id, purpose, size, and mimetype. Use the returned id with batch jobs, OCR (fileId), transcribeAudio (fileId), or file-content tools. Max file size is 512 MB; fine-tuning inputs must be .jsonl.',
    tool: mistralUploadFile,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'upload',
      'file',
      'import',
      'store',
      'jsonl',
      'dataset',
      'attach',
      'workspace',
      'put',
    ],
  },
  {
    name: 'mistralListFiles',
    description:
      'Lists files in the Mistral workspace with their id, purpose, size, and mimetype. Filter by purpose, mimetype, search text, or source; page with page/pageSize (page is 0-indexed). includeTotal returns the total count.',
    tool: mistralListFiles,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'files',
      'list',
      'browse',
      'workspace',
      'datasets',
      'filter',
      'search',
      'paginate',
    ],
  },
  {
    name: 'mistralGetFile',
    description:
      'Gets metadata for one Mistral file by id — filename, purpose, size, mimetype, created time, and signature. Use mistralGetFileContent to read the bytes or mistralGetFileUrl for a temporary download link.',
    tool: mistralGetFile,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: ['mistral', 'file', 'metadata', 'info', 'details', 'lookup', 'size', 'mimetype'],
  },
  {
    name: 'mistralGetFileContent',
    description:
      'Downloads a Mistral file’s content: text files come back as utf8 content (JSONL fine-tune/batch files are parsed into objects), binary files as base64. Files larger than 2 MiB return metadata only — use mistralGetFileUrl for those.',
    tool: mistralGetFileContent,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'download',
      'file content',
      'read',
      'jsonl',
      'contents',
      'fetch',
      'base64',
      'text',
      'export',
    ],
  },
  {
    name: 'mistralGetFileUrl',
    description:
      'Gets a temporary signed download URL for a Mistral file (expires after the given hours, default 24, max 168). Use this for large files instead of inlining content through mistralGetFileContent.',
    tool: mistralGetFileUrl,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'file url',
      'signed url',
      'download link',
      'temporary link',
      'expires',
      'share',
      'large file',
    ],
  },
  {
    name: 'mistralDeleteFile',
    description:
      'Deletes a file from the Mistral workspace. This is permanent — files referenced by running batch jobs or fine-tunes may fail if deleted.',
    tool: mistralDeleteFile,
    requiredAuth: 'mistralToken' as const,
    scope: 'delete' as const,
    keywords: ['mistral', 'delete', 'remove', 'file', 'erase', 'cleanup', 'purge', 'destroy'],
  },
  {
    name: 'mistralCreateBatchJob',
    description:
      'Creates an async batch job that runs many inference requests at a reduced rate. Provide inputFiles (uploaded file ids, one JSONL row per request) or an inline requests array, plus the endpoint (e.g. "/v1/chat/completions") and model (or an agent_id). Returns the queued job — poll with mistralGetBatchJob until status is SUCCESS/FAILED.',
    tool: mistralCreateBatchJob,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'batch',
      'job',
      'bulk',
      'async',
      'queue',
      'mass inference',
      'offline',
      'create',
      'jsonl',
    ],
  },
  {
    name: 'mistralListBatchJobs',
    description:
      'Lists batch jobs with their status (QUEUED/RUNNING/SUCCESS/FAILED/…), progress, and output files. Filter by model, agent, status, creation time, or metadata; page with page/pageSize (0-indexed) and order by created or -created.',
    tool: mistralListBatchJobs,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'batch',
      'jobs',
      'list',
      'status',
      'queue',
      'progress',
      'history',
      'filter',
      'monitor',
    ],
  },
  {
    name: 'mistralGetBatchJob',
    description:
      'Gets one batch job by id: status, progress (completed/total requests), errors, and output/error file ids. Set inline=true to also embed the job’s results in the response (large jobs may be huge — default false returns file ids instead).',
    tool: mistralGetBatchJob,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'batch',
      'job',
      'status',
      'progress',
      'poll',
      'results',
      'outputs',
      'check',
      'monitor',
    ],
  },
  {
    name: 'mistralCancelBatchJob',
    description:
      'Requests cancellation of a queued or running batch job. The job moves to CANCELLATION_REQUESTED and then CANCELLED; already-completed requests are not undone. Check the result with mistralGetBatchJob.',
    tool: mistralCancelBatchJob,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: ['mistral', 'cancel', 'batch', 'job', 'abort', 'stop', 'halt', 'queue', 'interrupt'],
  },
  {
    name: 'mistralDeleteBatchJob',
    description:
      'Deletes a batch job and its stored inputs/outputs. This is permanent — download or read the output files first with mistralGetFileContent / mistralGetFileUrl if you need the results.',
    tool: mistralDeleteBatchJob,
    requiredAuth: 'mistralToken' as const,
    scope: 'delete' as const,
    keywords: ['mistral', 'delete', 'batch', 'job', 'remove', 'cleanup', 'purge', 'erase'],
  },
  {
    name: 'mistralCreateAgent',
    description:
      'Creates a Mistral agent: a model plus instructions, tools (function/web search/code interpreter/…), and optional guardrails. Requires a model and name. Use the returned agent id with completeAgent, conversations, and batch jobs.',
    tool: mistralCreateAgent,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'agent',
      'create',
      'assistant',
      'instructions',
      'tools',
      'bot',
      'build',
      'configure',
      'guardrails',
    ],
  },
  {
    name: 'mistralListAgents',
    description:
      'Lists Mistral agents with their id, name, model, and version. Filter by name substring, free-text search, source (api/playground/agent_builder_v1), deployment state, or metadata; page with page/pageSize (0-indexed).',
    tool: mistralListAgents,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'agents',
      'list',
      'browse',
      'search',
      'assistants',
      'catalog',
      'filter',
      'paginate',
    ],
  },
  {
    name: 'mistralGetAgent',
    description:
      'Gets one Mistral agent by id — instructions, model, tools, handoffs, and version. Optionally pin a specific version with agentVersion (integer version number or string alias).',
    tool: mistralGetAgent,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: ['mistral', 'agent', 'details', 'lookup', 'instructions', 'tools', 'version', 'info'],
  },
  {
    name: 'mistralUpdateAgent',
    description:
      'Updates an existing Mistral agent (partial update — send only the fields to change). Can change name, instructions, model, tools, handoffs, guardrails, and metadata; add versionMessage to describe the change as a new version.',
    tool: mistralUpdateAgent,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'agent',
      'update',
      'edit',
      'modify',
      'patch',
      'instructions',
      'change',
      'rename',
      'version',
    ],
  },
  {
    name: 'mistralDeleteAgent',
    description:
      'Deletes a Mistral agent. This is permanent — conversations and batch jobs referencing the agent will stop working, so confirm nothing critical depends on it first.',
    tool: mistralDeleteAgent,
    requiredAuth: 'mistralToken' as const,
    scope: 'delete' as const,
    keywords: ['mistral', 'delete', 'agent', 'remove', 'destroy', 'retire', 'cleanup', 'erase'],
  },
  {
    name: 'mistralCompleteAgent',
    description:
      'Runs one turn against a Mistral agent and returns the agent’s reply. Provide the agent_id and the conversation messages; the agent applies its instructions, tools, and guardrails. For multi-turn stateful conversations prefer the conversation tools (create/append).',
    tool: mistralCompleteAgent,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'agent',
      'completion',
      'chat',
      'run',
      'invoke',
      'ask',
      'reply',
      'turn',
      'assistant',
    ],
  },
  {
    name: 'mistralCreateConversation',
    description:
      'Creates a stateful Mistral conversation seeded with initial inputs (a string or message entries). Optionally bind it to an agent_id or model, and set instructions/name/metadata. Returns the conversation id — use it with appendConversationMessage and getConversationMessages.',
    tool: mistralCreateConversation,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'conversation',
      'create',
      'session',
      'thread',
      'stateful',
      'history',
      'start',
      'dialog',
    ],
  },
  {
    name: 'mistralListConversations',
    description:
      'Lists Mistral conversations with their id, name, agent/model binding, and timestamps. Filter by metadata; page with page/pageSize (0-indexed).',
    tool: mistralListConversations,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'conversations',
      'list',
      'browse',
      'sessions',
      'threads',
      'history',
      'filter',
      'paginate',
    ],
  },
  {
    name: 'mistralGetConversation',
    description:
      'Gets metadata for one Mistral conversation — id, name, agent/model binding, timestamps, and metadata. Use getConversationMessages to read its messages or getConversationHistory for the full entry log.',
    tool: mistralGetConversation,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'conversation',
      'details',
      'metadata',
      'info',
      'lookup',
      'session',
      'thread',
    ],
  },
  {
    name: 'mistralAppendConversationMessage',
    description:
      'Appends new input to an existing Mistral conversation and runs the turn, returning the conversation state (including the agent’s reply). Use this for multi-turn conversations after mistralCreateConversation.',
    tool: mistralAppendConversationMessage,
    requiredAuth: 'mistralToken' as const,
    scope: 'write' as const,
    keywords: [
      'mistral',
      'conversation',
      'append',
      'message',
      'reply',
      'continue',
      'turn',
      'multi-turn',
      'respond',
      'chat',
    ],
  },
  {
    name: 'mistralGetConversationMessages',
    description:
      'Retrieves all messages in a Mistral conversation (entries filtered to messages only), in order — use it to read the conversation history back.',
    tool: mistralGetConversationMessages,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'conversation',
      'messages',
      'history',
      'transcript',
      'read',
      'entries',
      'log',
      'fetch',
    ],
  },
  {
    name: 'mistralDeleteConversation',
    description:
      'Deletes a Mistral conversation and its stored history. This is permanent — read anything you need with mistralGetConversationMessages first.',
    tool: mistralDeleteConversation,
    requiredAuth: 'mistralToken' as const,
    scope: 'delete' as const,
    keywords: [
      'mistral',
      'delete',
      'conversation',
      'remove',
      'history',
      'purge',
      'cleanup',
      'erase',
    ],
  },
  {
    name: 'mistralWhoami',
    description:
      'Returns the identity behind the connected Mistral API key — the principal (user or service account), its type, and the organization/workspace the session is scoped to. Useful for confirming the key works and which tenant it belongs to.',
    tool: mistralWhoami,
    requiredAuth: 'mistralToken' as const,
    scope: 'read' as const,
    keywords: [
      'mistral',
      'whoami',
      'identity',
      'account',
      'principal',
      'organization',
      'workspace',
      'me',
      'profile',
      'tenant',
    ],
  },
];
