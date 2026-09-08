import { tool } from 'ai';
import { z } from 'zod';
import {
  coerceArguments,
  extractParameterInfo,
  getToolInputZodSchema,
  resolveZodObjectShape,
} from '@rnsk/toolkits/core';
import type { ToolRegistry } from './registry.js';

export interface SandboxCredentialResolver {
  getToken: (tokenField: string) => Promise<string | null>;
  getServiceEnv: (envName: string) => string | undefined;
}

export interface SandboxMetaToolHooks {
  isWebSearchEnabled?: () => boolean;
  getAppUrl?: () => string;
  getProviderSlugs?: () => string[];
  isToolkitAvailable?: (toolkitId: string) => { available: boolean; reason?: string };
}

export function createSandboxMetaTools(
  registry: ToolRegistry,
  credentials: SandboxCredentialResolver,
  hooks: SandboxMetaToolHooks = {},
) {
  const {
    isWebSearchEnabled = () => true,
    getAppUrl = () => 'http://localhost:3100',
    getProviderSlugs = () => [],
    isToolkitAvailable,
  } = hooks;

  const searchTool = tool({
    description:
      'Search for available tools in the registry based on a regex pattern.',
    inputSchema: z.object({
      pattern: z.string(),
      searchIn: z.enum(['names', 'descriptions', 'both']).optional().default('both'),
    }),
    execute: async ({ pattern, searchIn = 'both' }) => {
      const results = registry.search(pattern, searchIn);
      return {
        pattern,
        searchIn,
        matches: results.length,
        tools: results.map((toolMetadata) => {
          const toolSchema = getToolInputZodSchema(toolMetadata.tool);
          const shape = resolveZodObjectShape(toolSchema);
          const parameters: Record<string, unknown> = {};
          if (shape) {
            for (const [paramName, paramSchema] of Object.entries(shape)) {
              parameters[paramName] = extractParameterInfo(paramSchema);
            }
          }
          return {
            name: toolMetadata.name,
            description: toolMetadata.description,
            parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
            requiredAuth: toolMetadata.requiredAuth,
          };
        }),
      };
    },
  });

  const checkAuthentication = tool({
    description: 'Check whether credentials exist for a tool.',
    inputSchema: z.object({ toolName: z.string() }),
    execute: async ({ toolName }) => {
      const toolMetadata = registry.get(toolName);
      if (!toolMetadata) {
        return { error: 'Tool not found', toolName, availableTools: registry.getToolNames() };
      }
      if (isToolkitAvailable) {
        const availability = isToolkitAvailable(toolMetadata.toolkitId);
        if (!availability.available) {
          return { authenticated: false, toolName, reason: 'toolkit_unconfigured' };
        }
      }
      if (!toolMetadata.requiredAuth) {
        return { authenticated: true, toolName, reason: 'no_auth_required' };
      }
      const token = await credentials.getToken(toolMetadata.requiredAuth);
      return token
        ? { authenticated: true, toolName }
        : { authenticated: false, toolName, requiredAuth: toolMetadata.requiredAuth };
    },
  });

  const initiateConnection = tool({
    description: 'Return a placeholder connect link for sandbox OAuth providers.',
    inputSchema: z.object({ provider: z.string() }),
    execute: async ({ provider }) => {
      const slug = provider.toLowerCase().replace(/\s+/g, '-');
      const supported = getProviderSlugs();
      if (supported.includes(slug)) {
        return { link: `${getAppUrl()}/auth/provider/${slug}`, provider: slug };
      }
      return { error: 'Unknown provider', provider, supportedProviders: supported };
    },
  });

  const executeTool = tool({
    description: 'Execute a toolkit tool from the registry.',
    inputSchema: z.object({
      toolName: z.string(),
      args: z.record(z.string(), z.unknown()),
    }),
    execute: async ({ toolName, args }) => {
      if ((toolName === 'webSearch' || toolName === 'webScrape') && !isWebSearchEnabled()) {
        return { error: 'Web search is disabled', toolName };
      }

      const toolMetadata = registry.get(toolName);
      if (!toolMetadata) {
        return { error: 'Tool not found', toolName, availableTools: registry.getToolNames() };
      }

      if (isToolkitAvailable) {
        const availability = isToolkitAvailable(toolMetadata.toolkitId);
        if (!availability.available) {
          return { error: 'toolkit_unconfigured', toolName, toolkitId: toolMetadata.toolkitId };
        }
      }

      const toolInstance = toolMetadata.tool as { execute: (args: unknown) => Promise<unknown> };
      const toolSchema = getToolInputZodSchema(toolMetadata.tool);

      let authToken: string | undefined;
      if (toolMetadata.requiredAuth) {
        const token = await credentials.getToken(toolMetadata.requiredAuth);
        if (!token) {
          return {
            error: 'Tool requires connection',
            toolName,
            requiredAuth: toolMetadata.requiredAuth,
          };
        }
        authToken = token;
      }

      const injectAuth = (payload: Record<string, unknown>) => {
        if (authToken != null && toolMetadata.requiredAuth) {
          return { ...payload, [toolMetadata.requiredAuth]: authToken };
        }
        return payload;
      };

      if (toolSchema) {
        const coercedArgs = coerceArguments(args, toolSchema);
        const parsedArgs = toolSchema.parse(coercedArgs) as Record<string, unknown>;
        const result = await toolInstance.execute(injectAuth(parsedArgs));
        return { toolName, toolkitId: toolMetadata.toolkitId, success: true, result };
      }

      const result = await toolInstance.execute(injectAuth(args));
      return { toolName, toolkitId: toolMetadata.toolkitId, success: true, result };
    },
  });

  return { searchTool, checkAuthentication, initiateConnection, executeTool };
}
