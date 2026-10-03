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

export const supabaseAlphaDeleteThirdPartyAuthIntegration = tool({
  description:
    "Removes a third-party authentication provider (e.g., Google, GitHub) from a Supabase project's configuration; this immediately prevents users from logging in via that method.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    tpaId: z
      .string()
      .describe(
        'The unique identifier (ID) of the third-party authentication provider configuration to be removed.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, tpaId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/third-party-auth/${encodeURIComponent(String(tpaId))}`,
    );
  },
});

export const supabaseAlphaGetThirdPartyIntegration = tool({
  description:
    'Retrieves the detailed configuration for a specific third-party authentication (TPA) provider, identified by `tpa_id`, within an existing Supabase project specified by `ref`.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier (reference) of the Supabase project.'),
    tpaId: z
      .string()
      .describe(
        'The unique identifier of the specific third-party authentication provider configuration to retrieve.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, tpaId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/third-party-auth/${encodeURIComponent(String(tpaId))}`,
    );
  },
});

export const supabaseAlphaListThirdPartyAuthIntegrations = tool({
  description:
    'Lists all configured third-party authentication provider integrations for an existing Supabase project (using its `ref`), suitable for read-only auditing or verifying current authentication settings.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/third-party-auth`,
    );
  },
});

export const supabaseCreateSsoProvider = tool({
  description:
    'Creates a new SAML 2.0 Single Sign-On (SSO) provider for a Supabase project, requiring either `metadata_xml` or `metadata_url` for SAML IdP configuration.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
    type: z
      .enum(['saml'])
      .describe("Type of the SSO provider; 'saml' (SAML 2.0) is the only supported value."),
    domains: z
      .array(z.string())
      .optional()
      .describe(
        'Email domains to associate with this SSO provider; users from these domains will be directed here for authentication.',
      ),
    metadataUrl: z
      .string()
      .optional()
      .describe('URL to fetch SAML 2.0 metadata XML. Provide this or `metadata_xml`.'),
    metadataXml: z
      .string()
      .optional()
      .describe('SAML 2.0 metadata XML document as a string. Provide this or `metadata_url`.'),
    attributeMappingKeys: z
      .record(z.any())
      .optional()
      .describe(
        'Maps SAML assertion attributes to custom Supabase JWT claims. Keys are JWT claim names; values specify SAML attribute extraction rules (e.g., `name`, `names`, `default`, `array`).',
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    type,
    domains,
    metadataUrl,
    metadataXml,
    attributeMappingKeys,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/sso/providers`,
      {
        body: {
          type,
          domains,
          metadata_url: metadataUrl,
          metadata_xml: metadataXml,
          ...(attributeMappingKeys ? { attribute_mapping: { keys: attributeMappingKeys } } : {}),
        },
      },
    );
  },
});

export const supabaseCreateThirdPartyAuthIntegration = tool({
  description:
    'Call this to add a new third-party authentication method (OIDC or JWKS) to a Supabase project for integrating external identity providers (e.g., for SSO); the API may also support `custom_jwks` if sent directly.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier of the Supabase project.'),
    jwksUrl: z
      .string()
      .optional()
      .describe(
        'URL of the JSON Web Key Set (JWKS) for public key verification. Required if `oidc_issuer_url` is not provided.',
      ),
    oidcIssuerUrl: z
      .string()
      .optional()
      .describe('URL of the OpenID Connect (OIDC) issuer. Required if `jwks_url` is not provided.'),
  }),
  execute: async ({ supabaseAccessToken, ref, jwksUrl, oidcIssuerUrl }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/third-party-auth`,
      { body: pickDefined({ jwks_url: jwksUrl, oidc_issuer_url: oidcIssuerUrl }) },
    );
  },
});

