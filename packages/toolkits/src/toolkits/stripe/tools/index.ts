// @ts-nocheck
import {
  stripeCreateCustomer,
  stripeGetCustomer,
  stripeListCustomers,
  stripeUpdateCustomer,
} from './customers.js';
import {
  stripeCreatePaymentIntent,
  stripeGetPaymentIntent,
  stripeCancelPaymentIntent,
} from './payment-intents.js';
import { stripeCreateCheckoutSession, stripeGetCheckoutSession } from './checkout.js';
import { stripeGetCharge, stripeListCharges } from './charges.js';
import { stripeCreateRefund } from './refunds.js';
import { stripeCreateInvoice, stripeGetInvoice, stripeFinalizeInvoice } from './invoices.js';
import {
  stripeListSubscriptions,
  stripeGetSubscription,
  stripeCancelSubscription,
} from './subscriptions.js';

export {
  stripeCreateCustomer,
  stripeGetCustomer,
  stripeListCustomers,
  stripeUpdateCustomer,
  stripeCreatePaymentIntent,
  stripeGetPaymentIntent,
  stripeCancelPaymentIntent,
  stripeCreateCheckoutSession,
  stripeGetCheckoutSession,
  stripeGetCharge,
  stripeListCharges,
  stripeCreateRefund,
  stripeCreateInvoice,
  stripeGetInvoice,
  stripeFinalizeInvoice,
  stripeListSubscriptions,
  stripeGetSubscription,
  stripeCancelSubscription,
};

const auth = 'stripeCredentials' as const;
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

export const stripeTools = [
  entry('stripeCreateCustomer', stripeCreateCustomer, 'write', ['buyer']),
  entry('stripeGetCustomer', stripeGetCustomer, 'read', ['buyer']),
  entry('stripeListCustomers', stripeListCustomers, 'read', ['buyers']),
  entry('stripeUpdateCustomer', stripeUpdateCustomer, 'write', ['buyer']),
  entry('stripeCreatePaymentIntent', stripeCreatePaymentIntent, 'write', ['payment', 'checkout']),
  entry('stripeGetPaymentIntent', stripeGetPaymentIntent, 'read', ['payment']),
  entry('stripeCancelPaymentIntent', stripeCancelPaymentIntent, 'write', ['void']),
  entry('stripeCreateCheckoutSession', stripeCreateCheckoutSession, 'write', [
    'checkout',
    'hosted',
  ]),
  entry('stripeGetCheckoutSession', stripeGetCheckoutSession, 'read', ['checkout']),
  entry('stripeGetCharge', stripeGetCharge, 'read', ['transaction']),
  entry('stripeListCharges', stripeListCharges, 'read', ['transactions']),
  entry('stripeCreateRefund', stripeCreateRefund, 'write', ['reimburse']),
  entry('stripeCreateInvoice', stripeCreateInvoice, 'write', ['billing']),
  entry('stripeGetInvoice', stripeGetInvoice, 'read', ['billing']),
  entry('stripeFinalizeInvoice', stripeFinalizeInvoice, 'write', ['billing']),
  entry('stripeListSubscriptions', stripeListSubscriptions, 'read', ['recurring']),
  entry('stripeGetSubscription', stripeGetSubscription, 'read', ['recurring']),
  entry('stripeCancelSubscription', stripeCancelSubscription, 'delete', ['recurring', 'churn']),
];
