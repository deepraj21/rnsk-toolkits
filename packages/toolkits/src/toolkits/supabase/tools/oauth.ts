// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  buildQuery,
  parseResponse,
  pickDefined,
  resolveApiKey,
  sbDelete,
  sbGet,
  sbHead,
  sbOptions,
  sbPatch,
  sbPost,
  sbPut,
  tusOptions,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const supabaseBetaAuthorizeUserThroughOauth = tool({
  description:
    'Generates a Supabase OAuth 2.0 authorization URL for user redirection. IMPORTANT: This action requires a pre-registered OAuth client_id and a redirect_uri that matches one of the pre-registered URIs for that OAuth application. Without a valid registered OAuth application, this endpoint will return a 400 error. To use this action: 1. Register an OAuth application in the Supabase dashboard 2. Use the client_id from the registered application 3. Ensure redirect_uri matches one of the registered callback URLs Builds the authorization URL locally; no network call is made. Requires a pre-registered OAuth client_id and matching redirect_uri.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    scope: z
      .string()
      .optional()
      .describe(
        "Space-separated list of OAuth scopes for requested permissions on user resources (e.g., 'email profile', 'storage.objects.read').",
      ),
    state: z
      .string()
      .optional()
      .describe(
        'Opaque value to maintain state between request and callback; returned unmodified to aid CSRF prevention.',
      ),
    clientId: z
      .string()
      .describe(
        'Unique identifier for the OAuth client application, registered with Supabase. Must be a valid client_id from a registered OAuth application.',
      ),
    redirectUri: z
      .string()
      .describe(
        'URI where Supabase redirects the user after authorization; must exactly match a registered URI for the client application.',
      ),
    responseMode: z
      .string()
      .optional()
      .describe(
        "Specifies how authorization response parameters are returned (e.g., 'query', 'fragment', 'form_post'). Default is determined by `response_type` if not specified.",
      ),
    responseType: z
      .enum(['code', 'id_token token', 'token'])
      .describe(
        "Specifies the authorization flow type: 'code' for Authorization Code Grant; 'token' for Implicit Grant (access token); 'id_token token' for OIDC hybrid flows (ID and access tokens).",
      ),
    codeChallenge: z
      .string()
      .optional()
      .describe(
        'PKCE code challenge to secure authorization code grants, typically a BASE64URL-encoded SHA256 hash of `code_verifier`.',
      ),
    codeChallengeMethod: z
      .enum(['S256', 'plain', 'sha256'])
      .optional()
      .describe(
        "Method to derive `code_challenge` for PKCE: 'S256'/'sha256' for SHA256 hashing; 'plain' sends verifier as is (not for production if hashing possible). Required if `code_challenge` is provided.",
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    clientId,
    responseType,
    redirectUri,
    scope,
    state,
    responseMode,
    codeChallenge,
    codeChallengeMethod,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
    });
    if (scope) params.set('scope', scope);
    if (state) params.set('state', state);
    if (responseMode) params.set('response_mode', responseMode);
    if (codeChallenge) params.set('code_challenge', codeChallenge);
    if (codeChallengeMethod) params.set('code_challenge_method', codeChallengeMethod);
    return {
      status_code: 303,
      redirect_url: `https://api.supabase.com/v1/oauth/authorize?${params.toString()}`,
    };
  },
});

export const supabaseExchangeOauthToken = tool({
  description:
    '(Beta) Implements the OAuth 2.0 token endpoint to exchange an authorization code or refresh token for access/refresh tokens, based on `grant_type`. This is a standard OAuth 2.0 token endpoint that uses application/x-www-form-urlencoded content type as per OAuth 2.0 specification. Requires a valid registered OAuth application client_id and client_secret. For authorization_code grant type: - Requires valid authorization code obtained from the OAuth authorization flow - Optionally requires code_verifier if PKCE was used during authorization For refresh_token grant type: - Requires valid refresh_token from a previous token exchange Form-encoded OAuth2 token endpoint; needs a registered client_id and client_secret.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    code: z
      .string()
      .optional()
      .describe(
        "Authorization code from the server; required if `grant_type` is 'authorization_code'.",
      ),
    clientId: z.string().describe("Application's client ID."),
    grantType: z
      .enum(['authorization_code', 'refresh_token'])
      .describe('OAuth 2.0 grant type that dictates the token exchange flow.'),
    redirectUri: z
      .string()
      .optional()
      .describe(
        "Redirect URI from the initial authorization; required if `grant_type` is 'authorization_code' and it was part of the original request.",
      ),
    clientSecret: z.string().describe("Application's client secret."),
    codeVerifier: z
      .string()
      .optional()
      .describe(
        "PKCE code verifier; required if PKCE was used with an 'authorization_code' grant type.",
      ),
    refreshToken: z
      .string()
      .optional()
      .describe(
        "Refresh token for acquiring a new access token; required if `grant_type` is 'refresh_token'.",
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    grantType,
    clientId,
    clientSecret,
    code,
    redirectUri,
    codeVerifier,
    refreshToken,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    try {
      const form = new URLSearchParams();
      form.set('grant_type', grantType);
      form.set('client_id', clientId);
      form.set('client_secret', clientSecret);
      if (code) form.set('code', code);
      if (redirectUri) form.set('redirect_uri', redirectUri);
      if (codeVerifier) form.set('code_verifier', codeVerifier);
      if (refreshToken) form.set('refresh_token', refreshToken);
      const response = await fetch('https://api.supabase.com/v1/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return { error: `Supabase API error ${response.status}`, details: data };
      return data;
    } catch (error) {
      return {
        error: 'Error calling Supabase API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