export const supabaseDeleteSsoProvider = tool({
  description:
    'Deletes a specific SSO provider by its ID (`provider_id`) from a Supabase project (`ref`), which disables it and returns its details; ensure this action will not inadvertently lock out users.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier for your Supabase project.'),
    providerId: z
      .string()
      .describe('The unique identifier (UUID) of the SSO provider to be removed.'),
  }),
  execute: async ({ supabaseAccessToken, ref, providerId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbDelete(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/sso/providers/${encodeURIComponent(String(providerId))}`,
    );
  },
});

export const supabaseGetAuthConfig = tool({
  description:
    'Retrieves the complete authentication configuration for a Supabase project. Use this action when you need to inspect auth settings, OAuth provider configurations, MFA policies, email/SMS templates, security policies, or webhook hooks. Returns all auth configuration fields including enabled providers (Apple, Google, GitHub, etc.), JWT settings, rate limits, password requirements, session policies, and mailer configuration. This is a read-only operation that does not modify any settings.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Can also be provided as 'project_ref'.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth`,
    );
  },
});

export const supabaseGetsProjectSAuthConfig = tool({
  description:
    "Retrieves the project's complete read-only authentication configuration, detailing all settings (e.g., providers, MFA, email/SMS, JWT, security policies) but excluding sensitive secrets.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Can also be provided as 'project_ref'.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth`,
    );
  },
});

export const supabaseGetSsoProvider = tool({
  description:
    'Retrieves the configuration details for a specific Single Sign-On (SSO) provider (e.g., SAML, Google, GitHub, Azure AD), identified by its UUID, within a Supabase project.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique reference ID of the Supabase project.'),
    providerId: z
      .string()
      .describe(
        'The unique identifier (UUID) of the SSO provider whose configuration is to be fetched.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, providerId }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/sso/providers/${encodeURIComponent(String(providerId))}`,
    );
  },
});

