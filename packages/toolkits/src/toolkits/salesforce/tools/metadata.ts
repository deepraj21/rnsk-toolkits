// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceCreateCustomField = tool({
  description:
    'Tool to create a custom field on a Salesforce object using the Tooling API. Use when you need to add a new field (Text, Number, Checkbox, Date, Picklist, Lookup, etc.) to any standard or custom object without deploying metadata packages. The Tooling API provides direct field creation for rapid development and automation tasks.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    label: z.string().describe('The display label for the field shown in the Salesforce UI.'),
    scale: z
      .number()
      .int()
      .optional()
      .describe(
        'Number of decimal places for Number, Currency, or Percent fields. Must be less than precision.',
      ),
    length: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum character length. Required for Text (max 255) and LongTextArea (max 131072) fields.',
      ),
    unique: z
      .boolean()
      .optional()
      .describe(
        'If true, enforce that all values in this field are unique across all records (case-insensitive by default).',
      ),
    required: z
      .boolean()
      .optional()
      .describe('If true, this field must be populated when creating or editing records.'),
    precision: z
      .number()
      .int()
      .optional()
      .describe(
        'Total number of digits for Number, Currency, or Percent fields (including decimal places). Maximum is 18.',
      ),
    fieldType: z
      .enum([
        'Text',
        'LongTextArea',
        'Number',
        'Checkbox',
        'Date',
        'DateTime',
        'Picklist',
        'MultiselectPicklist',
        'Lookup',
        'Email',
        'Phone',
        'Url',
        'Currency',
        'Percent',
      ])
      .describe(
        'The type of custom field to create. Common types: Text (string up to 255 chars), LongTextArea (larger text), Number (integer or decimal), Checkbox (boolean), Date, DateTime, Picklist (single-select dropdown), MultiselectPicklist (multi-sele',
      ),
    restricted: z
      .boolean()
      .optional()
      .describe(
        'For Picklist/MultiselectPicklist fields, if true restricts values to only those defined in the picklist (no custom values allowed).',
      ),
    description: z
      .string()
      .optional()
      .describe("Optional description of the field's purpose and usage."),
    externalId: z
      .boolean()
      .optional()
      .describe(
        'If true, marks this field as an external ID for integration purposes (allows upsert operations and improves query performance).',
      ),
    referenceTo: z
      .string()
      .optional()
      .describe(
        "For Lookup fields, the API name of the object this field references (e.g., 'Account', 'Contact', 'CustomObject__c').",
      ),
    defaultValue: z
      .string()
      .optional()
      .describe(
        "Default value for the field. Format depends on field type (e.g., 'true'/'false' for Checkbox, date string for Date fields).",
      ),
    visibleLines: z
      .number()
      .int()
      .optional()
      .describe('Number of visible lines for LongTextArea fields in the UI. Typically 3-10.'),
    checkExisting: z
      .boolean()
      .optional()
      .describe(
        'If true, checks if the field already exists before attempting creation. Prevents errors when field is already present.',
      ),
    fieldApiName: z
      .string()
      .describe(
        "The API name for the new custom field. Must end with '__c' for custom fields (e.g., 'Customer_Tier__c', 'Priority_Level__c').",
      ),
    objectApiName: z
      .string()
      .describe(
        "The API name of the Salesforce object to add the field to (e.g., 'Account', 'Contact', 'Opportunity', or a custom object like 'Invoice__c').",
      ),
    picklistValues: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'List of picklist values for Picklist or MultiselectPicklist fields. Each value must have at minimum a fullName.',
      ),
    inlineHelpText: z
      .string()
      .optional()
      .describe('Optional help text shown as a tooltip when users hover over the field in the UI.'),
    relationshipName: z
      .string()
      .optional()
      .describe(
        'For Lookup fields, the API name for the relationship (used in queries). If not specified, Salesforce auto-generates one.',
      ),
    visibleLinesPicklist: z
      .number()
      .int()
      .optional()
      .describe('For MultiselectPicklist fields, number of visible lines to display in the UI.'),
  }),
  execute: async ({
    salesforceCredentials,
    label,
    scale,
    length,
    unique,
    required,
    precision,
    fieldType,
    restricted,
    description,
    externalId,
    referenceTo,
    defaultValue,
    visibleLines,
    checkExisting,
    fieldApiName,
    objectApiName,
    picklistValues,
    inlineHelpText,
    relationshipName,
    visibleLinesPicklist,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (!sfObj || !sfFld) return { error: 'objectApiName and fieldApiName are required.' };
    const {
      objectApiName: sfObj,
      fieldApiName: sfFld,
      checkExisting: sfCheck,
      ...meta
    } = {
      label: label,
      scale: scale,
      length: length,
      unique: unique,
      required: required,
      precision: precision,
      field_type: fieldType,
      restricted: restricted,
      description: description,
      external_id: externalId,
      reference_to: referenceTo,
      default_value: defaultValue,
      visible_lines: visibleLines,
      check_existing: checkExisting,
      field_api_name: fieldApiName,
      object_api_name: objectApiName,
      picklist_values: picklistValues,
      inline_help_text: inlineHelpText,
      relationship_name: relationshipName,
      visible_lines_picklist: visibleLinesPicklist,
    };
    if (sfCheck !== false) {
      const existing = await sfGet(
        salesforceCredentials,
        `/tooling/sobjects/CustomField/${sfObj}.${sfFld}/describe`,
      );
      if (existing && !existing.error)
        return { success: true, fullName: `${sfObj}.${sfFld}`, alreadyExists: true };
    }
    const metadata = Object.fromEntries(
      Object.entries(meta).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    const created = await sfPost(salesforceCredentials, '/tooling/sobjects/CustomField', {
      body: { FullName: `${sfObj}.${sfFld}`, Metadata: metadata },
    });
    if (created && created.error) return created;
    return { success: true, fullName: `${sfObj}.${sfFld}`, id: created && created.id };
  },
});

