// The four meta-tools the bot's LLM uses, mirroring Runstack's server/src/chat/meta-tools.ts.
// Tool names and the output fields @rnsk/bot reads (toolkitId, requiredAuth, provider, link)
// must stay identical; server/contract.test.ts checks this.

import { tool } from 'ai';
import { z } from 'zod';

import { getToolkitStatus } from './credentials.js';
import { describeParameters, runRegisteredTool } from './run-tool.js';
import { findToolkit, type SandboxRuntime } from './runtime.js';

export interface MetaToolContext {
  runtime: SandboxRuntime;
  /** null = every toolkit is in scope. */
  scope: Set<string> | null;
  /** Link the bot's "Connect" button opens for a toolkit. */
  connectUrl: (toolkitId: string) => string;
}

export const META_TOOL_NAMES = [
  'searchTool',
  'checkAuthentication',
  'initiateConnection',
  'executeTool',
] as const;

export function createMetaTools(ctx: MetaToolContext) {
  const { runtime, scope } = ctx;
  const inScope = (toolkitId: string) => !scope || scope.has(toolkitId);

  const findToolkitForProvider = (provider: string) => {
    const slug = provider.trim().toLowerCase();
    return runtime.api.toolkits.find((toolkit) => {
      if (toolkit.id === slug) return true;
      if (toolkit.auth.type === 'oauth2') {
        return (
          toolkit.auth.provider.slug.toLowerCase() === slug ||
          toolkit.auth.tokenField.toLowerCase() === slug
        );
      }
      if (
        toolkit.auth.type === 'api_key' ||
        toolkit.auth.type === 'basic_auth' ||
        toolkit.auth.type === 'bearer_token' ||
        toolkit.auth.type === 'service_account'
      ) {
        return toolkit.auth.tokenField.toLowerCase() === slug;
      }
      return false;
    });
  };

  const searchTool = tool({
    description:
      'Search for available tools in the registry based on a regex pattern. Use this to discover tools that can help with a specific task. Returns detailed parameter information including types and descriptions.',
    inputSchema: z.object({
      pattern: z.string().describe('Regex pattern to search for in tool names and descriptions'),
      searchIn: z
        .enum(['names', 'descriptions', 'both'])
        .optional()
        .default('both')
        .describe('Where to search: names, descriptions, or both'),
    }),
    execute: async ({ pattern, searchIn = 'both' }) => {
      try {
        const matches = runtime.registry
          .search(pattern, searchIn)
          .filter((entry) => inScope(entry.toolkitId));
        return {
          pattern,
          searchIn,
          matches: matches.length,
          tools: matches.map((entry) => {
            const parameters = describeParameters(runtime, entry.tool);
            return {
              name: entry.name,
              description: entry.description,
              parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
              requiredAuth: entry.requiredAuth,
              toolkitId: entry.toolkitId,
            };
          }),
        };
      } catch (error) {
        return {
          error: 'Failed to search tools',
          message: error instanceof Error ? error.message : 'Unknown error',
          pattern,
        };
      }
    },
  });

  const checkAuthentication = tool({
    description:
      'Check whether the user is authenticated for a specific tool. Use this after searchTool when a tool has requiredAuth.',
    inputSchema: z.object({
      toolName: z.string().describe('Name of the tool to check authentication for'),
    }),
    execute: async ({ toolName }) => {
      const entry = runtime.registry.get(toolName);
      if (!entry) {
        return { error: 'Tool not found', toolName, availableTools: runtime.registry.getToolNames() };
      }
      if (!inScope(entry.toolkitId)) {
        return {
          authenticated: false,
          toolName,
          reason: 'toolkit_out_of_scope',
          message: 'This tool is not available in the current toolkit scope.',
        };
      }
      const manifest = findToolkit(runtime, entry.toolkitId);
      if (manifest?.auth.type === 'service_env') {
        const status = getToolkitStatus(manifest, runtime.credentials);
        if (!status.ready) {
          return { authenticated: false, toolName, reason: 'toolkit_unconfigured', message: status.hint };
        }
      }
      if (!entry.requiredAuth) {
        return { authenticated: true, toolName, reason: 'no_auth_required' };
      }
      const token = await runtime.credentials.getToken(entry.requiredAuth);
      if (!token) {
        return {
          authenticated: false,
          toolName,
          requiredAuth: entry.requiredAuth,
          reason: 'token_missing',
        };
      }
      return { authenticated: true, toolName };
    },
  });

  const initiateConnection = tool({
    description:
      'Start connecting an external provider. The chat UI renders a Connect button automatically — do not paste the URL in your text response. Use when checkAuthentication returns not authenticated.',
    inputSchema: z.object({
      provider: z.string().describe('Provider to connect: e.g. "github" for githubToken'),
    }),
    execute: async ({ provider }) => {
      const manifest = findToolkitForProvider(provider);
      if (!manifest) {
        return { error: 'unknown_provider', provider, message: `No toolkit matches "${provider}".` };
      }
      if (!inScope(manifest.id)) {
        return {
          error: 'provider_out_of_scope',
          provider,
          message: 'This provider is not available in the current toolkit scope.',
        };
      }
      return {
        provider: manifest.auth.type === 'oauth2' ? manifest.auth.provider.slug : manifest.id,
        link: ctx.connectUrl(manifest.id),
      };
    },
  });

  const executeTool = tool({
    description:
      'Execute any tool from the registry by providing its name and arguments. Use this after finding a suitable tool with searchTool.',
    inputSchema: z.object({
      toolName: z.string().describe('Name of the tool to execute'),
      args: z.record(z.string(), z.unknown()).describe('Arguments to pass to the tool'),
    }),
    execute: async ({ toolName, args }) => {
      const entry = runtime.registry.get(toolName);
      if (entry && !inScope(entry.toolkitId)) {
        return {
          error: 'toolkit_out_of_scope',
          toolName,
          toolkitId: entry.toolkitId,
          message: 'This tool is not available in the current toolkit scope.',
        };
      }
      return runRegisteredTool(runtime, toolName, args);
    },
  });

  return { searchTool, checkAuthentication, initiateConnection, executeTool };
}
