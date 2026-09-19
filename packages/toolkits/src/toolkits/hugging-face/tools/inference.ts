// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceDeleteNetworkCidrList = tool({
    description: "Tool to delete a network CIDR list entry from Hugging Face Inference Endpoints. Use when you need to remove a CIDR configuration that is no longer needed. This action permanently removes the specified CIDR from the namespace's network configuration.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        cidrId: z.string().describe("The unique identifier of the CIDR to delete. This is a hexadecimal ID that was returned when the CIDR was created."),
        namespace: z.string().describe("The namespace (user or organization) that owns the CIDR configuration. For example, '121tester' for a user or 'my-org' for an organization."),
    }),
    execute: async ({ huggingFaceToken, cidrId, namespace }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.IE}/v2/network/${encodeURIComponent(namespace)}/cidr/${encodeURIComponent(cidrId)}`, queryParams });
    },
});

export const huggingFaceGenerateChatCompletion = tool({
    description: "Tool to generate a response given a list of messages in a conversational context. Supports both conversational Language Models (LLMs) and Vision-Language Models (VLMs). Compatible with OpenAI SDK.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        seed: z.number().int().optional().describe("Random seed for deterministic sampling. Using the same seed with the same parameters should produce the same output."),
        stop: z.array(z.string()).max(4).optional().describe("Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence."),
        model: z.string().describe("The model ID to use for chat completion. Format: namespace/model or namespace/model:provider. Examples: 'meta-llama/Llama-3.2-3B-Instruct', 'Qwen/Qwen2.5-7B-Instruct-1M'."),
        tools: z.array(z.record(z.any())).optional().describe("A list of tools the model may call. Currently, only functions are supported as a tool. Use this to provide a list of functions the model may generate JSON inputs for."),
        top_p: z.number().min(0).max(1).optional().describe("An alternative to sampling with temperature, called nucleus sampling. The model considers the results of tokens with top_p probability mass. So 0.1 means only tokens comprising the top 10% probability mass are considered."),
        stream: z.boolean().optional().describe("Whether to stream the response as Server-Sent Events. If true, tokens are returned as they are generated. If false (default), the full response is returned at once."),
        logprobs: z.boolean().optional().describe("Whether to return log probabilities of the output tokens. If true, returns the log probabilities of each output token returned in the content of message."),
        messages: z.array(z.record(z.any())).min(1).describe("A list of messages comprising the conversation so far. Each message has a role (system, user, assistant, tool) and content."),
        max_tokens: z.number().int().min(1).optional().describe("The maximum number of tokens that can be generated in the chat completion. If not specified, the model will generate until it reaches a natural stopping point."),
        temperature: z.number().min(0).max(2).optional().describe("Sampling temperature between 0 and 2. Higher values like 0.8 make output more random, lower values like 0.2 make it more focused and deterministic. We generally recommend altering this or top_p but not both."),
        tool_choice: z.record(z.any()).optional().describe("Controls which (if any) tool is called by the model. 'auto' (default) means the model can pick between generating a message or calling a tool. 'none' means the model will not call a tool. 'required' means the model must call a tool. Or specify a particular function to force the model to call it."),
        tool_prompt: z.string().optional().describe("A prompt to be appended before the tools section."),
        top_logprobs: z.number().int().min(0).max(5).optional().describe("An integer between 0 and 5 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used."),
        stream_options: z.record(z.any()).optional().describe("Stream options."),
        response_format: z.record(z.any()).optional().describe("The format of the response. Can be 'text' (default), 'json_object' for JSON mode, or 'json_schema' for structured output with a specific schema."),
        presence_penalty: z.number().min(-2).max(2).optional().describe("Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."),
        frequency_penalty: z.number().min(-2).max(2).optional().describe("Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."),
    }),
    execute: async ({ huggingFaceToken, seed, stop, model, tools, top_p, stream, logprobs, messages, max_tokens, temperature, tool_choice, tool_prompt, top_logprobs, stream_options, response_format, presence_penalty, frequency_penalty }) => {
        const queryParams = undefined;
        const { huggingFaceToken: _t, ...body } = { huggingFaceToken, seed, stop, model, tools, top_p, stream, logprobs, messages, max_tokens, temperature, tool_choice, tool_prompt, top_logprobs, stream_options, response_format, presence_penalty, frequency_penalty };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.ROUTER}/v1/chat/completions`, body });
    },
});

export const huggingFaceGenerateEmbeddings = tool({
    description: "Tool to convert text into vector embeddings for feature extraction, semantic search, and similarity tasks. Use when you need numerical representations of text for ML applications.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        model: z.string().optional().describe("The Hugging Face model ID to use for generating embeddings. Must be a valid embedding model from the Hugging Face model hub."),
        inputs: z.array(z.string()).min(1).describe("Array of text strings to convert into embeddings. Each string will be processed and returned as a numerical vector representation."),
    }),
    execute: async ({ huggingFaceToken, model, inputs }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.AII}/pipeline/feature-extraction/${encodeURIComponent(model)}`, body: { inputs } });
    },
});

export const huggingFaceListEndpoints = tool({
    description: "Tool to list Hugging Face Inference Endpoints for a specific user or organization. Use when you need to retrieve endpoints, optionally filtered by tags or name.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        tags: z.string().optional().describe("Filter endpoints by tags (comma-separated). Use this to find endpoints with specific tags."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of endpoints to return per page. Defaults to 20 if not specified."),
        cursor: z.string().optional().describe("Pagination cursor to fetch the next or previous page of results. Use the nextCursor or prevCursor from the previous response."),
        search: z.string().optional().describe("Filter endpoints by name substring. Use this to search for endpoints containing specific text in their name."),
        namespace: z.string().describe("User or organization name to list endpoints for. This is the owner of the endpoints you want to retrieve."),
    }),
    execute: async ({ huggingFaceToken, tags, limit, cursor, search, namespace }) => {
        const queryParams = { search: search, tags: tags, limit: limit, cursor: cursor };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.IE}/v2/endpoint/${encodeURIComponent(namespace)}`, queryParams });
    },
});

export const huggingFaceListVendors = tool({
    description: "Tool to list available cloud provider vendors for Hugging Face Inference Endpoints. Use when you need to discover available infrastructure options across AWS, Azure, and GCP. Returns vendors with their regions and compute instance types for deploying models.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.IE}/v2/vendor`, queryParams });
    },
});
