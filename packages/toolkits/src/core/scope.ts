import type { ToolScope } from './types.js';

/** Heuristic scope inference for migrated tools; explicit scope in manifests is preferred. */
export function inferToolScope(name: string): ToolScope {
  const normalized = name.toLowerCase();

  if (/^(delete|remove|unfollow|unstar|destroy|revoke|cancel)/.test(normalized)) {
    return 'delete';
  }
  if (
    /^(create|add|update|send|post|put|patch|trigger|generate|follow|star|merge|approve|dispatch|set|invite|assign|upload|publish|enable|disable|lock|unlock|rerun|reopen|close|append|fork|watch)/.test(
      normalized,
    )
  ) {
    return 'write';
  }
  return 'read';
}
