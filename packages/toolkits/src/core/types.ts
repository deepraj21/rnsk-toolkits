import type { Tool } from 'ai';
import type { ConnectorCategory } from './categories.js';

export type ToolScope = 'read' | 'write' | 'delete';

export interface ToolkitIcon {
  kind: 'svg' | 'png';
  dataUri: string;
}

export interface EnvVarSpec {
  name: string;
  description?: string;
}

export interface OAuthProviderSpec {
  slug: string;
  env: {
    clientId: string;
    clientSecret: string;
    clientIdFallback?: string;
    clientSecretFallback?: string;
  };
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  scopeSeparator?: ' ' | ',';
  exchangeStyle: 'json' | 'form' | 'basic';
  extraAuthParams?: Record<string, string>;
  connectDescription: string;
  callbackPath?: string;
  stateCookie?: string;
  tokenResponsePath?: string;
}

export type ToolkitAuthSpec =
  | { type: 'none' }
  | { type: 'service_env'; env: EnvVarSpec[] }
  | { type: 'oauth2'; tokenField: string; provider: OAuthProviderSpec };

export type ToolkitAuthType = 'none' | 'oauth2' | 'service_env';

export interface ToolDefinition {
  name: string;
  description?: string;
  tool: Tool;
  requiredAuth?: string;
  scope: ToolScope;
}

export interface ToolkitManifest {
  id: string;
  displayName: string;
  shortDescription: string;
  category: ConnectorCategory;
  icon: ToolkitIcon;
  auth: ToolkitAuthSpec;
  tools: ToolDefinition[];
  allowedHosts?: string[];
  meta?: {
    homepage?: string;
    docsUrl?: string;
    apiDocsUrl?: string;
    contributors?: string[];
    since?: string;
  };
}

export interface ToolkitAvailability {
  available: boolean;
  unavailableReason?: 'not_configured' | 'missing_env';
}
