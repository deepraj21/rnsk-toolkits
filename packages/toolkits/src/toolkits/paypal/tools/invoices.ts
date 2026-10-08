// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paypalRequest, failedResult, toPayPalError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const paypalCreateInvoice = tool({
  description: 'Create a draft invoice (POST /v2/invoicing/invoices). Pass full invoice body.',
  inputSchema: z.object({
    paypalCredentials: credField,
    invoice: z
      .record(z.any())
      .describe('Invoice JSON (detail, invoicer, primary_recipients, items, etc.)'),
  }),
  execute: async ({ paypalCredentials, invoice }) => {
    try {
      const result = await paypalRequest(paypalCredentials, '/v2/invoicing/invoices', {
        method: 'POST',
        body: invoice,
        preferRepresentation: true,
      });
      if (!result.ok) return failedResult('Failed to create invoice', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error creating invoice');
    }
  },
});

export const paypalGetInvoice = tool({
  description: 'Get invoice details (GET /v2/invoicing/invoices/{invoiceId}).',
  inputSchema: z.object({
    paypalCredentials: credField,
    invoiceId: z.string(),
  }),
  execute: async ({ paypalCredentials, invoiceId }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`,
      );
      if (!result.ok) return failedResult('Failed to get invoice', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error getting invoice');
    }
  },
});

export const paypalListInvoices = tool({
  description: 'List invoices with optional page filters (GET /v2/invoicing/invoices).',
  inputSchema: z.object({
    paypalCredentials: credField,
    page: z.number().int().optional(),
    pageSize: z.number().int().optional(),
    totalRequired: z.boolean().optional(),
  }),
  execute: async ({ paypalCredentials, page, pageSize, totalRequired }) => {
    try {
      const result = await paypalRequest(paypalCredentials, '/v2/invoicing/invoices', {
        query: {
          page,
          page_size: pageSize,
          total_required: totalRequired,
        },
      });
      if (!result.ok) return failedResult('Failed to list invoices', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error listing invoices');
    }
  },
});

export const paypalSendInvoice = tool({
  description:
    'Send an invoice to recipients (POST /v2/invoicing/invoices/{invoiceId}/send). Optional subject and note.',
  inputSchema: z.object({
    paypalCredentials: credField,
    invoiceId: z.string(),
    subject: z.string().optional(),
    note: z.string().optional(),
    sendToInvoicer: z.boolean().optional(),
    additionalRecipients: z.array(z.string()).optional(),
  }),
  execute: async ({
    paypalCredentials,
    invoiceId,
    subject,
    note,
    sendToInvoicer,
    additionalRecipients,
  }) => {
    try {
      const body: Record<string, unknown> = {};
      if (subject) body.subject = subject;
      if (note) body.note = note;
      if (sendToInvoicer !== undefined) body.send_to_invoicer = sendToInvoicer;
      if (additionalRecipients) body.additional_recipients = additionalRecipients;

      const result = await paypalRequest(
        paypalCredentials,
        `/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}/send`,
        {
          method: 'POST',
          body: Object.keys(body).length ? body : undefined,
        },
      );
      if (!result.ok) return failedResult('Failed to send invoice', result);
      return result.data ?? { status: result.status, sent: true };
    } catch (error) {
      return toPayPalError(error, 'Error sending invoice');
    }
  },
});