export const supabaseListSsoProviders = tool({
  description:
    'Lists all configured Single Sign-On (SSO) providers for a Supabase project, requiring the project reference ID (`ref`) of an existing project.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The project's reference ID. Typically found in dashboard settings or the API URL.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbGet(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/sso/providers`,
    );
  },
});

export const supabaseUpdateProjectAuthConfig = tool({
  description:
    'Update Supabase project Auth configuration via the Management API. Use to fix misconfigured Auth redirects, SMTP settings, or other auth parameters. Only provided fields are updated; others remain unchanged. Before updating, confirm the Auth service status is ACTIVE_HEALTHY by checking project health.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique reference ID of the Supabase project. Can also be provided as 'project_ref'.",
      ),
    jwtExp: z.number().int().optional().describe('JWT access token expiration time in seconds.'),
    siteUrl: z
      .string()
      .optional()
      .describe(
        'Primary site URL used in email links and redirects. Critical for Auth redirect flows.',
      ),
    smtpHost: z.string().optional().describe('SMTP server host for sending auth emails.'),
    smtpPass: z.string().optional().describe('SMTP password for authentication.'),
    smtpPort: z.number().int().optional().describe('SMTP server port.'),
    smtpUser: z.string().optional().describe('SMTP username for authentication.'),
    disableSignup: z
      .boolean()
      .optional()
      .describe('Disable new signups via email/password and OAuth providers.'),
    mailerOtpExp: z.number().int().optional().describe('Email OTP expiration time in seconds.'),
    uriAllowList: z
      .string()
      .optional()
      .describe('Comma-separated allowlist of redirect URIs/patterns for OAuth callbacks.'),
    sessionsTimebox: z
      .number()
      .int()
      .optional()
      .describe('Maximum session lifetime in seconds. 0 means disabled.'),
    smtpAdminEmail: z
      .string()
      .optional()
      .describe('Admin email address used as the sender for SMTP notifications.'),
    smtpSenderName: z.string().optional().describe('Display name for the SMTP sender.'),
    mailerOtpLength: z.number().int().optional().describe('Email OTP length (number of digits).'),
    rateLimitVerify: z
      .number()
      .int()
      .optional()
      .describe('Rate limit for verification attempts (generic).'),
    externalAzureUrl: z.string().optional().describe('Azure OAuth issuer or discovery URL.'),
    mailerAutoconfirm: z
      .boolean()
      .optional()
      .describe('Automatically confirm new signups (no email confirmation required).'),
    smtpMaxFrequency: z
      .number()
      .int()
      .optional()
      .describe('Rate limit for SMTP sends (emails per minute).'),
    passwordMinLength: z.number().int().optional().describe('Minimum required password length.'),
    rateLimitSmsSent: z
      .number()
      .int()
      .optional()
      .describe('Rate limit for sending SMS (messages per minute).'),
    externalAppleSecret: z.string().optional().describe('Apple OAuth client secret.'),
    externalAzureSecret: z.string().optional().describe('Azure OAuth client secret.'),
    passwordHibpEnabled: z
      .boolean()
      .optional()
      .describe('Enable HaveIBeenPwned check during password set/change.'),
    rateLimitEmailSent: z
      .number()
      .int()
      .optional()
      .describe('Rate limit for sending emails (emails per minute).'),
    externalAppleEnabled: z
      .boolean()
      .optional()
      .describe('Enable Apple as an external OAuth provider.'),
    externalAzureEnabled: z
      .boolean()
      .optional()
      .describe('Enable Azure as an external OAuth provider.'),
    externalEmailEnabled: z.boolean().optional().describe('Enable email sign-in/up.'),
    externalGithubSecret: z.string().optional().describe('GitHub OAuth client secret.'),
    externalGoogleSecret: z.string().optional().describe('Google OAuth client secret.'),
    externalPhoneEnabled: z.boolean().optional().describe('Enable phone (SMS) sign-in/up.'),
    externalGithubEnabled: z
      .boolean()
      .optional()
      .describe('Enable GitHub as an external OAuth provider.'),
    externalGoogleEnabled: z
      .boolean()
      .optional()
      .describe('Enable Google as an external OAuth provider.'),
    mfaTotpEnrollEnabled: z
      .boolean()
      .optional()
      .describe('Enable enrolling TOTP as an MFA factor.'),
    mfaTotpVerifyEnabled: z.boolean().optional().describe('Enable TOTP verification as MFA.'),
    securityCaptchaSecret: z.string().optional().describe('CAPTCHA provider secret key.'),
    externalAppleClientId: z.string().optional().describe('Apple OAuth client ID.'),
    externalAzureClientId: z.string().optional().describe('Azure OAuth client ID.'),
    mfaMaxEnrolledFactors: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of MFA factors a user can enroll.'),
    securityCaptchaEnabled: z
      .boolean()
      .optional()
      .describe('Enable CAPTCHA verification for risky flows.'),
    sessionsSinglePerUser: z
      .boolean()
      .optional()
      .describe('Restrict to a single active session per user.'),
    externalGithubClientId: z.string().optional().describe('GitHub OAuth client ID.'),
    externalGoogleClientId: z.string().optional().describe('Google OAuth client ID.'),
    securityCaptchaProvider: z
      .string()
      .optional()
      .describe('CAPTCHA provider (e.g., hcaptcha, turnstile).'),
    rateLimitAnonymousUsers: z
      .number()
      .int()
      .optional()
      .describe('Rate limit for anonymous users (requests per minute).'),
    sessionsInactivityTimeout: z
      .number()
      .int()
      .optional()
      .describe('Session inactivity timeout in seconds. 0 means disabled.'),
    passwordRequiredCharacters: z
      .string()
      .optional()
      .describe('Character class requirements for passwords (e.g., regex or flags).'),
    refreshTokenRotationEnabled: z
      .boolean()
      .optional()
      .describe('Enable refresh token rotation to reduce token replay risk.'),
    securityManualLinkingEnabled: z
      .boolean()
      .optional()
      .describe('Enable manual linking of identities to accounts.'),
    externalAnonymousUsersEnabled: z
      .boolean()
      .optional()
      .describe('Enable creation of anonymous users (no credentials).'),
    mailerSecureEmailChangeEnabled: z
      .boolean()
      .optional()
      .describe('Require secure email change flow (confirm both old and new emails).'),
    securityRefreshTokenReuseInterval: z
      .number()
      .int()
      .optional()
      .describe('Allowed reuse interval (seconds) for rotated refresh tokens.'),
    mailerAllowUnverifiedEmailSignIns: z
      .boolean()
      .optional()
      .describe('Allow sign-ins from users with unverified emails.'),
    mailerNotificationsEmailChangedEnabled: z
      .boolean()
      .optional()
      .describe("Enable notification emails when a user's email is changed."),
    mailerNotificationsPhoneChangedEnabled: z
      .boolean()
      .optional()
      .describe('Enable notification emails when a phone number is changed.'),
    mailerNotificationsIdentityLinkedEnabled: z
      .boolean()
      .optional()
      .describe('Enable notification emails when an identity is linked.'),
    mailerNotificationsPasswordChangedEnabled: z
      .boolean()
      .optional()
      .describe('Enable notification emails when a password is changed.'),
    mailerNotificationsIdentityUnlinkedEnabled: z
      .boolean()
      .optional()
      .describe('Enable notification emails when an identity is unlinked.'),
    mailerNotificationsMfaFactorEnrolledEnabled: z
      .boolean()
      .optional()
      .describe('Enable notification emails when an MFA factor is enrolled.'),
    securityUpdatePasswordRequireReauthentication: z
      .boolean()
      .optional()
      .describe('Require reauthentication before updating password.'),
    mailerNotificationsMfaFactorUnenrolledEnabled: z
      .boolean()
      .optional()
      .describe('Enable notification emails when an MFA factor is unenrolled.'),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    jwtExp,
    siteUrl,
    smtpHost,
    smtpPass,
    smtpPort,
    smtpUser,
    disableSignup,
    mailerOtpExp,
    uriAllowList,
    sessionsTimebox,
    smtpAdminEmail,
    smtpSenderName,
    mailerOtpLength,
    rateLimitVerify,
    externalAzureUrl,
    mailerAutoconfirm,
    smtpMaxFrequency,
    passwordMinLength,
    rateLimitSmsSent,
    externalAppleSecret,
    externalAzureSecret,
    passwordHibpEnabled,
    rateLimitEmailSent,
    externalAppleEnabled,
    externalAzureEnabled,
    externalEmailEnabled,
    externalGithubSecret,
    externalGoogleSecret,
    externalPhoneEnabled,
    externalGithubEnabled,
    externalGoogleEnabled,
    mfaTotpEnrollEnabled,
    mfaTotpVerifyEnabled,
    securityCaptchaSecret,
    externalAppleClientId,
    externalAzureClientId,
    mfaMaxEnrolledFactors,
    securityCaptchaEnabled,
    sessionsSinglePerUser,
    externalGithubClientId,
    externalGoogleClientId,
    securityCaptchaProvider,
    rateLimitAnonymousUsers,
    sessionsInactivityTimeout,
    passwordRequiredCharacters,
    refreshTokenRotationEnabled,
    securityManualLinkingEnabled,
    externalAnonymousUsersEnabled,
    mailerSecureEmailChangeEnabled,
    securityRefreshTokenReuseInterval,
    mailerAllowUnverifiedEmailSignIns,
    mailerNotificationsEmailChangedEnabled,
    mailerNotificationsPhoneChangedEnabled,
    mailerNotificationsIdentityLinkedEnabled,
    mailerNotificationsPasswordChangedEnabled,
    mailerNotificationsIdentityUnlinkedEnabled,
    mailerNotificationsMfaFactorEnrolledEnabled,
    securityUpdatePasswordRequireReauthentication,
    mailerNotificationsMfaFactorUnenrolledEnabled,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPatch(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth`,
      {
        body: pickDefined({
          jwt_exp: jwtExp,
          site_url: siteUrl,
          smtp_host: smtpHost,
          smtp_pass: smtpPass,
          smtp_port: smtpPort,
          smtp_user: smtpUser,
          disable_signup: disableSignup,
          mailer_otp_exp: mailerOtpExp,
          uri_allow_list: uriAllowList,
          sessions_timebox: sessionsTimebox,
          smtp_admin_email: smtpAdminEmail,
          smtp_sender_name: smtpSenderName,
          mailer_otp_length: mailerOtpLength,
          rate_limit_verify: rateLimitVerify,
          external_azure_url: externalAzureUrl,
          mailer_autoconfirm: mailerAutoconfirm,
          smtp_max_frequency: smtpMaxFrequency,
          password_min_length: passwordMinLength,
          rate_limit_sms_sent: rateLimitSmsSent,
          external_apple_secret: externalAppleSecret,
          external_azure_secret: externalAzureSecret,
          password_hibp_enabled: passwordHibpEnabled,
          rate_limit_email_sent: rateLimitEmailSent,
          external_apple_enabled: externalAppleEnabled,
          external_azure_enabled: externalAzureEnabled,
          external_email_enabled: externalEmailEnabled,
          external_github_secret: externalGithubSecret,
          external_google_secret: externalGoogleSecret,
          external_phone_enabled: externalPhoneEnabled,
          external_github_enabled: externalGithubEnabled,
          external_google_enabled: externalGoogleEnabled,
          mfa_totp_enroll_enabled: mfaTotpEnrollEnabled,
          mfa_totp_verify_enabled: mfaTotpVerifyEnabled,
          security_captcha_secret: securityCaptchaSecret,
          external_apple_client_id: externalAppleClientId,
          external_azure_client_id: externalAzureClientId,
          mfa_max_enrolled_factors: mfaMaxEnrolledFactors,
          security_captcha_enabled: securityCaptchaEnabled,
          sessions_single_per_user: sessionsSinglePerUser,
          external_github_client_id: externalGithubClientId,
          external_google_client_id: externalGoogleClientId,
          security_captcha_provider: securityCaptchaProvider,
          rate_limit_anonymous_users: rateLimitAnonymousUsers,
          sessions_inactivity_timeout: sessionsInactivityTimeout,
          password_required_characters: passwordRequiredCharacters,
          refresh_token_rotation_enabled: refreshTokenRotationEnabled,
          security_manual_linking_enabled: securityManualLinkingEnabled,
          external_anonymous_users_enabled: externalAnonymousUsersEnabled,
          mailer_secure_email_change_enabled: mailerSecureEmailChangeEnabled,
          security_refresh_token_reuse_interval: securityRefreshTokenReuseInterval,
          mailer_allow_unverified_email_sign_ins: mailerAllowUnverifiedEmailSignIns,
          mailer_notifications_email_changed_enabled: mailerNotificationsEmailChangedEnabled,
          mailer_notifications_phone_changed_enabled: mailerNotificationsPhoneChangedEnabled,
          mailer_notifications_identity_linked_enabled: mailerNotificationsIdentityLinkedEnabled,
          mailer_notifications_password_changed_enabled: mailerNotificationsPasswordChangedEnabled,
          mailer_notifications_identity_unlinked_enabled:
            mailerNotificationsIdentityUnlinkedEnabled,
          mailer_notifications_mfa_factor_enrolled_enabled:
            mailerNotificationsMfaFactorEnrolledEnabled,
          security_update_password_require_reauthentication:
            securityUpdatePasswordRequireReauthentication,
          mailer_notifications_mfa_factor_unenrolled_enabled:
            mailerNotificationsMfaFactorUnenrolledEnabled,
        }),
      },
    );
  },
});

