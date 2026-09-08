export interface ToolRegistryEntry {
  name: string;
  description: string;
  tool: unknown;
  requiredAuth?: string;
  scope?: 'read' | 'write' | 'delete';
  toolkitId: string;
}

export interface ToolRegistry {
  register: (
    name: string,
    description: string,
    tool: unknown,
    options?: { requiredAuth?: string; scope?: 'read' | 'write' | 'delete'; toolkitId?: string },
  ) => void;
  get: (name: string) => ToolRegistryEntry | undefined;
  getToolNames: () => string[];
  search: (
    pattern: string,
    searchIn?: 'names' | 'descriptions' | 'both',
  ) => ToolRegistryEntry[];
}

export function createToolRegistry(): ToolRegistry {
  const tools = new Map<string, ToolRegistryEntry>();

  return {
    register(name, description, tool, options) {
      if (tools.has(name)) {
        throw new Error(`Duplicate tool registration: "${name}"`);
      }
      tools.set(name, {
        name,
        description,
        tool,
        requiredAuth: options?.requiredAuth,
        scope: options?.scope ?? 'read',
        toolkitId: options?.toolkitId ?? 'unknown',
      });
    },
    get(name) {
      return tools.get(name);
    },
    getToolNames() {
      return Array.from(tools.keys());
    },
    search(pattern, searchIn = 'both') {
      const regex = new RegExp(pattern, 'i');
      return Array.from(tools.values()).filter((entry) => {
        if (searchIn === 'names') return regex.test(entry.name);
        if (searchIn === 'descriptions') return regex.test(entry.description);
        return regex.test(entry.name) || regex.test(entry.description);
      });
    },
  };
}
