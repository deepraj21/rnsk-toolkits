import { toolkits } from '../src/index.js';
import { validateManifests } from '../src/core/validate.js';
import { getToolInputZodSchema, toolInputToJsonSchema, resolveZodObjectShape } from '../src/runtime/schema-helpers.js';

const errors = validateManifests(toolkits);

for (const manifest of toolkits) {
  for (const toolDef of manifest.tools) {
    const zodSchema = getToolInputZodSchema(toolDef.tool);
    if (!zodSchema) {
      errors.push(`Tool "${toolDef.name}" has no inputSchema`);
      continue;
    }
    const shape = resolveZodObjectShape(zodSchema);
    if (!shape) {
      // discriminatedUnion, union, etc. — skip empty JSON schema check
      continue;
    }
    const json = toolInputToJsonSchema(toolDef.tool, toolDef.requiredAuth);
    const props = json.properties as Record<string, unknown> | undefined;
    const propCount = props ? Object.keys(props).length : 0;
    if (propCount === 0 && !toolDef.requiredAuth) {
      errors.push(`Tool "${toolDef.name}" produced empty JSON schema`);
    }
  }
}

if (errors.length > 0) {
  console.error('Validation failed:');
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log(`Validated ${toolkits.length} toolkits, ${toolkits.reduce((n, t) => n + t.tools.length, 0)} tools`);