export const supabaseUpdateSsoProvider = tool({
  description:
    "Updates an existing SSO provider's SAML metadata, associated email domains, or attribute mappings for a Supabase project, identified by `ref` and `provider_id`.",
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
    domains: z
      .array(z.string())
      .optional()
      .describe('Email domains to associate with this SSO provider for user authentication.'),
    providerId: z.string().describe('UUID of the SSO provider to update.'),
    metadataUrl: z
      .string()
      .optional()
      .describe('URL pointing to the SAML metadata XML. Use either this or `metadata_xml`.'),
    metadataXml: z
      .string()
      .optional()
      .describe(
        'SAML metadata XML content from the identity provider. Use either this or `metadata_url`.',
      ),
    attributeMappingKeys: z
      .record(z.any())
      .optional()
      .describe(
        "Defines mapping of SAML assertion attributes to Supabase user attributes (e.g., 'email', 'full_name'). Values specify IdP attribute mapping using 'name', 'names' (for concatenation), or 'default'.",
      ),
  }),
  execute: async ({
    supabaseAccessToken,
    ref,
    domains,
    providerId,
    metadataUrl,
    metadataXml,
    attributeMappingKeys,
  }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPut(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/config/auth/sso/providers/${encodeURIComponent(String(providerId))}`,
      {
        body: pickDefined({
          domains,
          metadata_url: metadataUrl,
          metadata_xml: metadataXml,
          ...(attributeMappingKeys ? { attribute_mapping: { keys: attributeMappingKeys } } : {}),
        }),
      },
    );
  },
});
