// @ts-nocheck
import {
  paypalCreateOrder,
  paypalGetOrder,
  paypalPatchOrder,
  paypalCaptureOrder,
  paypalAuthorizeOrder,
} from './orders.js';
import { paypalGetCapture, paypalRefundCapture, paypalGetRefund } from './payments.js';
import { paypalCreatePayout, paypalGetPayoutBatch, paypalGetPayoutItem } from './payouts.js';
import {
  paypalCreateInvoice,
  paypalGetInvoice,
  paypalListInvoices,
  paypalSendInvoice,
} from './invoices.js';
import { paypalListTransactions } from './reporting.js';

export {
  paypalCreateOrder,
  paypalGetOrder,
  paypalPatchOrder,
  paypalCaptureOrder,
  paypalAuthorizeOrder,
  paypalGetCapture,
  paypalRefundCapture,
  paypalGetRefund,
  paypalCreatePayout,
  paypalGetPayoutBatch,
  paypalGetPayoutItem,
  paypalCreateInvoice,
  paypalGetInvoice,
  paypalListInvoices,
  paypalSendInvoice,
  paypalListTransactions,
};

const auth = 'paypalCredentials' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[]) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const paypalTools = [
  entry('paypalCreateOrder', paypalCreateOrder, 'write', ['checkout', 'payment']),
  entry('paypalGetOrder', paypalGetOrder, 'read', ['checkout']),
  entry('paypalPatchOrder', paypalPatchOrder, 'write', ['checkout']),
  entry('paypalCaptureOrder', paypalCaptureOrder, 'write', ['payment', 'capture']),
  entry('paypalAuthorizeOrder', paypalAuthorizeOrder, 'write', ['authorize']),
  entry('paypalGetCapture', paypalGetCapture, 'read', ['payment']),
  entry('paypalRefundCapture', paypalRefundCapture, 'write', ['refund']),
  entry('paypalGetRefund', paypalGetRefund, 'read', ['refund']),
  entry('paypalCreatePayout', paypalCreatePayout, 'write', ['disbursement']),
  entry('paypalGetPayoutBatch', paypalGetPayoutBatch, 'read', ['disbursement']),
  entry('paypalGetPayoutItem', paypalGetPayoutItem, 'read', ['disbursement']),
  entry('paypalCreateInvoice', paypalCreateInvoice, 'write', ['billing']),
  entry('paypalGetInvoice', paypalGetInvoice, 'read', ['billing']),
  entry('paypalListInvoices', paypalListInvoices, 'read', ['billing']),
  entry('paypalSendInvoice', paypalSendInvoice, 'write', ['billing', 'email']),
  entry('paypalListTransactions', paypalListTransactions, 'read', ['reporting', 'ledger']),
];