export const salesforceCreateCustomObject = tool({
  description:
    'Tool to create a custom object in Salesforce using the Metadata API. Use when you need to dynamically create new object types (tables) in Salesforce with custom fields and configurations.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    label: z
      .string()
      .describe(
        'The display label for the custom object shown in the Salesforce UI (singular form).',
      ),
    fullName: z
      .string()
      .describe(
        "The API name of the custom object. Must end with '__c' suffix (e.g., 'Invoice__c', 'Student__c'). This is the unique identifier for the object in Salesforce.",
      ),
    nameField: z
      .record(z.any())
      .describe(
        'Configuration for the name field of the custom object. Every custom object requires a name field.',
      ),
    description: z
      .string()
      .optional()
      .describe("Optional description of the custom object's purpose and usage."),
    pluralLabel: z
      .string()
      .describe(
        'The plural form of the label shown in the Salesforce UI when referring to multiple records.',
      ),
    sharingModel: z
      .enum(['ReadWrite', 'Read', 'Private', 'ControlledByParent'])
      .optional()
      .describe(
        "Defines default record-level sharing. 'ReadWrite' allows all users to read and edit, 'Read' allows read-only access, 'Private' restricts to owner only, 'ControlledByParent' inherits from parent object.",
      ),
    enableReports: z
      .boolean()
      .optional()
      .describe(
        "If true, enables reporting on this object. Allows users to create reports and dashboards with this object's data.",
      ),
    deploymentStatus: z
      .enum(['Deployed', 'InDevelopment'])
      .optional()
      .describe(
        "Deployment status of the custom object. 'Deployed' makes it available to all users, 'InDevelopment' restricts access to admins and developers only.",
      ),
    enableActivities: z
      .boolean()
      .optional()
      .describe(
        'If true, enables tasks and events for this object. Allows users to track activities related to records.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    label,
    fullName,
    nameField,
    description,
    pluralLabel,
    sharingModel,
    enableReports,
    deploymentStatus,
    enableActivities,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const {
      fullName: sfFull,
      label: sfLabel,
      pluralLabel: sfPlural,
      nameField: sfNameField,
      description: sfDesc,
      sharingModel: sfSharing,
      deploymentStatus: sfDeploy,
      enableReports: sfReports,
      enableActivities: sfActivities,
    } = {
      label: label,
      full_name: fullName,
      name_field: nameField,
      description: description,
      plural_label: pluralLabel,
      sharing_model: sharingModel,
      enable_reports: enableReports,
      deployment_status: deploymentStatus,
      enable_activities: enableActivities,
    };
    if (!sfFull || !sfLabel || !sfPlural || !sfNameField)
      return { error: 'fullName, label, pluralLabel and nameField are required.' };
    const sfBody2 = {
      FullName: sfFull,
      Metadata: {
        label: sfLabel,
        pluralLabel: sfPlural,
        nameField: sfNameField,
        description: sfDesc,
        sharingModel: sfSharing || 'ReadWrite',
        deploymentStatus: sfDeploy || 'Deployed',
        enableReports: sfReports,
        enableActivities: sfActivities,
      },
    };
    const created = await sfPost(salesforceCredentials, '/tooling/sobjects/CustomObject', {
      body: sfBody2,
    });
    if (created && created.error) return created;
    return { success: true, fullName: sfFull, id: created && created.id };
  },
});
