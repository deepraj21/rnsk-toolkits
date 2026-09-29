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

export const hubspotAuditPipelineChanges = tool({
  description:
    "Retrieves a reverse chronological audit log of all changes for a specific, existing HubSpot CRM pipeline, which is identified by its `pipelineId` and a valid `objectType` that supports pipelines (e.g., 'deals', 'tickets'). Best-effort mapping to the HubSpot pipeline audit endpoint.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "The HubSpot CRM object type that has pipelines (e.g., 'deals', 'tickets'); determines the pipeline's context. Must be a valid, case-sensitive object type.",
      ),
    pipelineId: z
      .string()
      .describe(
        'The unique identifier of an existing pipeline within the specified `objectType` for which to retrieve the audit history.',
      ),
  }),
  execute: async ({ hubspotToken, objectType, pipelineId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/audit`,
    );
  },
});

export const hubspotCreatePipeline = tool({
  description:
    "Creates a new HubSpot pipeline for a specified CRM `objectType` (e.g., 'deals', 'tickets'), requiring the pipeline `label` be unique for that `objectType` and each stage `label` be unique within the pipeline.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z
      .string()
      .describe(
        'A unique label for the pipeline, used for organization in the HubSpot UI for this object type.',
      ),
    stages: z
      .array(
        z
          .object({
            label: z.string(),
            metadata: z.record(z.any()),
            displayOrder: z.number().int(),
          })
          .catchall(z.any()),
      )
      .describe(
        'A list of stage definitions for the new pipeline; each stage `label` must be unique within this pipeline.',
      ),
    objectType: z
      .string()
      .describe(
        "Identifier for the CRM object type (e.g., 'deals', 'tickets', or a custom object type ID) for the new pipeline, determining its context and properties in HubSpot.",
      ),
    displayOrder: z
      .number()
      .int()
      .describe(
        'Display order for this pipeline. Pipelines for the same object type with matching `displayOrder` are sorted alphabetically by label.',
      ),
  }),
  execute: async ({ hubspotToken, label, stages, objectType, displayOrder }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}`, {
      body: pickDefined({ label: label, stages: stages, displayOrder: displayOrder }),
    });
  },
});

export const hubspotCreatePipelineStage = tool({
  description:
    "Creates a new stage in a specified HubSpot CRM pipeline for a given object type, such as 'deals' or 'tickets'.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z
      .string()
      .describe('User-visible name for the pipeline stage, unique within the parent pipeline.'),
    metadata: z
      .record(z.any())
      .describe(
        'Stage-specific properties. For `deals` pipelines, `metadata` must include a `probability` key (value 0.0-1.0 in 0.1 increments). For `tickets` pipelines, an optional `ticketState` key can specify `OPEN` or `CLOSED` status.',
      ),
    objectType: z
      .string()
      .describe(
        "CRM object type (e.g., 'deals', 'tickets') for the new stage. Must be a valid HubSpot CRM object type supporting pipelines. Typically lowercase and plural.",
      ),
    pipelineId: z
      .string()
      .describe(
        'Identifier of the existing pipeline (specific to `objectType`) where the new stage will be added.',
      ),
    displayOrder: z
      .number()
      .int()
      .describe(
        "Stage's display order in the pipeline (lower numbers first). Stages with identical `displayOrder` are sorted alphabetically by `label`.",
      ),
  }),
  execute: async ({ hubspotToken, label, metadata, objectType, pipelineId, displayOrder }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages`,
      {
        body: pickDefined({ label: label, metadata: metadata, displayOrder: displayOrder }),
      },
    );
  },
});

export const hubspotDeletePipeline = tool({
  description:
    'Permanently deletes a HubSpot pipeline and all its stages by `pipelineId` and `objectType`; this is irreversible, so use validation flags to avoid errors if the pipeline is not empty.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        'Type of CRM object associated with the pipeline, determining which pipeline category is affected.',
      ),
    pipelineId: z.string().describe('Unique identifier of the pipeline to be deleted.'),
    validateReferencesBeforeDelete: z
      .boolean()
      .optional()
      .describe(
        'If true, HubSpot checks for existing references to this pipeline before deletion to prevent data loss or orphaned records.',
      ),
    validateDealStageUsagesBeforeDelete: z
      .boolean()
      .optional()
      .describe(
        'If true (for deal pipelines), HubSpot verifies if any deals use stages from this pipeline before deletion to prevent disruption.',
      ),
  }),
  execute: async ({
    hubspotToken,
    objectType,
    pipelineId,
    validateReferencesBeforeDelete,
    validateDealStageUsagesBeforeDelete,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}`,
      {
        query: pickDefined({
          validateReferencesBeforeDelete: validateReferencesBeforeDelete,
          validateDealStageUsagesBeforeDelete: validateDealStageUsagesBeforeDelete,
        }),
      },
    );
  },
});

