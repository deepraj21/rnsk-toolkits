import {
  coerceArguments,
  extractParameterInfo,
  getToolInputZodSchema,
  resolveZodObjectShape,
} from '@rnsk/toolkits/core';
import type { ToolRegistry } from './registry.js';

export interface SandboxCredentials {
  getToken: (tokenField: string) => Promise<string | null>;
  getServiceEnv: (envName: string) => string | undefined;
}

export async function runToolkitTool(
  registry: ToolRegistry,
  credentials: SandboxCredentials,
  toolName: string,
  args: Record<string, unknown>,
) {
  const entry = registry.get(toolName);
  if (!entry) {
    return {
      error: 'tool_not_found',
      toolName,
      availableTools: registry.getToolNames(),
    };
  }

  const toolInstance = entry.tool as { execute: (payload: unknown) => Promise<unknown> };
  const toolSchema = getToolInputZodSchema(entry.tool);

  let authToken: string | undefined;
  if (entry.requiredAuth) {
    const token = await credentials.getToken(entry.requiredAuth);
    if (!token) {
      return {
        error: 'missing_credentials',
        toolName,
        requiredAuth: entry.requiredAuth,
        message: `Set a token via POST /api/dev-token with tokenField "${entry.requiredAuth}".`,
      };
    }
    authToken = token;
  }

  const injectAuth = (payload: Record<string, unknown>) => {
    if (authToken != null && entry.requiredAuth) {
      return { ...payload, [entry.requiredAuth]: authToken };
    }
    return payload;
  };

  if (toolSchema) {
    try {
      const coercedArgs = coerceArguments(args, toolSchema);
      const parsedArgs = toolSchema.parse(coercedArgs) as Record<string, unknown>;
      const result = await toolInstance.execute(injectAuth(parsedArgs));
      return {
        toolName,
        toolkitId: entry.toolkitId,
        success: true,
        result,
      };
    } catch (validationError) {
      const shape = resolveZodObjectShape(toolSchema) ?? {};
      const expectedParameters: Record<string, unknown> = {};
      for (const [paramName, paramSchema] of Object.entries(shape)) {
        expectedParameters[paramName] = extractParameterInfo(paramSchema);
      }

      return {
        error: 'invalid_arguments',
        toolName,
        message:
          validationError instanceof Error ? validationError.message : 'Schema validation failed',
        expectedParameters,
        providedParameters: Object.keys(args),
      };
    }
  }

  const result = await toolInstance.execute(injectAuth(args));
  return {
    toolName,
    toolkitId: entry.toolkitId,
    success: true,
    result,
  };
}
