import { tool } from 'ai';
import { z } from 'zod';
import type { CredentialResolver, MetaToolHooks } from './credentials.js';
import type { ToolRegistry } from './registry.js';
import {
  coerceArguments,
  extractParameterInfo,
  getToolInputZodSchema,
  resolveZodObjectShape,
} from './schema-helpers.js';

export interface MetaToolsConfig {
  registry: ToolRegistry;
  credentials: CredentialResolver;
  hooks?: MetaToolHooks;
}

export function createMetaTools({ registry, credentials, hooks = {} }: MetaToolsConfig) {
  const {
    checkToolPolicy,
    sanitizeToolResult = (r) => r,
    sanitizeToolPayload = (p) => p,
    isWebSearchEnabled = () => true,
    getAppUrl = () => process.env.APP_URL ?? 'http://localhost:3000',
    getProviderSlugs = () => [],
    isToolkitAvailable,
  } = hooks;

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
      try {
        const toolMetadata = registry.get(toolName);

        if (!toolMetadata) {
          return {
            error: 'Tool not found',
            toolName,
            availableTools: registry.getToolNames(),
          };
        }

        if (isToolkitAvailable) {
          const availability = isToolkitAvailable(toolMetadata.toolkitId);
          if (!availability.available) {
            return {
              authenticated: false,
              toolName,
              reason: 'toolkit_unconfigured',
              message: availability.reason,
            };
          }
        }

        if (!toolMetadata.requiredAuth) {
          return {
            authenticated: true,
            toolName,
            reason: 'no_auth_required',
          };
        }

        const token = await credentials.getToken(toolMetadata.requiredAuth);
        if (!token) {
          return {
            authenticated: false,
            toolName,
            requiredAuth: toolMetadata.requiredAuth,
            reason: 'token_missing',
          };
        }

        return {
          authenticated: true,
          toolName,
        };
      } catch (error) {
        return {
          error: 'Failed to check authentication',
          toolName,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });

  const initiateConnection = tool({
    description:
      'Get a link for the user to connect an external provider. Use when checkAuthentication returns not authenticated.',
    inputSchema: z.object({
      provider: z.string().describe('Provider to connect: e.g. "github" for githubToken'),
    }),
    execute: async ({ provider }) => {
      const baseUrl = getAppUrl();
      const slug = provider.toLowerCase().replace(/\s+/g, '-');
      const supported = getProviderSlugs();

      if (supported.includes(slug)) {
        return {
          link: `${baseUrl}/auth/provider/${slug}`,
          provider: slug,
        };
      }

      return {
        error: 'Unknown provider',
        provider,
        supportedProviders: supported,
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
      try {
        if (
          (toolName === 'webSearch' || toolName === 'webScrape') &&
          !isWebSearchEnabled()
        ) {
          return {
            error: 'Web search is disabled',
            toolName,
            message: 'Firecrawl is turned off for this request.',
          };
        }

        if (checkToolPolicy) {
          const policy = checkToolPolicy(toolName);
          if (policy.allowed === false) {
            return {
              error: policy.error,
              toolName,
              reason: policy.reason,
            };
          }
        }

        const toolMetadata = registry.get(toolName);

        if (!toolMetadata) {
          return {
            error: 'Tool not found',
            toolName,
            availableTools: registry.getToolNames(),
          };
        }

        if (isToolkitAvailable) {
          const availability = isToolkitAvailable(toolMetadata.toolkitId);
          if (!availability.available) {
            return {
              error: 'toolkit_unconfigured',
              toolName,
              toolkitId: toolMetadata.toolkitId,
              message: availability.reason ?? 'This toolkit is not configured on the server.',
            };
          }
        }

        const toolInstance = toolMetadata.tool as {
          execute: (args: unknown) => Promise<unknown>;
        };
        const toolSchema = getToolInputZodSchema(toolMetadata.tool);

        let authToken: string | undefined;
        if (toolMetadata.requiredAuth) {
          const token = await credentials.getToken(toolMetadata.requiredAuth);
          if (!token) {
            return {
              error: 'Tool requires connection',
              toolName,
              requiredAuth: toolMetadata.requiredAuth,
              message:
                'This tool requires a connected account. Use initiateConnection(provider) to get a link.',
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
          try {
            const coercedArgs = coerceArguments(args, toolSchema);
            const parsedArgs = toolSchema.parse(coercedArgs) as Record<string, unknown>;
            const argsWithToken = injectAuth(parsedArgs);
            const result = await toolInstance.execute(argsWithToken);

            return sanitizeToolPayload({
              toolName,
              success: true,
              result: sanitizeToolResult(result),
            });
          } catch (validationError) {
            const shape = resolveZodObjectShape(toolSchema) ?? {};
            const paramDetails: Record<string, unknown> = {};

            for (const [paramName, paramSchema] of Object.entries(shape)) {
              paramDetails[paramName] = extractParameterInfo(paramSchema);
            }

            return {
              error: 'Invalid arguments for tool',
              toolName,
              message:
                validationError instanceof Error
                  ? validationError.message
                  : 'Schema validation failed',
              expectedParameters: paramDetails,
              providedParameters: Object.keys(args),
              providedValues: args,
            };
          }
        }

        const argsWithToken = injectAuth(args as Record<string, unknown>);
        const result = await toolInstance.execute(argsWithToken);

        return sanitizeToolPayload({
          toolName,
          success: true,
          result: sanitizeToolResult(result),
        });
      } catch (error) {
        return {
          error: 'Failed to execute tool',
          toolName,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });

  return {
    searchTool,
    checkAuthentication,
    initiateConnection,
    executeTool,
  };
}