export const hubspotDeletePipelineStage = tool({
  description:
    "Permanently deletes a specific pipeline stage for an `objectType` (e.g., 'deals', 'tickets') that supports pipelines; this operation is irreversible, so ensure no active CRM records are associated with the stage to prevent data issues.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    stageId: z.string().describe('Identifier of the pipeline stage to be deleted.'),
    objectType: z
      .string()
      .describe("The CRM object type for the pipeline (e.g., 'deals', 'tickets')."),
    pipelineId: z
      .string()
      .describe(
        'Identifier of the pipeline (specific to the `objectType`) from which the stage will be deleted.',
      ),
  }),
  execute: async ({ hubspotToken, stageId, objectType, pipelineId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages/${encodeURIComponent(String(stageId))}`,
    );
  },
});

export const hubspotGetPipelineById = tool({
  description:
    'Retrieves a specific pipeline by its ID and CRM object type, detailing its stages and properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        'The CRM object type for which the pipeline is being retrieved. Must be a valid HubSpot object type that supports pipelines.',
      ),
    pipelineId: z
      .string()
      .describe(
        'Unique identifier of the pipeline to retrieve for the specified object type, typically a system-generated string or UUID.',
      ),
  }),
  execute: async ({ hubspotToken, objectType, pipelineId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}`,
    );
  },
});

export const hubspotGetPipelineStageAudit = tool({
  description:
    'Retrieves a reverse chronological list of all mutations (changes) for a specific pipeline stage, including CREATE and UPDATE events with timestamps and details. Best-effort mapping to the HubSpot pipeline-stage audit endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    stageId: z.string().describe('The unique identifier of the pipeline stage.'),
    objectType: z
      .string()
      .describe("The CRM object type (e.g., 'deals', 'tickets') for the pipeline stage."),
    pipelineId: z.string().describe('The unique identifier of the pipeline containing the stage.'),
  }),
  execute: async ({ hubspotToken, stageId, objectType, pipelineId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages/${encodeURIComponent(String(stageId))}/audit`,
    );
  },
});

export const hubspotReplaceAllPropertiesOfPipeline = tool({
  description:
    'Overwrites an entire CRM pipeline (specified by `objectType` and `pipelineId`) and all its stages with a new definition, returning the updated pipeline. Full replacement: every pipeline field must be supplied, omitted fields are cleared.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z.string().describe('Unique label for this pipeline, for UI organization.'),
    stages: z
      .array(
        z
          .object({
            label: z.string(),
            metadata: z.record(z.any()),
            displayOrder: z.number().int(),
          })
          .catchall(z.any()),
      )
      .describe(
        'A list of stage definitions that will completely replace all existing stages in the pipeline.',
      ),
    objectType: z
      .string()
      .describe(
        "Identifies the CRM object type (e.g., 'deals', 'tickets') for the pipeline being updated.",
      ),
    pipelineId: z
      .string()
      .describe('Unique ID of the pipeline to update, specific to its `objectType`.'),
    displayOrder: z
      .number()
      .int()
      .describe(
        'Display order for this pipeline; those with the same order are sorted alphabetically by `label`.',
      ),
    validateReferencesBeforeDelete: z
      .boolean()
      .optional()
      .describe(
        'If true, validates existing references to the pipeline before updating to prevent issues from modifying referenced stages.',
      ),
    validateDealStageUsagesBeforeDelete: z
      .boolean()
      .optional()
      .describe(
        "If true and `objectType` is 'deals', checks deal stage usage before modification/deletion to prevent data issues.",
      ),
  }),
  execute: async ({
    hubspotToken,
    label,
    stages,
    objectType,
    pipelineId,
    displayOrder,
    validateReferencesBeforeDelete,
    validateDealStageUsagesBeforeDelete,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPut(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}`,
      {
        body: pickDefined({
          label: label,
          stages: stages,
          displayOrder: displayOrder,
          validateReferencesBeforeDelete: validateReferencesBeforeDelete,
          validateDealStageUsagesBeforeDelete: validateDealStageUsagesBeforeDelete,
        }),
      },
    );
  },
});

