export { CONNECTOR_CATEGORIES, type ConnectorCategory } from './categories.js';
export { defineToolkit, defineTool, toolkitCamelId } from './define.js';
export { inferToolScope } from './scope.js';
export {
  validateManifests,
  getAuthType,
} from './validate.js';
export type {
  ToolkitManifest,
  ToolDefinition,
  ToolkitIcon,
  ToolkitAuthSpec,
  ToolkitAuthType,
  ToolScope,
  OAuthProviderSpec,
  EnvVarSpec,
  ToolkitAvailability,
} from './types.js';
