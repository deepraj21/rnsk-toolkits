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

export const hubspotArchiveProduct = tool({
  description: 'Archives a HubSpot product by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    productId: z.string().describe('Unique HubSpot identifier for the product to be archived.'),
  }),
  execute: async ({ hubspotToken, productId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/products/${encodeURIComponent(String(productId))}`,
    );
  },
});

export const hubspotArchiveProducts = tool({
  description: 'Archives multiple HubSpot products by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of product objects to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/products/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateProduct = tool({
  description:
    "Creates a new HubSpot product. Note: Products are catalog items and cannot be directly associated with deals, contacts, or companies. To connect product information to a deal or quote, create a line item using HUBSPOT_CREATE_LINE_ITEM that references this product's ID via hs_product_id.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z.string().optional().describe('The official name of the product.'),
    price: z
      .number()
      .optional()
      .describe('The selling price of the product in the default currency of the HubSpot account.'),
    hsSku: z
      .string()
      .optional()
      .describe(
        'The Stock Keeping Unit (SKU) for the product. This should be unique across all products if used for inventory management.',
      ),
    hsUrl: z
      .string()
      .optional()
      .describe(
        "A direct URL link to the product's page on an e-commerce website or product information site.",
      ),
    quantity: z
      .number()
      .int()
      .optional()
      .describe(
        'The current quantity of the product available in inventory. This property might be relevant for physical goods.',
      ),
    hsActive: z
      .boolean()
      .optional()
      .describe(
        'Indicates if the product is currently active and available for sale. Set to `true` if active, `false` otherwise.',
      ),
    hsImages: z
      .string()
      .optional()
      .describe(
        'A comma-separated string of URLs for product images. The first URL is typically used as the primary image.',
      ),
    description: z
      .string()
      .optional()
      .describe('A detailed description of the product, its features, and benefits.'),
    hsArchived: z
      .boolean()
      .optional()
      .describe(
        'Indicates if the product has been archived. Archived products are typically hidden from active lists and sales processes. Set to `true` to archive.',
      ),
    hsFeatured: z
      .boolean()
      .optional()
      .describe(
        'Indicates if the product is marked as a featured item, which can be used to highlight it in product listings.',
      ),
    associations: z
      .array(
        z
          .object({ types: z.array(z.record(z.any())), to__id: z.string().optional() })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        "A list of associations to create between this new product and other CRM objects. IMPORTANT: Products CANNOT be directly associated with deals, contacts, or companies. To connect product information to a deal, create a line item using HUBSPOT_CREATE_LINE_ITEM with hs_product_id referencing this product's ID.",
      ),
    taxCategory: z
      .string()
      .optional()
      .describe(
        "The tax category or code applicable to the product, used for calculating sales tax (e.g., 'Taxable Goods', 'Non-Taxable').",
      ),
    hsProductId: z
      .string()
      .optional()
      .describe(
        'An external or secondary unique identifier for the product. Useful for mapping to external systems. HubSpot does not auto-generate this.',
      ),
    hsValidFrom: z
      .string()
      .optional()
      .describe(
        'The date (YYYY-MM-DD format) from which the product is considered valid or available for sale.',
      ),
    hsProductType: z
      .string()
      .optional()
      .describe(
        "The type of the product. Valid values: 'inventory' (physical goods tracked in inventory), 'non_inventory' (physical goods not tracked), 'service' (services or labor).",
      ),
    hsValidThrough: z
      .string()
      .optional()
      .describe(
        "The date (YYYY-MM-DD format) until which the product is considered valid or available. Leave empty if there's no expiration date.",
      ),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary of custom properties for the product. Keys must be internal names of custom properties that already exist in your HubSpot account. Create custom properties in HubSpot Settings > Objects > Products > Product properties before using them here. Example: `{"material": "Titanium", "warranty_years": "5"}`.',
      ),
    hsProductStatus: z
      .string()
      .optional()
      .describe(
        "The current sales or lifecycle status of the product (e.g., 'Available', 'Discontinued', 'Pre-order', 'Out of Stock').",
      ),
    hsProductCategory: z
      .string()
      .optional()
      .describe(
        "The primary category the product belongs to (e.g., 'Electronics', 'Apparel', 'Consulting Services').",
      ),
    hsCostOfGoodsSold: z
      .number()
      .optional()
      .describe(
        'The cost of goods sold (COGS) for the product. Used for profit margin calculations.',
      ),
    hsProductSubcategory: z
      .string()
      .optional()
      .describe(
        "A more specific subcategory for the product (e.g., 'Laptops' under 'Electronics').",
      ),
    hsRecurringBillingPeriod: z
      .string()
      .optional()
      .describe(
        'The billing frequency for recurring revenue products, formatted as a PnYnMnDTnHnMnS string (e.g., P1M for 1 month, P1Y for 1 year).',
      ),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/products`, {
      body: flatProps(input, {
        name: 'name',
        price: 'price',
        hsSku: 'hs_sku',
        hsUrl: 'hs_url',
        quantity: 'quantity',
        hsActive: 'hs_active',
        hsImages: 'hs_images',
        description: 'description',
        hsArchived: 'hs_archived',
        hsFeatured: 'hs_featured',
        taxCategory: 'tax_category',
        hsProductId: 'hs_product_id',
        hsValidFrom: 'hs_valid_from',
        hsProductType: 'hs_product_type',
        hsValidThrough: 'hs_valid_through',
        hsProductStatus: 'hs_product_status',
        hsProductCategory: 'hs_product_category',
        hsCostOfGoodsSold: 'hs_cost_of_goods_sold',
        hsProductSubcategory: 'hs_product_subcategory',
        hsRecurringBillingPeriod: 'hs_recurring_billing_period',
      }),
    });
  },
});