export const hubspotReplacePipelineStageProperties = tool({
  description:
    "Replaces all properties of a specified pipeline stage; the new `label` must be unique within the pipeline, and if `objectType` is 'deals', the `metadata` must include a 'probability' key. Full replacement: supply every stage field, omitted fields are cleared.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z.string().describe('A new label for the pipeline stage.'),
    stageId: z
      .string()
      .describe(
        'Unique identifier of the specific pipeline stage to be updated, assigned by HubSpot and unique to the stage within its pipeline.',
      ),
    metadata: z
      .record(z.any())
      .describe(
        "Key-value pairs for custom stage properties; all values must be strings. For 'deals' `objectType`, 'probability' (string: number from 0.0-1.0 in 0.1 increments, e.g., '0.5') is required. For 'tickets' `objectType`, 'ticketState' (string: 'OPEN' or 'CLOSED') is optional.",
      ),
    objectType: z
      .string()
      .describe(
        "The CRM object type associated with the pipeline (e.g., 'deals' for sales pipelines, 'tickets' for support pipelines).",
      ),
    pipelineId: z
      .string()
      .describe(
        'Unique identifier of the pipeline, assigned by HubSpot when the pipeline is created.',
      ),
    displayOrder: z
      .number()
      .int()
      .describe(
        'The display order for this pipeline stage. Stages with the same `displayOrder` value are sorted alphabetically by their label. Use -1 to place the stage at the end.',
      ),
  }),
  execute: async ({
    hubspotToken,
    label,
    stageId,
    metadata,
    objectType,
    pipelineId,
    displayOrder,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPut(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages/${encodeURIComponent(String(stageId))}`,
      {
        body: pickDefined({ label: label, metadata: metadata, displayOrder: displayOrder }),
      },
    );
  },
});

export const hubspotRetrieveAllPipelinesForSpecifiedObjectType = tool({
  description:
    'Retrieves all pipelines in HubSpot for a specified CRM object type, such as deals or tickets.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        "The case-sensitive CRM object type (e.g., 'deals', 'tickets') for which to retrieve pipelines; must support pipelines.",
      ),
  }),
  execute: async ({ hubspotToken, objectType }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}`);
  },
});

export const hubspotRetrievePipelineStageById = tool({
  description:
    'Fetches detailed properties and metadata (e.g., label, display order, custom properties) for a specific stage within a HubSpot CRM pipeline, identified by its `objectType`, `pipelineId`, and `stageId`.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    stageId: z
      .string()
      .describe(
        'The unique identifier (ID) of the specific pipeline stage to retrieve. This ID must be valid and exist within the specified pipeline.',
      ),
    objectType: z
      .string()
      .describe(
        "The type of CRM object associated with the pipeline (e.g., 'deals', 'tickets'). This is case-sensitive and determines which object-specific pipeline and stages are queried. Must be a valid HubSpot CRM object type.",
      ),
    pipelineId: z
      .string()
      .describe(
        'The unique identifier (ID) of the pipeline containing the stage. This ID must be valid and correspond to the specified `objectType`.',
      ),
  }),
  execute: async ({ hubspotToken, stageId, objectType, pipelineId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages/${encodeURIComponent(String(stageId))}`,
    );
  },
});

export const hubspotRetrievePipelineStages = tool({
  description: 'Fetches all stages for a specified HubSpot CRM object type and pipeline ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectType: z
      .string()
      .describe(
        'The CRM object type (e.g., deals, tickets) for which to retrieve pipeline stages; must support pipelines.',
      ),
    pipelineId: z
      .string()
      .describe(
        'The unique ID of the pipeline associated with the specified objectType whose stages are to be retrieved.',
      ),
  }),
  execute: async ({ hubspotToken, objectType, pipelineId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages`,
    );
  },
});

