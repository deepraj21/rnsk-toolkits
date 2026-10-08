// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sapRequest, failedResult, toSapError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

const BP_BASE = '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner';
const SO_BASE = '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder';
const PRODUCT_BASE = '/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product';

export const sapListBusinessPartners = tool({
  description: 'List business partners from API_BUSINESS_PARTNER with optional OData filter.',
  inputSchema: z.object({
    sapCredentials: credField,
    filter: z.string().optional(),
    top: z.number().int().optional(),
    skip: z.number().int().optional(),
  }),
  execute: async ({ sapCredentials, filter, top, skip }) => {
    try {
      const result = await sapRequest(sapCredentials, BP_BASE, {
        query: { $filter: filter, $top: top, $skip: skip },
      });
      if (!result.ok) return failedResult('Failed to list business partners', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error listing business partners');
    }
  },
});

export const sapGetBusinessPartner = tool({
  description: 'Get one business partner by BusinessPartner ID.',
  inputSchema: z.object({
    sapCredentials: credField,
    businessPartner: z.string().describe('Business partner number'),
  }),
  execute: async ({ sapCredentials, businessPartner }) => {
    try {
      const key = encodeURIComponent(`'${businessPartner}'`);
      const result = await sapRequest(sapCredentials, `${BP_BASE}(${key})`);
      if (!result.ok) return failedResult('Failed to get business partner', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error getting business partner');
    }
  },
});

export const sapListSalesOrders = tool({
  description: 'List sales orders from API_SALES_ORDER_SRV with optional OData filter.',
  inputSchema: z.object({
    sapCredentials: credField,
    filter: z.string().optional(),
    top: z.number().int().optional(),
    skip: z.number().int().optional(),
    expand: z.string().optional().describe('e.g. to_Item'),
  }),
  execute: async ({ sapCredentials, filter, top, skip, expand }) => {
    try {
      const result = await sapRequest(sapCredentials, SO_BASE, {
        query: { $filter: filter, $top: top, $skip: skip, $expand: expand },
      });
      if (!result.ok) return failedResult('Failed to list sales orders', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error listing sales orders');
    }
  },
});

export const sapGetSalesOrder = tool({
  description: 'Get one sales order by SalesOrder number.',
  inputSchema: z.object({
    sapCredentials: credField,
    salesOrder: z.string().describe('Sales order ID'),
    expand: z.string().optional(),
  }),
  execute: async ({ sapCredentials, salesOrder, expand }) => {
    try {
      const key = encodeURIComponent(`'${salesOrder}'`);
      const result = await sapRequest(sapCredentials, `${SO_BASE}(${key})`, {
        query: expand ? { $expand: expand } : undefined,
      });
      if (!result.ok) return failedResult('Failed to get sales order', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error getting sales order');
    }
  },
});

export const sapListProducts = tool({
  description: 'List products from API_PRODUCT_SRV with optional OData filter.',
  inputSchema: z.object({
    sapCredentials: credField,
    filter: z.string().optional(),
    top: z.number().int().optional(),
    skip: z.number().int().optional(),
  }),
  execute: async ({ sapCredentials, filter, top, skip }) => {
    try {
      const result = await sapRequest(sapCredentials, PRODUCT_BASE, {
        query: { $filter: filter, $top: top, $skip: skip },
      });
      if (!result.ok) return failedResult('Failed to list products', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error listing products');
    }
  },
});

export const sapGetProduct = tool({
  description: 'Get one product by Product ID.',
  inputSchema: z.object({
    sapCredentials: credField,
    product: z.string().describe('Product number'),
  }),
  execute: async ({ sapCredentials, product }) => {
    try {
      const key = encodeURIComponent(`'${product}'`);
      const result = await sapRequest(sapCredentials, `${PRODUCT_BASE}(${key})`);
      if (!result.ok) return failedResult('Failed to get product', result);
      return result.data;
    } catch (error) {
      return toSapError(error, 'Error getting product');
    }
  },
});