export const hubspotCreateProducts = tool({
  description: 'Creates multiple HubSpot products in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ properties: z.record(z.any()) }).catchall(z.any()))
      .describe('List of product objects to create.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/products/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotGetProduct = tool({
  description: 'Retrieves a HubSpot product by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z.boolean().optional().describe('Filter by archived status.'),
    productId: z.string().describe('Unique HubSpot identifier for the product to retrieve.'),
    properties: z
      .array(z.string())
      .optional()
      .describe('Product property names to include in the response.'),
    associations: z
      .array(z.string())
      .optional()
      .describe('Object types for which to retrieve associated IDs.'),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe('Property names for which to include historical values.'),
  }),
  execute: async ({
    hubspotToken,
    archived,
    productId,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/objects/products/${encodeURIComponent(String(productId))}`,
      {
        query: pickDefined({
          archived: archived,
          properties: properties,
          associations: associations,
          propertiesWithHistory: propertiesWithHistory,
        }),
      },
    );
  },
});

export const hubspotGetProducts = tool({
  description: 'Retrieves multiple HubSpot products by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of product identifiers to retrieve.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Whether to include archived products in the results. Set to true to retrieve only archived products, false (default) to retrieve only active products.',
      ),
    idProperty: z.string().optional().describe('Alternate unique identifier property to use.'),
    properties: z
      .array(z.string())
      .describe(
        'Product property names to include in the response. Common properties include: name, price, description, hs_sku, hs_cost_of_goods_sold, hs_bundle_type, hs_pricing_model, hs_recurring_billing_period, hs_product_classification.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Product property names for which to retrieve historical values. Pass an empty array if historical data is not needed.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/products/batch/read`, {
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

export const hubspotListProducts = tool({
  description: 'Retrieves a paginated list of HubSpot products.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Pagination token from previous response. Must be a valid token or omitted entirely.',
      ),
    limit: z.number().int().optional().describe('Maximum number of products to return per page.'),
    archived: z.boolean().optional().describe('Filter by archived status.'),
    properties: z
      .array(z.string())
      .optional()
      .describe('List of product property names to include in the response.'),
    associations: z
      .array(z.string())
      .optional()
      .describe('List of object types for which to retrieve associated IDs.'),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe('List of property names for which to retrieve historical values.'),
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
    return hubGet(hubspotToken, `/crm/v3/objects/products`, {
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

export const hubspotMergeProducts = tool({
  description: 'Merges two HubSpot products into one.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe('The ID of the product that will be merged into the primary product.'),
    primaryObjectId: z.string().describe('The ID of the product that will remain after the merge.'),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/products/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotSearchProducts = tool({
  description: 'Searches for HubSpot products using flexible criteria and filters.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'The cursor for pagination. To get the next page of results, use the `after` value from the `paging.next.after` property of a previous response.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of products to return in the search results.'),
    query: z
      .string()
      .optional()
      .describe(
        'A string to search across all default text properties of products. Finds records where any of these properties contain the specified string.',
      ),
    sorts: z
      .array(
        z
          .object({ direction: z.enum(['ASCENDING', 'DESCENDING']), propertyName: z.string() })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        "A list of sort objects to define the order of search results. Each object specifies a `propertyName` and a `direction`. For example, `[{'propertyName': 'name', 'direction': 'ASCENDING'}]` sorts products by name alphabetically.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of product properties to include in the response. Supports both standard properties and custom properties. If not provided, a default set of properties will be returned.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())).optional() }).catchall(z.any()))
      .optional()
      .describe('Groups of filters to apply to the ticket search.'),
    customProperties: z
      .array(z.string())
      .optional()
      .describe(
        "A list of internal names of custom product properties to include in the response. It's important to use the property's internal API name. For example `['custom_field_api_name_1', 'custom_field_api_name_2']`.",
      ),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    query,
    sorts,
    properties,
    filterGroups,
    customProperties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/products/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after, customProperties }),
    });
  },
});

export const hubspotUpdateProduct = tool({
  description: 'Updates properties for an existing HubSpot product.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    productId: z.string().describe('Unique HubSpot identifier for the product to be updated.'),
    properties: z
      .record(z.any())
      .describe('Product properties to update. Keys are internal HubSpot property names.'),
  }),
  execute: async ({ hubspotToken, productId, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/products/${encodeURIComponent(String(productId))}`,
      {
        body: { properties: properties ?? {} },
      },
    );
  },
});

export const hubspotUpdateProducts = tool({
  description: 'Updates multiple HubSpot products in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z.object({ id: z.string(), properties: z.record(z.any()).optional() }).catchall(z.any()),
      )
      .describe('List of product update operations.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/products/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});