export const hubspotUpdatePipeline = tool({
  description:
    "Partially updates a CRM pipeline's label, display order, or restores an archived pipeline by setting `archived` to `false`.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z.string().optional().describe('Unique label for the pipeline for UI organization.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'To restore an archived pipeline, set to `false`. Other uses (e.g., archiving an active pipeline or setting `false` for an already active one) will result in a `400 Bad Request`.',
      ),
    objectType: z
      .string()
      .describe("Type of CRM object the pipeline is associated with (e.g., 'deals', 'tickets')."),
    pipelineId: z.string().describe('Unique identifier of the pipeline to update.'),
    displayOrder: z
      .number()
      .int()
      .optional()
      .describe(
        'Display order for the pipeline. Pipelines with the same order are sorted alphabetically by label.',
      ),
    validateReferencesBeforeDelete: z
      .boolean()
      .optional()
      .describe(
        'If `true`, verify existing references to pipeline stages before updates that could delete or alter them.',
      ),
    validateDealStageUsagesBeforeDelete: z
      .boolean()
      .optional()
      .describe(
        'For deal pipelines only: if `true`, check if any deals use stages affected by the update.',
      ),
  }),
  execute: async ({
    hubspotToken,
    label,
    archived,
    objectType,
    pipelineId,
    displayOrder,
    validateReferencesBeforeDelete,
    validateDealStageUsagesBeforeDelete,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}`,
      {
        body: pickDefined({
          label: label,
          archived: archived,
          displayOrder: displayOrder,
          validateReferencesBeforeDelete: validateReferencesBeforeDelete,
          validateDealStageUsagesBeforeDelete: validateDealStageUsagesBeforeDelete,
        }),
      },
    );
  },
});

export const hubspotUpdatePipelineStage = tool({
  description:
    'Partially updates a HubSpot CRM pipeline stage identified by `objectType`, `pipelineId`, and `stageId`, requiring `metadata` in the request; unspecified fields are unchanged.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    label: z
      .string()
      .optional()
      .describe(
        'The display name (label) of the pipeline stage. This label must be unique within the pipeline it belongs to. Omit to leave unchanged.',
      ),
    stageId: z
      .string()
      .describe(
        'Unique identifier of the pipeline stage to update; must exist within the specified `pipelineId`.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to archive the pipeline stage, `false` to unarchive. If omitted, its archival status remains unchanged.',
      ),
    metadata: z
      .record(z.any())
      .optional()
      .describe(
        "Stage-specific metadata (key-value string pairs) based on `objectType`. Omit to leave unchanged.\n- For 'deals': If provided, MUST include 'probability' (string '0.0'-'1.0', e.g., '0.7', in '0.1' increments).\n- For 'tickets': Optional 'ticketState' ('OPEN' or 'CLOSED').\n- For other object types, an empty `{}` may be used.",
      ),
    objectType: z
      .string()
      .describe(
        "Type of CRM object (e.g., 'deals', 'tickets') for the pipeline; must be a valid HubSpot object type that supports pipelines.",
      ),
    pipelineId: z
      .string()
      .describe(
        'Unique identifier of the pipeline (specific to the HubSpot account and `objectType`) containing the stage to update; must refer to an existing pipeline.',
      ),
    displayOrder: z
      .number()
      .int()
      .optional()
      .describe(
        'The display order for this pipeline stage. If multiple stages share the same `displayOrder`, they are sorted alphabetically by `label`. Lower numbers appear first. Omit to leave unchanged.',
      ),
  }),
  execute: async ({
    hubspotToken,
    label,
    stageId,
    archived,
    metadata,
    objectType,
    pipelineId,
    displayOrder,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/pipelines/${encodeURIComponent(String(objectType))}/${encodeURIComponent(String(pipelineId))}/stages/${encodeURIComponent(String(stageId))}`,
      {
        body: pickDefined({
          label: label,
          archived: archived,
          metadata: metadata,
          displayOrder: displayOrder,
        }),
      },
    );
  },
});
