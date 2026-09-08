import { CONNECTOR_CATEGORIES } from './categories.js';
import { toolkitCamelId } from './define.js';
import type { ToolkitManifest } from './types.js';

export function validateManifests(manifests: ToolkitManifest[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const toolNames = new Set<string>();

  for (const manifest of manifests) {
    if (!/^[\da-z]+(-[\da-z]+)*$/.test(manifest.id)) {
      errors.push(`Toolkit id "${manifest.id}" must be kebab-case`);
    }
    if (ids.has(manifest.id)) {
      errors.push(`Duplicate toolkit id "${manifest.id}"`);
    }
    ids.add(manifest.id);

    if (!CONNECTOR_CATEGORIES.includes(manifest.category)) {
      errors.push(`Toolkit "${manifest.id}" has invalid category "${manifest.category}"`);
    }

    const camelId = toolkitCamelId(manifest.id);
    const prefix = `${camelId[0].toUpperCase()}${camelId.slice(1)}`;

    if (manifest.auth.type === 'oauth2') {
      const authedTools = manifest.tools.filter((t) => t.requiredAuth);
      if (authedTools.length === 0) {
        errors.push(`OAuth toolkit "${manifest.id}" has no tools with requiredAuth`);
      }
      for (const tool of manifest.tools) {
        if (tool.requiredAuth && tool.requiredAuth !== manifest.auth.tokenField) {
          errors.push(
            `Tool "${tool.name}" requiredAuth "${tool.requiredAuth}" does not match manifest tokenField "${manifest.auth.tokenField}"`,
          );
        }
      }
    }

    for (const tool of manifest.tools) {
      if (!new RegExp(`^${prefix}[A-Z]`).test(tool.name) && !new RegExp(`^[a-z]`).test(tool.name)) {
        // Seed toolkits may use legacy names (e.g. calculateSum); new tools should use prefix convention
      } else if (!new RegExp(`^(${prefix}[A-Z]|[a-z])`).test(tool.name)) {
        errors.push(
          `Tool "${tool.name}" must match naming convention for toolkit "${manifest.id}"`,
        );
      }
      if (toolNames.has(tool.name)) {
        errors.push(`Duplicate tool name "${tool.name}"`);
      }
      toolNames.add(tool.name);

      if (!tool.scope) {
        errors.push(`Tool "${tool.name}" must declare scope`);
      }
    }
  }

  return errors;
}

export function getAuthType(manifest: ToolkitManifest): 'OAUTH2' | 'None' | 'SERVICE_ENV' {
  switch (manifest.auth.type) {
    case 'oauth2':
      return 'OAUTH2';
    case 'service_env':
      return 'SERVICE_ENV';
    default:
      return 'None';
  }
}
