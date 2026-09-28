// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfPost } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function asList(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function emailInput(args: {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
  isHtml?: boolean;
  senderType?: string;
  senderAddress?: string;
  orgWideId?: string;
  recipientId?: string;
  relatedId?: string;
  templateId?: string;
  attachmentIds?: string[];
  logEmail?: boolean;
  threading?: boolean;
}) {
  const input: Record<string, unknown> = {};
  if (args.to?.length) input.emailAddresses = args.to.join(',');
  if (args.cc?.length) input.ccAddresses = args.cc.join(',');
  if (args.bcc?.length) input.bccAddresses = args.bcc.join(',');
  if (args.subject) input.subject = args.subject;
  if (args.body) input.body = args.body;
  if (args.isHtml !== undefined) input.isHtmlBody = args.isHtml;
  if (args.senderType) input.senderType = args.senderType;
  if (args.orgWideId) input.orgWideEmailAddressId = args.orgWideId;
  else if (args.senderAddress) input.senderAddress = args.senderAddress;
  if (args.recipientId) input.recordId = args.recipientId;
  if (args.relatedId) input.relatedToId = args.relatedId;
  if (args.templateId) input.templateID = args.templateId;
  if (args.attachmentIds?.length) input.entityAttachments = args.attachmentIds;
  if (args.logEmail !== undefined) input.saveAsActivity = args.logEmail;
  if (args.threading !== undefined) input.addThreadingTokens = args.threading;
  return input;
}

const addressField = z
  .any()
  .optional()
  .describe('Email address(es): a single address, comma-separated string or array.');

export const salesforceSendEmail = tool({
  description:
    'Send an email through Salesforce to one or more recipients with CC/BCC, attachments and optional activity logging. Check per-recipient results; use mass email for large lists.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    to_addresses: z.any().describe('Recipient email address(es).'),
    subject: z.string().describe('Email subject.'),
    body: z.string().describe('Email body (plain text or HTML with is_html).'),
    cc_addresses: addressField,
    bcc_addresses: addressField,
    is_html: z.boolean().optional().describe('Body is HTML.'),
    sender_type: z.string().optional().describe('CurrentUser (default) or OrgWideEmailAddress.'),
    sender_address: z.string().optional().describe('Org-wide sender email address.'),
    org_wide_email_address_id: z.string().optional().describe('Org-wide sender Id.'),
    recipient_id: z
      .string()
      .optional()
      .describe('Lead/Contact/PersonAccount Id for logging and merge fields.'),
    related_record_id: z
      .string()
      .optional()
      .describe('Related record Id for logging and merge fields.'),
    attachment_ids: addressField,
    log_email: z.boolean().optional().describe('Log on the recipient activity timeline.'),
  }),
  execute: async (args) => {
    const { salesforceCredentials, to_addresses, ...rest } = args as Record<string, unknown>;
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials as string, '/actions/standard/emailSimple', {
      body: {
        inputs: [
          emailInput({
            to: asList(to_addresses),
            cc: asList(rest.cc_addresses),
            bcc: asList(rest.bcc_addresses),
            subject: rest.subject as string,
            body: rest.body as string,
            isHtml: rest.is_html as boolean | undefined,
            senderType: (rest.sender_type as string) || 'CurrentUser',
            senderAddress: rest.sender_address as string | undefined,
            orgWideId: rest.org_wide_email_address_id as string | undefined,
            recipientId: rest.recipient_id as string | undefined,
            relatedId: rest.related_record_id as string | undefined,
            attachmentIds: asList(rest.attachment_ids),
            logEmail: rest.log_email as boolean | undefined,
          }),
        ],
      },
    });
  },
});

