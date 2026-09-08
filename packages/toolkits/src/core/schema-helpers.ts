import { zodToJsonSchema } from 'zod-to-json-schema';

export const TOOL_OUTPUT_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  description: 'JSON object returned by the tool. May include result data or an error field.',
  additionalProperties: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getToolInputZodSchema(tool: any): any | null {
  if (!tool || typeof tool !== 'object') return null;
  return tool.inputSchema ?? tool._def?.parameters ?? null;
}

export function resolveZodObjectShape(
  schema: {
    shape?: Record<string, unknown>;
    _def?: { shape?: Record<string, unknown> | (() => Record<string, unknown>) };
  } | null | undefined,
): Record<string, unknown> | null {
  if (!schema) return null;
  if (schema.shape) return schema.shape;

  const defShape = schema._def?.shape;
  if (typeof defShape === 'function') return defShape();
  if (defShape && typeof defShape === 'object') return defShape;
  return null;
}

function flattenJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
  if (schema.$ref && typeof schema.$ref === 'string' && schema.definitions) {
    const refName = schema.$ref.replace('#/definitions/', '');
    const definitions = schema.definitions as Record<string, Record<string, unknown>>;
    const resolved = definitions[refName];
    if (resolved) {
      return {
        ...resolved,
        ...(schema.$schema ? { $schema: schema.$schema } : {}),
      };
    }
  }
  return schema;
}

function stripAuthFromJsonSchema(
  schema: Record<string, unknown>,
  requiredAuth?: string,
): Record<string, unknown> {
  const properties = schema.properties as Record<string, unknown> | undefined;
  if (!properties) return schema;

  const filtered = { ...properties };
  for (const key of Object.keys(filtered)) {
    if (key === requiredAuth || key.endsWith('Token')) {
      delete filtered[key];
    }
  }

  const required = Array.isArray(schema.required)
    ? (schema.required as string[]).filter(
        (key) => key !== requiredAuth && !key.endsWith('Token'),
      )
    : undefined;

  return {
    ...schema,
    properties: filtered,
    ...(required && required.length > 0 ? { required } : {}),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toolInputToJsonSchema(tool: any, requiredAuth?: string): Record<string, unknown> {
  const zodSchema = getToolInputZodSchema(tool);
  if (!zodSchema) {
    return { type: 'object', properties: {} };
  }

  const jsonSchema = zodToJsonSchema(zodSchema, {
    $refStrategy: 'none',
  }) as Record<string, unknown>;

  return stripAuthFromJsonSchema(flattenJsonSchema(jsonSchema), requiredAuth);
}

export interface ParameterInfo {
  type: string;
  required: boolean;
  description?: string;
  itemType?: string;
  options?: string[];
  values?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractParameterInfo(zodType: any): ParameterInfo | Record<string, unknown> {
  const typeName = zodType._def?.typeName;

  const info: Record<string, unknown> = {
    type: typeName?.replace('Zod', '').toLowerCase() || 'unknown',
    required: !(zodType?.isOptional?.() ?? false),
    description: zodType.description || undefined,
  };

  switch (typeName) {
    case 'ZodNumber':
      info.type = 'number';
      break;
    case 'ZodString':
      info.type = 'string';
      break;
    case 'ZodBoolean':
      info.type = 'boolean';
      break;
    case 'ZodArray':
      info.type = 'array';
      info.itemType = (extractParameterInfo(zodType._def.type) as { type?: string }).type;
      break;
    case 'ZodObject':
      info.type = 'object';
      break;
    case 'ZodUnion':
      info.type = 'union';
      info.options =
        zodType._def.options?.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (opt: any) => (extractParameterInfo(opt) as { type?: string }).type,
        ) || [];
      break;
    case 'ZodEnum':
      info.type = 'enum';
      info.values = zodType._def.values || [];
      break;
    case 'ZodOptional': {
      const innerInfo = extractParameterInfo(zodType._def.innerType) as Record<string, unknown>;
      return { ...innerInfo, required: false };
    }
    default:
      info.type = typeName?.replace('Zod', '').toLowerCase() || 'any';
  }

  return info;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function coerceArguments(args: Record<string, unknown>, schema: any): Record<string, unknown> {
  const shape = resolveZodObjectShape(schema);
  if (!shape) return args;

  const coercedArgs: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    const fieldSchema = shape[key] as { _def?: { typeName?: string; innerType?: unknown } } | undefined;
    if (!fieldSchema) {
      coercedArgs[key] = value;
      continue;
    }

    let typeName = fieldSchema._def?.typeName;
    let actualSchema = fieldSchema;

    if (typeName === 'ZodOptional') {
      actualSchema = fieldSchema._def?.innerType as typeof fieldSchema;
      typeName = actualSchema?._def?.typeName;
    }

    try {
      switch (typeName) {
        case 'ZodNumber':
          coercedArgs[key] = typeof value === 'string' ? parseFloat(value) : Number(value);
          break;
        case 'ZodString':
          coercedArgs[key] = String(value);
          break;
        case 'ZodBoolean':
          coercedArgs[key] =
            typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);
          break;
        case 'ZodArray':
          coercedArgs[key] = Array.isArray(value) ? value : [value];
          break;
        default:
          coercedArgs[key] = value;
      }
    } catch {
      coercedArgs[key] = value;
    }
  }

  return coercedArgs;
}
