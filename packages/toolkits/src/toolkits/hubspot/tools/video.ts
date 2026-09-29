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

export const hubspotDeleteVideoConferencingAppSettings = tool({
  description:
    'Irreversibly deletes all settings for a video conferencing application identified by its `appId` in HubSpot, removing its configuration and preventing it from functioning until reconfigured; existing meetings and historical data are unaffected. Note: This API requires developer API key (hapikey) authentication from your HubSpot developer account, not OAuth tokens.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'The unique identifier for the video conferencing application whose settings are to be deleted; assigned when the application is created in your HubSpot developer portal.',
      ),
  }),
  execute: async ({ hubspotToken, appId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/extensions/videoconferencing/${encodeURIComponent(String(appId))}/settings`,
    );
  },
});

export const hubspotRetrieveVideoConferenceSettingsById = tool({
  description:
    'Retrieves video conference application settings, such as webhook URLs and user/account management configurations, for a specified `appId`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'The unique integer identifier for the video conference application, corresponding to the ID of the application created in your HubSpot developer portal.',
      ),
  }),
  execute: async ({ hubspotToken, appId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/extensions/videoconferencing/${encodeURIComponent(String(appId))}/settings`,
    );
  },
});

export const hubspotUpdateVideoConferenceAppSettings = tool({
  description:
    'Updates webhook URLs (for creating/updating/deleting meetings, fetching accounts, verifying users) for a video conference application specified by `appId`. Requires developer API key authentication. All URLs must use HTTPS protocol and be publicly accessible. Requires a developer app; URLs must be public HTTPS.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .number()
      .int()
      .describe(
        'Unique identifier for the video conference application in HubSpot, assigned upon creation in the developer portal. Example: 12345.',
      ),
    userVerifyUrl: z
      .string()
      .optional()
      .describe(
        "URL HubSpot uses to verify a user's existence and authentication with the video conference app, confirming identity before certain actions.",
      ),
    createMeetingUrl: z
      .string()
      .describe(
        'URL HubSpot uses to send requests for creating new video conference meetings. Must use HTTPS protocol.',
      ),
    deleteMeetingUrl: z
      .string()
      .optional()
      .describe(
        'URL HubSpot uses to notify the video conference app when an integrated meeting is deleted in HubSpot.',
      ),
    fetchAccountsUri: z
      .string()
      .optional()
      .describe(
        'URL HubSpot uses to fetch user accounts from the video conference app, enabling users to select from multiple accounts if available.',
      ),
    updateMeetingUrl: z
      .string()
      .optional()
      .describe(
        'URL HubSpot uses to send updates for existing meetings, e.g., when details like topic or schedule are modified within HubSpot.',
      ),
  }),
  execute: async ({
    hubspotToken,
    appId,
    userVerifyUrl,
    createMeetingUrl,
    deleteMeetingUrl,
    fetchAccountsUri,
    updateMeetingUrl,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/extensions/videoconferencing/${encodeURIComponent(String(appId))}/settings`,
      {
        body: pickDefined({
          userVerifyUrl: userVerifyUrl,
          createMeetingUrl: createMeetingUrl,
          deleteMeetingUrl: deleteMeetingUrl,
          fetchAccountsUri: fetchAccountsUri,
          updateMeetingUrl: updateMeetingUrl,
        }),
      },
    );
  },
});