export const salesforceSendEmailFromTemplate = tool({
  description:
    'Send an email using a Salesforce email template with merge-field support to a lead, contact or person account.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    template_id: z.string().describe('Email template Id.'),
    recipient_id: z
      .string()
      .describe('Lead, Contact or PersonAccount Id (required for merge fields).'),
    cc_addresses: addressField,
    bcc_addresses: addressField,
    additional_to_addresses: addressField,
    attachment_ids: addressField,
    sender_type: z
      .string()
      .optional()
      .describe('CurrentUser (default), DefaultWorkflowUser or OrgWideEmailAddress.'),
    sender_address: z.string().optional().describe('Org-wide sender email address.'),
    related_record_id: z
      .string()
      .optional()
      .describe('Related record Id for merge fields from another object.'),
    log_email: z.boolean().optional().describe('Log on the timeline (default true).'),
    add_threading_tokens: z
      .boolean()
      .optional()
      .describe('Add threading tokens (useful for cases).'),
  }),
  execute: async (args) => {
    const { salesforceCredentials, ...rest } = args as Record<string, unknown>;
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const to = [...(asList(rest.additional_to_addresses) ?? [])];
    return sfPost(salesforceCredentials as string, '/actions/standard/emailSimple', {
      body: {
        inputs: [
          emailInput({
            to: to.length ? to : undefined,
            cc: asList(rest.cc_addresses),
            bcc: asList(rest.bcc_addresses),
            senderType: (rest.sender_type as string) || 'CurrentUser',
            senderAddress: rest.sender_address as string | undefined,
            recipientId: rest.recipient_id as string,
            relatedId: rest.related_record_id as string | undefined,
            templateId: rest.template_id as string,
            attachmentIds: asList(rest.attachment_ids),
            logEmail: (rest.log_email as boolean | undefined) ?? true,
            threading: rest.add_threading_tokens as boolean | undefined,
          }),
        ],
      },
    });
  },
});

export const salesforceSendMassEmail = tool({
  description:
    'Send one individual email per recipient (up to 150 per call, processed in batches) using a template or custom subject/body. Consumes daily single-email limits; inspect each entry in results.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    recipient_ids: z
      .array(z.string())
      .min(1)
      .max(150)
      .describe('Lead/Contact/PersonAccount Ids (max 150).'),
    template_id: z.string().optional().describe('Email template Id (or provide subject and body).'),
    subject: z.string().optional().describe('Custom subject (required without template_id).'),
    body: z.string().optional().describe('Custom body (required without template_id).'),
    is_html: z.boolean().optional().describe('Custom body is HTML.'),
    sender_type: z
      .string()
      .optional()
      .describe('CurrentUser (default), DefaultWorkflowUser or OrgWideEmailAddress.'),
    sender_address: z.string().optional().describe('Org-wide sender email address.'),
    batch_size: z
      .number()
      .int()
      .min(1)
      .max(150)
      .optional()
      .describe('Recipients per batch (default 50).'),
    log_emails: z.boolean().optional().describe('Log on timelines (default true).'),
  }),
  execute: async ({
    salesforceCredentials,
    recipient_ids,
    template_id,
    subject,
    body,
    is_html,
    sender_type,
    sender_address,
    batch_size,
    log_emails,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (!template_id && (!subject || !body)) {
      return { error: 'Provide either template_id or both subject and body.' };
    }
    const size = Math.min(Math.max(batch_size || 50, 1), 150);
    const results: unknown[] = [];
    for (let i = 0; i < recipient_ids.length; i += size) {
      const batch = recipient_ids.slice(i, i + size);
      const res = await sfPost(salesforceCredentials, '/actions/standard/emailSimple', {
        body: {
          inputs: batch.map((id) =>
            emailInput({
              recipientId: id,
              templateId: template_id,
              subject,
              body,
              isHtml: is_html,
              senderType: sender_type || 'CurrentUser',
              senderAddress: sender_address,
              logEmail: log_emails ?? true,
            }),
          ),
        },
      });
      results.push(res);
      if (res && (res as { error?: string }).error) {
        return { error: 'Mass email batch failed', batchIndex: results.length - 1, results };
      }
    }
    return { success: true, batches: results.length, results };
  },
});
