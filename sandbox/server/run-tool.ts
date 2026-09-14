// Runs one registered tool: validate args → inject credentials → execute.
// Mirrors Runstack's executeTool so results look the same in the bot and the Tool runner.

import { getToolkitStatus } from './credentials.js';
import { findToolkit, type SandboxRuntime } from './runtime.js';

export type ToolRunResult = Record<string, unknown> & { error?: string };

export function describeParameters(runtime: SandboxRuntime, tool: unknown) {
  const { core } = runtime.api;
  const shape = core.resolveZodObjectShape(core.getToolInputZodSchema(tool)) ?? {};
  const parameters: Record<string, unknown> = {};
  for (const [name, schema] of Object.entries(shape)) {
    parameters[name] = core.extractParameterInfo(schema);
  }
  return parameters;
}

export async function runRegisteredTool(
  runtime: SandboxRuntime,
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolRunResult> {
  const { registry, credentials, api } = runtime;
  const entry = registry.get(toolName);
  if (!entry) {
    return { error: 'Tool not found', toolName, availableTools: registry.getToolNames() };
  }

  const manifest = findToolkit(runtime, entry.toolkitId);
  if (manifest?.auth.type === 'service_env') {
    const status = getToolkitStatus(manifest, credentials);
    if (!status.ready) {
      return {
        error: 'toolkit_unconfigured',
        toolName,
        toolkitId: entry.toolkitId,
        missing: status.missing,
        message: status.hint,
      };
    }
  }

  let authToken: string | undefined;
  if (entry.requiredAuth) {
    const token = await credentials.getToken(entry.requiredAuth);
    if (!token) {
      return {
        error: 'Tool requires connection',
        toolName,
        toolkitId: entry.toolkitId,
        requiredAuth: entry.requiredAuth,
        message: `No ${entry.requiredAuth} set. Paste one in the sandbox Credentials panel (or use initiateConnection).`,
      };
    }
    authToken = token;
  }

  let payload: Record<string, unknown> = args;
  const schema = api.core.getToolInputZodSchema(entry.tool);
  if (schema) {
    try {
      payload = schema.parse(api.core.coerceArguments(args, schema)) as Record<string, unknown>;
    } catch (validationError) {
      return {
        error: 'Invalid arguments for tool',
        toolName,
        toolkitId: entry.toolkitId,
        message:
          validationError instanceof Error ? validationError.message : 'Schema validation failed',
        expectedParameters: describeParameters(runtime, entry.tool),
        providedParameters: Object.keys(args),
      };
    }
  }

  if (authToken && entry.requiredAuth) {
    payload = { ...payload, [entry.requiredAuth]: authToken };
  }

  const started = Date.now();
  try {
    const tool = entry.tool as { execute?: (input: unknown, options?: unknown) => Promise<unknown> };
    if (typeof tool.execute !== 'function') {
      return { error: 'Tool has no execute function', toolName, toolkitId: entry.toolkitId };
    }
    const result = await tool.execute(payload, { toolCallId: `sandbox-${started}`, messages: [] });
    return {
      toolName,
      toolkitId: entry.toolkitId,
      success: true,
      durationMs: Date.now() - started,
      result,
    };
  } catch (error) {
    return {
      error: 'Failed to execute tool',
      toolName,
      toolkitId: entry.toolkitId,
      durationMs: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
