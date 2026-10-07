// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { makeRequest, failedResult, toMakeError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Make credentials JSON with baseUrl (zone URL, e.g. https://eu1.make.com) and apiToken',
  );

function enumTool(description: string, path: string, extra?: z.ZodRawShape) {
  return tool({
    description,
    inputSchema: z.object({ makeCredentials: credentialsField, ...(extra ?? {}) }),
    execute: async ({ makeCredentials, ...rest }: any) => {
      try {
        const query: Record<string, unknown> = {};
        if (rest.language !== undefined) query.language = rest.language;
        const result = await makeRequest(makeCredentials, path, {
          query: Object.keys(query).length ? query : undefined,
        });
        if (!result.ok) return failedResult(`Failed to fetch ${path}`, result);
        return result.data;
      } catch (error) {
        return toMakeError(error, `Error fetching ${path}`);
      }
    },
  });
}

export const makeGetAppsReviewStatuses = enumTool(
  'Retrieve available app review statuses in Make. Use for valid status values in app review workflows.',
  '/enums/apps-review-statuses',
);

export const makeGetImtRegions = enumTool(
  'Retrieve Make regions and their regionId values. Use to get valid region identifiers for creating organizations.',
  '/enums/imt-regions',
);

export const makeGetImtZones = enumTool(
  'Retrieve available Make IMT zones. Use to get valid zone IDs for creating organizations.',
  '/enums/imt-zones',
);

export const makeGetLlmModels = enumTool(
  'Retrieve available large language models in Make. Use for supported LLM models in AI mapping or toolkit configurations.',
  '/enums/llm-models',
);

export const makeGetModuleTypes = enumTool(
  'Retrieve available module types in Make. Use for valid module type values for scenarios or filtering modules.',
  '/enums/module-types',
);

export const makeGetOrganizationFeatures = enumTool(
  'Retrieve available organization features in Make. Use for valid feature values when managing organizations.',
  '/enums/organization-features',
);

export const makeGetUserApiTokenScopes = enumTool(
  'Retrieve all available API token scopes in Make. Use for valid scope options when creating or managing API tokens.',
  '/enums/user-api-token-scopes',
);

export const makeGetUserEmailNotifications = enumTool(
  'Retrieve available email notification types for Make users. Use for valid notification settings or preference selectors.',
  '/enums/user-email-notifications',
  { language: z.string().optional().describe("ISO 639-1 language code, e.g. 'en'") },
);

export const makeGetUserFeatures = enumTool(
  'Retrieve all existing user features and their descriptions. Use to discover available user features in Make.',
  '/enums/user-features',
);

export const makeGetVariableTypes = enumTool(
  'Retrieve available variable types in Make. Use for valid variable type options when creating or managing data stores and variables.',
  '/enums/variable-types',
);

export const makeListCountries = enumTool(
  'Retrieve all supported countries in Make with IDs and ISO codes. Use for valid country values when creating organizations or users.',
  '/enums/countries',
);

export const makeListLanguages = enumTool(
  'Retrieve all supported languages in Make. Use for valid language values in locale settings.',
  '/enums/languages',
);

export const makeListLlmBuiltinTiers = enumTool(
  'Retrieve built-in LLM tiers in Make. Use for valid tier values in AI provider configurations.',
  '/enums/llm-builtin-tiers',
);

export const makeListLocales = enumTool(
  'Retrieve all supported locales in Make. Use for valid locale values in user and organization settings.',
  '/enums/locales',
);

export const makeListTimezones = enumTool(
  'Retrieve all supported timezones in Make. Use to get valid timezone IDs when creating organizations.',
  '/enums/timezones',
);
