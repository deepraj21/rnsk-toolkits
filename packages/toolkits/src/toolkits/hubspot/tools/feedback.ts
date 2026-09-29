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

export const hubspotArchiveBatchOfFeedbackSubmissions = tool({
  description:
    'Asynchronously archives a batch of HubSpot feedback submissions using their unique IDs, which must correspond to valid and existing submissions; the operation is queued, and submissions are moved from active views without being deleted.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        "A list of objects, where each object contains the 'id' of a feedback submission to be archived.",
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotArchiveFeedbackSubmission = tool({
  description:
    'Archives an existing, non-archived Feedback Submission in HubSpot CRM by its ID, moving it to the recycling bin (not permanently deleting it).',
  inputSchema: z.object({
    hubspotToken: tokenField,
    feedbackSubmissionId: z
      .string()
      .describe(
        'The unique identifier of an existing Feedback Submission in HubSpot CRM to be archived.',
      ),
  }),
  execute: async ({ hubspotToken, feedbackSubmissionId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/feedback_submissions/${encodeURIComponent(String(feedbackSubmissionId))}`,
    );
  },
});

export const hubspotCreateBatchOfFeedbackSubmissions = tool({
  description:
    'Creates a batch of feedback submissions in HubSpot, ideal for bulk imports; all property names, `associationTypeId`s, and association `to_id`s must reference existing entities in HubSpot.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({ properties: z.record(z.any()), associations: z.array(z.record(z.any())) })
          .catchall(z.any()),
      )
      .describe(
        'A list of feedback submission objects to create. Each object defines the properties and associations for a new feedback submission.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateFeedbackSubmission = tool({
  description:
    'Creates a new HubSpot feedback submission to record customer feedback (e.g., survey responses, support interactions), optionally associating it with CRM objects.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    properties: z
      .record(z.any())
      .describe(
        "Properties for the feedback submission. Keys are internal names (e.g., 'hs_feedback_rating'), values must be strings. Property names must be pre-defined in your HubSpot account.",
      ),
    associations: z
      .array(
        z
          .object({ types: z.array(z.record(z.any())), to__id: z.string().optional() })
          .catchall(z.any()),
      )
      .describe(
        'Associations between this feedback submission and other CRM objects, specifying target object ID and association types.',
      ),
  }),
  execute: async ({ hubspotToken, properties, associations }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions`, {
      body: pickDefined({ properties: properties, associations: associations }),
    });
  },
});

export const hubspotListFeedbackSubmissions = tool({
  description:
    'Retrieves a paginated list of feedback submissions from HubSpot, allowing specification of properties (including history), associated object IDs, and filtering by archive status.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'The pagination token to retrieve the next page of results. This value is obtained from the `paging.next.after` field of a previous response. If omitted, the first page is returned. Use with `limit` for iterating through large sets of feedback submissions.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of feedback submissions to return per page. Using smaller values can lead to quicker responses, while larger values reduce the total number of API calls for large datasets.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Specifies whether to include archived feedback submissions. Set to `True` to retrieve only archived submissions. `False` (default) retrieves only active (non-archived) submissions. Useful for accessing historical or managing archived feedback.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        "List of HubSpot internal property names to include for each feedback submission in the response (e.g., `hs_sentiment`, `hs_survey_name`, `hs_content`). If specified, only these properties are returned. If a property doesn't exist for a submission, it's ignored. If omitted, a default set of properties is returned.",
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "List of object types (e.g., `contact`, `survey`, `ticket`) for which to retrieve associated IDs. This allows fetching IDs of related objects. If an association doesn't exist for a submission, it's ignored.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'List of HubSpot internal property names for which to include historical values. The response includes both current and past values for these properties. Requesting history may affect the number of submissions returned per page due to increased response size.',
      ),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    archived,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/feedback_submissions`, {
      query: pickDefined({
        after: after,
        limit: limit,
        archived: archived,
        properties: properties,
        associations: associations,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotMergeFeedbackSubmissions = tool({
  description:
    'Merges two existing feedback submissions by ID, primarily for consolidating duplicates or related feedback; this operation is irreversible, and `primaryObjectId` values take precedence in conflicts.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe(
        'The unique identifier of the feedback submission to be merged into the primary one. This submission will be absorbed and typically archived or deleted after the merge process.',
      ),
    primaryObjectId: z
      .string()
      .describe(
        'The unique identifier of the feedback submission that will remain as the primary record after the merge. It will contain the combined information from both submissions.',
      ),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotReadBatchFeedbackSubmissionsByIdOrProperty = tool({
  description:
    'Retrieves up to 100 feedback submissions in a batch using their IDs or a specified unique `idProperty`, optionally including specified properties and their history.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        "Identifiers for feedback submissions to retrieve, using primary 'id' or `idProperty`.",
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to retrieve only archived submissions; `false` (default) for active submissions.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Unique identifier property name to use instead of 'id'; `inputs` should contain values for this property if provided.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Property names to return for each feedback submission; defaults if not specified.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Property names for which to retrieve historical values; past values are included if updated.',
      ),
  }),
  execute: async ({
    hubspotToken,
    inputs,
    archived,
    idProperty,
    properties,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions/batch/read`, {
      body: pickDefined({
        inputs: inputs,
        archived: archived,
        idProperty: idProperty,
        properties: properties,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotReadFeedbackSubmissionById = tool({
  description:
    "Reads a HubSpot feedback submission by its ID, optionally using a custom unique 'idProperty', and allows specifying properties to return including history and associations.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to true to retrieve only archived submissions; false (default) retrieves active ones.',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Name of a unique property (e.g., 'survey_response_id') to use as the identifier instead of the internal object ID. Its values must be unique.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Specific feedback submission property names to include in the response; HubSpot ignores non-existent ones.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Object types (e.g., 'CONTACT') for which to retrieve associated IDs; HubSpot ignores non-existent associations.",
      ),
    feedbackSubmissionId: z
      .string()
      .describe(
        "Identifier of the feedback submission to retrieve; use a custom property value if 'idProperty' is set. Must be an existing submission.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Feedback submission property names for which to include a history of values; HubSpot ignores non-existent ones.',
      ),
  }),
  execute: async ({
    hubspotToken,
    archived,
    idProperty,
    properties,
    associations,
    feedbackSubmissionId,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/objects/feedback_submissions/${encodeURIComponent(String(feedbackSubmissionId))}`,
      {
        query: pickDefined({
          archived: archived,
          idProperty: idProperty,
          properties: properties,
          associations: associations,
          propertiesWithHistory: propertiesWithHistory,
        }),
      },
    );
  },
});

export const hubspotSearchFeedbackSubmissions = tool({
  description:
    'Searches for feedback submissions in HubSpot CRM using text query, filter groups, sorting, and pagination, returning specified properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'A pagination token from a previous response to retrieve the next page of results. Omit for the first page.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of feedback submissions to return in a single response. Defaults to 10.',
      ),
    query: z
      .string()
      .optional()
      .describe(
        'A string to search across all searchable properties of feedback submissions. This performs a broad text search.',
      ),
    sorts: z
      .array(z.string())
      .optional()
      .describe(
        'A list of property names to sort the results by. Properties are sorted in ascending order by default. Prefix a property name with a hyphen (`-`) for descending order. Defaults to creation order (oldest first) if omitted.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of specific feedback submission property names to be included in the response. If omitted, returns default properties: hs_createdate, hs_lastmodifieddate, and hs_object_id.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())) }).catchall(z.any()))
      .optional()
      .describe(
        'A list of filter groups to apply to the search. Each group represents a set of AND-ed filters. Multiple filter groups are combined using OR logic. Maximum 5 groups with up to 6 filters each (18 total filters maximum).',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, query, sorts, properties, filterGroups }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after }),
    });
  },
});

export const hubspotUpdateBatchFeedbackSubmissions = tool({
  description:
    'Updates a batch of HubSpot feedback submissions; property keys must be existing internal HubSpot names and values must be correctly formatted strings.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            id: z.string(),
            idProperty: z.string().optional(),
            properties: z.record(z.any()),
          })
          .catchall(z.any()),
      )
      .describe(
        'List of feedback submissions to update, each specifying its identifier and new property values.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/feedback_submissions/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});

export const hubspotUpdateFeedbackSubmission = tool({
  description:
    'Partially updates writable properties of an existing HubSpot Feedback Submission, identified by its `feedbackSubmissionId` (which can be an internal object ID, or a unique property value if `idProperty` is specified).',
  inputSchema: z.object({
    hubspotToken: tokenField,
    idProperty: z
      .string()
      .optional()
      .describe(
        'The name of a unique property used to identify the Feedback Submission. If provided, `feedbackSubmissionId` must contain the value of this property, instead of the internal object ID. This property must be a unique identifier for Feedback Submission objects.',
      ),
    properties: z
      .record(z.any())
      .describe(
        'A dictionary of properties to update on the Feedback Submission. Keys are the internal names of the properties, and values are their new string values. Only properties included here will be modified; others will remain unchanged.',
      ),
    feedbackSubmissionId: z
      .string()
      .describe(
        'The unique identifier of the Feedback Submission to update. This can be its internal object ID or a unique property value if `idProperty` is specified. Must be a non-empty string.',
      ),
  }),
  execute: async ({ hubspotToken, idProperty, properties, feedbackSubmissionId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/feedback_submissions/${encodeURIComponent(String(feedbackSubmissionId))}`,
      {
        body: pickDefined({ properties: properties }),
      },
    );
  },
});
