// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotConfigureCallingExtensionSettings = tool({
  description:
    "Configures or updates settings for a HubSpot app's calling extension, including its name, UI URL, iframe dimensions, `isReady` status, and `supportsCustomObjects` flag, for the specified `appId`.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    url: z
      .string()
      .describe(
        'Publicly accessible HTTPS URL for the phone/calling UI, which should be built using the HubSpot Calling SDK.',
      ),
    name: z.string().describe('Display name for the calling service in the HubSpot interface.'),
    appId: z
      .number()
      .int()
      .describe(
        'Unique identifier for the target HubSpot app whose calling extension settings are being configured.',
      ),
    width: z
      .number()
      .int()
      .describe('Target width in pixels for the iframe embedding the calling UI.'),
    height: z
      .number()
      .int()
      .describe('Target height in pixels for the iframe embedding the calling UI.'),
    isReady: z
      .boolean()
      .optional()
      .describe(
        "If `true`, the calling service appears as an option under the 'Call' action in contact records; `false` hides it.",
      ),
    supportsCustomObjects: z
      .boolean()
      .optional()
      .describe(
        "Specifies if the service is compatible with HubSpot's engagement v2 service and custom objects.",
      ),
  }),
  execute: async ({
    hubspotToken,
    url,
    name,
    appId,
    width,
    height,
    isReady,
    supportsCustomObjects,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings`,
      {
        body: pickDefined({
          url: url,
          name: name,
          width: width,
          height: height,
          isReady: isReady,
          supportsCustomObjects: supportsCustomObjects,
        }),
      },
    );
  },
});

export const hubspotDeleteCallingExtensionSettings = tool({
  description:
    'Permanently deletes the settings for a calling extension app, specified by its `appId`, rendering it unusable for all connected HubSpot accounts; this operation is irreversible.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'The unique identifier for the calling extension app to be deleted. This ID is assigned by HubSpot when the extension is created.',
      ),
  }),
  execute: async ({ hubspotToken, appId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings`,
    );
  },
});

export const hubspotFetchRecordingSettings = tool({
  description:
    'Fetches call recording settings for a specified, existing HubSpot calling extension app. Best-effort mapping to the HubSpot calling recording-settings endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe('The unique identifier for an existing calling extension app.'),
  }),
  execute: async ({ hubspotToken, appId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings/recording`,
    );
  },
});

export const hubspotRetrieveCallingSettingsForApp = tool({
  description:
    'Retrieves the read-only calling extension settings for a specific HubSpot app; the app must exist and have calling extensions configured.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z.number().int().describe('The unique integer identifier for the target HubSpot app.'),
  }),
  execute: async ({ hubspotToken, appId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings`,
    );
  },
});

export const hubspotSetCallRecordingSettings = tool({
  description:
    "Configures the URL (`urlToRetrieveAuthedRecording`) that HubSpot uses to retrieve call recordings for a specified third-party calling app (`appId`). The URL must contain a %s placeholder which HubSpot replaces with the engagement's externalId. The calling app must be an existing calling extension app integrated with the HubSpot account. The URL must contain a %s placeholder for the engagement externalId. Best-effort mapping.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'Unique identifier for the third-party calling app integration in HubSpot CRM whose recording settings will be modified.',
      ),
    urlToRetrieveAuthedRecording: z
      .string()
      .describe(
        "Endpoint URL for HubSpot to retrieve call recordings; must contain %s placeholder which HubSpot will replace with the engagement's externalId, and must serve recordings with authentication if required.",
      ),
  }),
  execute: async ({ hubspotToken, appId, urlToRetrieveAuthedRecording }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings/recording`,
      {
        body: pickDefined({ urlToRetrieveAuthedRecording: urlToRetrieveAuthedRecording }),
      },
    );
  },
});

export const hubspotUpdateCallingAppRecordingSettings = tool({
  description:
    'Updates the recording settings, such as the URL for retrieving authenticated recordings, for a specific calling extension app identified by its `appId`. Best-effort mapping to the HubSpot calling recording-settings endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z.number().int().describe('The unique identifier for the calling app.'),
    urlToRetrieveAuthedRecording: z
      .string()
      .optional()
      .describe(
        'URL HubSpot uses to retrieve call recordings requiring authentication from the calling app.',
      ),
  }),
  execute: async ({ hubspotToken, appId, urlToRetrieveAuthedRecording }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings/recording`,
      {
        body: pickDefined({ urlToRetrieveAuthedRecording: urlToRetrieveAuthedRecording }),
      },
    );
  },
});

export const hubspotUpdateCallingExtensionSettings = tool({
  description:
    'Updates settings (e.g., display name, UI URL/dimensions, feature flags) for an existing calling extension app, identified by `appId`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    url: z
      .string()
      .optional()
      .describe(
        'URL to the phone/calling UI, which should be built using the HubSpot Calling SDK.',
      ),
    name: z.string().optional().describe('User-facing display name of the calling service.'),
    appId: z
      .number()
      .int()
      .describe(
        'The unique ID of the target app whose calling extension settings are being modified.',
      ),
    width: z
      .number()
      .int()
      .optional()
      .describe('Target width (pixels) of the iframe embedding the phone/calling UI.'),
    height: z
      .number()
      .int()
      .optional()
      .describe('Target height (pixels) of the iframe embedding the phone/calling UI.'),
    isReady: z
      .boolean()
      .optional()
      .describe(
        "If `true`, the calling service appears as an option under the 'Call' action in contact records.",
      ),
    supportsCustomObjects: z
      .boolean()
      .optional()
      .describe(
        "Indicates if the calling service is compatible with HubSpot's engagement V2 service and custom objects.",
      ),
  }),
  execute: async ({
    hubspotToken,
    url,
    name,
    appId,
    width,
    height,
    isReady,
    supportsCustomObjects,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/extensions/calling/${encodeURIComponent(String(appId))}/settings`,
      {
        body: pickDefined({
          url: url,
          name: name,
          width: width,
          height: height,
          isReady: isReady,
          supportsCustomObjects: supportsCustomObjects,
        }),
      },
    );
  },
});
