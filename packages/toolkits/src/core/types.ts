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

export interface ApiKeyProviderSpec {
  /** Where the key is sent on outgoing requests; tool code attaches it itself. */
  in: 'header' | 'query';
  /** Header or query param name, e.g. 'X-API-Key' or 'api_key'. */
  name: string;
  /** Value prefix, e.g. 'Bearer' or 'Token'. Omit for a bare key. */
  prefix?: string;
  connectDescription: string;
}

export interface BasicAuthProviderSpec {
  connectDescription: string;
}

export interface BearerTokenProviderSpec {
  connectDescription: string;
}

export interface ServiceAccountProviderSpec {
  /** Field names the connecting user must supply, e.g. ['accessKeyId', 'secretAccessKey']. */
  fields: string[];
  connectDescription: string;
}

export type ToolkitAuthSpec =
  | { type: 'none' }
  | { type: 'service_env'; env: EnvVarSpec[] }
  | { type: 'oauth2'; tokenField: string; provider: OAuthProviderSpec }
  | { type: 'api_key'; tokenField: string; provider: ApiKeyProviderSpec }
  /** Credential stored under tokenField as a raw 'username:password' string. */
  | { type: 'basic_auth'; tokenField: string; provider: BasicAuthProviderSpec }
  /** Always sent as 'Authorization: Bearer <token>'; tool code attaches it. */
  | { type: 'bearer_token'; tokenField: string; provider: BearerTokenProviderSpec }
  /** Credential stored under tokenField as a JSON object keyed by provider.fields. */
  | { type: 'service_account'; tokenField: string; provider: ServiceAccountProviderSpec };

export type ToolkitAuthType =
  | 'none'
  | 'oauth2'
  | 'service_env'
  | 'api_key'
  | 'basic_auth'
  | 'bearer_token'
  | 'service_account';

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
