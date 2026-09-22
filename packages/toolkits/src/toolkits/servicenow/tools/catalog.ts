// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { snRequest, toServerKeys } from './client.js';

export const serviceNowCreateServicCatalogItemsAddToCart = tool({
    description: "Adds a specified catalog item to the current user's ServiceNow shopping cart. Use when a user wants to order or request a specific item from the Service Catalog, such as requesting a laptop, software license, or IT service. The item is added to the user's active shopping cart and can be reviewed or submitted in a later step. Note: The action operates on the authenticated user's cart. If the catalog item requires mandatory variables, they must be provided in the `variables` field, otherwise the request may fail.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the catalog item to add to the cart. This is a 32-character hexadecimal string that identifies the specific catalog item in ServiceNow. Example: '039c516237b1300054b6a3549dbe5dfc'. This is a required path parameter."),
        variables: z.record(z.any()).optional().describe("Key-value pairs of catalog item variables to set when adding to cart. The variable names and expected values depend on the specific catalog item's variable definitions. For example, if the item has a 'model' variable, you might pass {'model': 'Laptop Model X'}. Omit this field if the catalog item does not require any variables."),
        sysparmQuantity: z.number().optional().describe("The number of units of the catalog item to add to the shopping cart. Defaults to 1 if not specified. Must be a positive integer."),
    }),
    execute: async ({ servicenowCredentials, sysId, variables, sysparmQuantity }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(sysId)}/add_to_cart`, {
            method: 'POST',
            body: toServerKeys({ variables, sysparmQuantity }),
        });
    },
});

export const serviceNowCreateServicCatalogItemsSubmitProducer = tool({
    description: "Submits a ServiceNow Service Catalog item using the submit_producer endpoint. This action submits a catalog item with the provided variables and returns the created record details. The submit_producer endpoint is typically used for producer-type catalog items (like change producers) that create records in other tables. Use this action when you need to submit a Service Catalog item that uses a producer script to create records. This is commonly used for change requests, service requests, or other workflow-triggering catalog items. The action returns the created record's details including the sys_id, table name, and record number. This permanently creates a record in the ServiceNow instance.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the catalog item to submit. This is a 32-character hexadecimal string that identifies the service catalog item. Example: '011f117a9f3002002920bde8132e7020'. You can find the sys_id by listing catalog items or navigating to the item in ServiceNow."),
        variables: z.record(z.any()).optional().describe("A dictionary of catalog item variable name-value pairs to provide during submission. These are the variables defined on the catalog item that the user fills out when submitting. The variable names must match exactly as defined in the catalog item. Example: {'short_description': 'New laptop request', 'urgency': 'high', 'std_change_producer': '508e02ec47410200e90d87e8dee49058'}"),
        sysparmDisplayValue: z.string().optional().describe("Determines the type of data returned in the response. 'true': Returns display values (names for references, text labels for choices). 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'all': Returns both display and actual values. If not specified, defaults to the instance setting."),
        sysparmNoValidation: z.boolean().optional().describe("Set to true to skip variable validation during submission. When false (default), ServiceNow validates all required variables before accepting the submission."),
    }),
    execute: async ({ servicenowCredentials, sysId, variables, sysparmDisplayValue, sysparmNoValidation }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(sysId)}/submit_producer`, {
            method: 'POST',
            query: { sysparm_display_value: sysparmDisplayValue },
            body: toServerKeys({ variables, sysparmNoValidation }),
        });
    },
});

export const serviceNowCreateServiceCatalogCartCheckout = tool({
    description: "Checks out the Service Catalog shopping cart and submits the order as a request. This action retrieves the items in the cart, creates a service catalog request, deletes the cart contents, and returns the request ID and number for tracking. The cart is emptied after successful checkout. This action is irreversible once the checkout is completed — the order has been submitted and cannot be cancelled through this action. Use this action when you need to finalize a Service Catalog order by submitting all items in the shopping cart for processing and approval.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        cartId: z.string().optional().describe("The unique system ID (sys_id) of the Service Catalog shopping cart to checkout. This is a 32-character hexadecimal string that uniquely identifies the cart record. Example: 'cart_sys_id'. If not provided, the current user's default cart will be used."),
    }),
    execute: async ({ servicenowCredentials, cartId }) => {
        return snRequest(servicenowCredentials, '/api/sn_sc/servicecatalog/cart/checkout', {
            method: 'POST',
            body: toServerKeys({ cartId }),
        });
    },
});

export const serviceNowCreateServiceCatalogCartSubmitOrder = tool({
    description: "Submits the Service Catalog shopping cart and creates a service catalog request. This action checks out the user cart, creates a service catalog request with all items in the cart, and returns the request ID and number for tracking. The cart contents are converted into a submitted order. This action is irreversible once submitted — the order has been created and cannot be cancelled through this action. Use this action when you need to finalize a Service Catalog order by submitting all items in the shopping cart for processing and approval. This is typically called after items have been added to the cart using other cart operations.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        cartId: z.string().optional().describe("The unique system ID (sys_id) of the Service Catalog shopping cart to submit. This is a 32-character hexadecimal string that uniquely identifies the cart record. Example: 'cart_sys_id'. If not provided, the current user's active cart will be used."),
        quantity: z.number().optional().describe("The quantity of items to order. If specified, applies to all items in the cart. Defaults to 1 if not specified."),
        variables: z.record(z.any()).optional().describe("Dictionary of catalog item variables (answers) to set during submission. The keys should be the variable IDs (not the labels) as defined in the catalog item. Example: {'reason': 'New laptop needed', 'location': 'NYC'}"),
        ignorePrice: z.boolean().optional().describe("Set to true to ignore price changes that may have occurred since items were added to cart. When false (default), the order may fail if prices have changed."),
        requestedFor: z.string().optional().describe("The user ID (sys_id or username) to submit the order on behalf of. Use this parameter when submitting an order for another user. Example: 'requested_for_sys_id' or 'john.doe'"),
        noAttachmentFoundWarnings: z.boolean().optional().describe("Set to true to suppress warnings when required attachments are missing. The order will still be submitted even if warnings would normally be generated."),
    }),
    execute: async ({ servicenowCredentials, cartId, quantity, variables, ignorePrice, requestedFor, noAttachmentFoundWarnings }) => {
        return snRequest(servicenowCredentials, '/api/sn_sc/servicecatalog/cart/submit_order', {
            method: 'POST',
            body: toServerKeys({ cartId, quantity, variables, ignorePrice, requestedFor, noAttachmentFoundWarnings }),
        });
    },
});

export const serviceNowCreateServicecatalogItemsCheckoutGuide = tool({
    description: "Checks out an order guide by updating variable values for selected catalog items. Use this action when a user needs to submit an order guide in ServiceNow's Service Catalog, providing variable values for the items within the order guide. The action retrieves the configured contents of the order guide with the submitted variable values applied. This is commonly used during the checkout process for order guides that contain pre-configured sets of catalog items (e.g., laptop requests, software bundles). The action sends a POST request with the order guide sys_id and variable values, and returns an array of catalog items included in the order guide checkout.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the order guide to check out. This is a 32-character hexadecimal string that uniquely identifies the order guide item. Example: '25110912372211003e7d40ed9dbe5dd6'. The order guide must be active and available in the Service Catalog."),
        variables: z.record(z.any()).optional().describe("Variable values for all selected catalog items within the order guide. Keys are the variable names/IDs and values are the corresponding values to set. The required variables depend on the specific order guide configuration. Common variable types include text inputs, checkboxes, dropdowns, and reference fields. All values should be provided as strings. Example: {'requested_for': '2024-01-15', 'quantity': '1', 'urgency': 'high'}"),
    }),
    execute: async ({ servicenowCredentials, sysId, variables }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(sysId)}/checkout_guide`, {
            method: 'POST',
            body: { items: [{ sys_id: sysId, variables }] },
        });
    },
});

export const serviceNowCreateServicecatalogItemsOrderNow = tool({
    description: "Orders a specified ServiceNow Service Catalog item immediately. This action submits an order for a catalog item without requiring cart checkout. The item is ordered directly with the specified quantity and optional variables. Use this action when you need to quickly order a known catalog item for a user. Use when you have a catalog item's sys_id and want to order it directly without adding it to a cart first. This action is useful for automated provisioning of standard items like laptop requests, software access, or access cards.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the catalog item to order. This is a 32-character hexadecimal string that identifies the service catalog item. Example: '04b7e94b4f7b4200086eeed18110c7fd'. You can find the sys_id by listing catalog items or navigating to the item in ServiceNow."),
        variables: z.record(z.any()).optional().describe("A dictionary of catalog item variable name-value pairs to provide during ordering. These are the variables defined on the catalog item that the user fills out at order time. The variable names must match exactly as defined in the catalog item. Example: {'reason': 'New laptop needed', 'urgency': 'high'}"),
        sysparmQuantity: z.number().optional().describe("The number of instances of the catalog item to order. Must be a positive integer. Defaults to 1 if not specified."),
        sysparmRequestedFor: z.string().optional().describe("The user ID (sys_id) of the person for whom the item is being ordered. If not specified, the item is ordered for the current user. Example: '681ccaf9c0a8016400b98a06818d57a7' (sys_id of a user)."),
    }),
    execute: async ({ servicenowCredentials, sysId, variables, sysparmQuantity, sysparmRequestedFor }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(sysId)}/order_now`, {
            method: 'POST',
            body: toServerKeys({ variables, sysparmQuantity, sysparmRequestedFor }),
        });
    },
});

export const serviceNowDeleteServicecatalogCart = tool({
    description: "Removes a specific item from the current ServiceNow Service Portal shopping cart. This action permanently removes a cart item from the active shopping cart session. Use this action when a user wants to remove an unwanted item from their Service Catalog cart before submitting the order. This action is irreversible — once the item is removed, it must be added again if still needed. Use when you need to remove an item from a user's Service Portal shopping cart and have the cart item's sys_id.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        cartItemId: z.string().describe("The unique system ID (sys_id) of the cart item to remove from the current shopping cart. This is a 32-character hexadecimal string that uniquely identifies the cart item. Example: 'b2754c3283fbf210dd2dc2dfeeaad33b'. The cart item must exist in the current user's cart, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, cartItemId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/cart/${encodeURIComponent(cartItemId)}`, {
            method: 'DELETE',
        });
    },
});

export const serviceNowDeleteServiceCatalogCartEmpty = tool({
    description: "Empties all items from a specified Service Catalog shopping cart using its sys_id. This action removes all items from the cart but does not delete the cart itself. This is a destructive, irreversible operation — all cart items will be permanently removed and cannot be recovered once emptied. Use this action with caution. Use when you need to clear all items from a user's Service Catalog shopping cart before adding new items or before discarding an unwanted order.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the Service Catalog shopping cart to empty. This is a 32-character hexadecimal string that uniquely identifies the cart record. Example: '8df4cc7a83bbf210dd2dc2dfeeaad380'. All items within the cart will be permanently removed, but the cart itself will remain. The cart must exist, or a 404 error will be returned."),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/cart/${encodeURIComponent(sysId)}/empty`, {
            method: 'DELETE',
        });
    },
});

export const serviceNowGetCmpCatalogApiServices = tool({
    description: "Retrieves a list of catalog items from the ServiceNow Cloud Services Catalog API. Use this action when you need to query and fetch catalog service items (from the sc_cat_item table) through the Cloud Services Catalog API. Supports filtering via encoded queries, field selection, pagination, and display value options. This is useful for browsing available catalog offerings, checking item availability, or searching for specific services in the ServiceNow Service Catalog.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmView: z.enum(['desktop', 'mobile', 'both']).optional().describe("UI view for which to render the data (desktop, mobile, or both)."),
        sysparmLimit: z.number().optional().describe("Maximum number of catalog service items to return in the response. Use pagination parameters (sysparm_offset) for retrieving larger result sets. Note: Unusually large values can impact system performance."),
        sysparmQuery: z.string().optional().describe("Encoded query string to filter catalog items. Syntax: <col_name><operator><value>. Operators: = (equals), != (not equals), ^ (AND), ^OR (OR), LIKE, STARTSWITH, ENDSWITH. Example: active=true^price>0 Example: retired=false^availability=available"),
        sysparmFields: z.string().optional().describe("Comma-separated list of fields to return in the response. Invalid field names are silently ignored. Example: 'sys_id,name,short_description,price'"),
        sysparmOffset: z.number().optional().describe("Starting record index for which to begin retrieving catalog items. Use this value to paginate through results. For example, set sysparm_offset=0 for the first page, then sysparm_offset=sysparm_limit for the next page."),
        sysparmNoCount: z.boolean().optional().describe("Flag that indicates whether to execute a select count(*) query to return the number of rows."),
        sysparmDisplayValue: z.enum(['true', 'false', 'all']).optional().describe("Determines the type of data returned, either the actual values from the database or the display values of the fields. Display values are manipulated based on the actual value in the database and user or system settings and preferences. 'false': Returns actual database values (sys_ids for references, numeric values for choices). 'true': Returns display values (names for references, text labels for choices). 'all': Returns both display and actual values."),
        sysparmQueryCategory: z.string().optional().describe("Name of the category to use when querying. Restricts results to items belonging to the specified category."),
        sysparmExcludeReferenceLink: z.boolean().optional().describe("Flag that indicates whether to exclude Table API links for reference fields."),
        sysparmSuppressPaginationHeader: z.boolean().optional().describe("Flag that indicates whether to remove the Link header from the response. The Link header provides URLs to relative pages in the record set for pagination. Set to 'true' to remove the Link header, 'false' to include it."),
    }),
    execute: async ({ servicenowCredentials, sysparmView, sysparmLimit, sysparmQuery, sysparmFields, sysparmOffset, sysparmNoCount, sysparmDisplayValue, sysparmQueryCategory, sysparmExcludeReferenceLink, sysparmSuppressPaginationHeader }) => {
        return snRequest(servicenowCredentials, '/api/now/cmp_catalog_api/services', {
            method: 'GET',
            query: {
                sysparm_view: sysparmView,
                sysparm_limit: sysparmLimit,
                sysparm_query: sysparmQuery,
                sysparm_fields: sysparmFields,
                sysparm_offset: sysparmOffset,
                sysparm_no_count: sysparmNoCount,
                sysparm_display_value: sysparmDisplayValue,
                sysparm_query_category: sysparmQueryCategory,
                sysparm_exclude_reference_link: sysparmExcludeReferenceLink,
                sysparm_suppress_pagination_header: sysparmSuppressPaginationHeader,
            },
        });
    },
});

export const serviceNowGetServicatalogItemsById = tool({
    description: "Retrieves a specific Service Catalog item from ServiceNow using its sys_id. Use this action when you need to fetch detailed information about a particular catalog item, including its name, description, associated categories, variables, client scripts, and display settings. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the catalog item to retrieve. This is a 32-character hexadecimal string that uniquely identifies the catalog item. Example: '011f117a9f3002002920bde8132e7020'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});

export const serviceNowGetServicCatalogItemVariables = tool({
    description: "Retrieves the list of variables defined for a ServiceNow Service Catalog item. Use this action when you need to fetch all variables associated with a catalog item, such as when building dynamic forms, validating required inputs, or understanding what information a user must provide when ordering an item. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the catalog item to retrieve variables for. This is a 32-character hexadecimal string that uniquely identifies the catalog item. Example: '011f117a9f3002002920bde8132e7020'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, '/api/now/table/item_option_new', {
            method: 'GET',
            query: { sysparm_query: `cat_item=${sysId}^active=true` },
        });
    },
});

export const serviceNowGetServiceCatalogCart = tool({
    description: "Retrieves the details of all items within the logged-in user's Service Catalog shopping cart. This action fetches the current contents of the shopping cart, including item details, quantities, prices, and any selected variables/options. The cart is associated with the authenticated user making the request. Use this action when you need to review items before submitting an order, verify quantities, or check selected options. This is a read-only operation that does not modify any data.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
    }),
    execute: async ({ servicenowCredentials }) => {
        return snRequest(servicenowCredentials, '/api/sn_sc/servicecatalog/cart', {
            method: 'GET',
        });
    },
});

export const serviceNowGetServiceCatalogCartDeliveryAddress = tool({
    description: "Retrieves the delivery/shipping address configured for a user's Service Catalog shopping cart. Use this action when you need to fetch the delivery address information associated with a user's ServiceNow Service Catalog cart. This is useful for verifying delivery details before placing an order or for displaying address information to users. The action returns address fields including street, city, state, zip code, country, and contact information such as phone and email.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        userId: z.string().describe("The unique identifier of the user whose delivery address to retrieve. This can be the user's sys_id (a 32-character hexadecimal string) or the user's username. For guest users, this is typically 'guest'. Example: 'guest' or '681ccaf9c0a8016400b98a908cbe7df3'"),
    }),
    execute: async ({ servicenowCredentials, userId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/cart/delivery_address/${encodeURIComponent(userId)}`, {
            method: 'GET',
        });
    },
});

export const serviceNowGetServiceCatalogCatalogById = tool({
    description: "Retrieves the available information for a specified service catalog by its sys_id. Use this action when you need to fetch detailed information about a specific service catalog in ServiceNow, including its title and description. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the service catalog to retrieve. This is a 32-character hexadecimal string that uniquely identifies the catalog. Example: '742ce428d7211100f2d224837e61036d'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/catalogs/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});

export const serviceNowGetServiceCatalogCatalogCategories = tool({
    description: "Retrieves the list of available categories for a specified ServiceNow Service Catalog. Use this action when you need to fetch the categories available within a specific service catalog, such as displaying available categories to users or navigating through catalog items. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        catalogId: z.string().describe("The unique system ID (sys_id) of the Service Catalog catalog to retrieve categories from. This is a 32-character hexadecimal string that uniquely identifies the catalog. Example: '742ce428d7211100f2d224837e61036d'"),
        sysparmLimit: z.number().optional().describe("Maximum number of categories to return. Defaults to 25 if not specified."),
        sysparmOffset: z.number().optional().describe("Number of records to skip for pagination. Use with sysparm_limit to paginate through results."),
    }),
    execute: async ({ servicenowCredentials, catalogId, sysparmLimit, sysparmOffset }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/catalogs/${encodeURIComponent(catalogId)}/categories`, {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_offset: sysparmOffset },
        });
    },
});

export const serviceNowGetServiceCatalogCategoryById = tool({
    description: "Retrieves the available information for a specified service catalog category by its sys_id. Use this action when you need to fetch detailed information about a specific service catalog category in ServiceNow, including its title, description, subcategories, and item count. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the service catalog category to retrieve. This is a 32-character hexadecimal string that uniquely identifies the category. Example: 'd258b953c611227a0146101fb1be7c31'"),
    }),
    execute: async ({ servicenowCredentials, sysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/categories/${encodeURIComponent(sysId)}`, {
            method: 'GET',
        });
    },
});

export const serviceNowGetServiceCatalogItemDelegation = tool({
    description: "Verifies whether a delegated user has access to a specific ServiceNow Service Catalog item. This action checks if a delegated user (identified by user_sys_id) is authorized to order or access a particular catalog item (identified by item_sys_id). Use this action to validate delegation permissions before attempting to submit orders on behalf of another user. Use this action when you need to verify delegation permissions for Service Catalog items, such as checking if a manager can order items on behalf of their team members or if an assistant has been granted proper access to order items for someone else.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        itemSysId: z.string().describe("The unique system ID (sys_id) of the Service Catalog item to check delegation access for. This is a 32-character hexadecimal string that uniquely identifies the catalog item. Example: '0123456789abcdef0123456789abcdef'"),
        userSysId: z.string().describe("The unique system ID (sys_id) of the delegated user to verify access for. This is a 32-character hexadecimal string that uniquely identifies the user. Example: 'fedcba9876543210fedcba9876543210'"),
    }),
    execute: async ({ servicenowCredentials, itemSysId, userSysId }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(itemSysId)}/delegation/${encodeURIComponent(userSysId)}`, {
            method: 'GET',
        });
    },
});

export const serviceNowGetServiceCatalogItemsList = tool({
    description: "Retrieves a list of catalog items from ServiceNow's Service Catalog API. Use when you need to browse available service catalog offerings, search for specific items by name or description, filter items by category or catalog, or retrieve catalog item details including pricing, availability, and metadata. Supports filtering via category, catalog, and text search parameters.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmText: z.string().optional().describe("Text search filter for catalog item name and short description. Searches across item names and descriptions to find matching items."),
        sysparmLimit: z.number().optional().describe("Maximum number of catalog items to return. Use this parameter to limit response size. For requests that exceed this number, use pagination to retrieve additional records. Note: Unusually large values can impact system performance."),
        sysparmCatalog: z.string().optional().describe("Filter catalog items by catalog sys_id or name. Returns only items that belong to the specified service catalog."),
        sysparmCategory: z.string().optional().describe("Filter catalog items by category sys_id or name. Returns only items that belong to the specified category."),
    }),
    execute: async ({ servicenowCredentials, sysparmText, sysparmLimit, sysparmCatalog, sysparmCategory }) => {
        return snRequest(servicenowCredentials, '/api/sn_sc/servicecatalog/items', {
            method: 'GET',
            query: {
                sysparm_text: sysparmText,
                sysparm_limit: sysparmLimit,
                sysparm_catalog: sysparmCatalog,
                sysparm_category: sysparmCategory,
            },
        });
    },
});

export const serviceNowGetServiceCatalogWishlistList = tool({
    description: "Retrieves the list of items in the logged-in user's ServiceNow Service Catalog wishlist. Use this action when you need to fetch the wishlist items for the currently authenticated user in ServiceNow's Service Catalog. This is useful for displaying a user's saved items, checking what items they have bookmarked, or preparing to add items to a cart. This is a read-only operation that does not modify any data in ServiceNow.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmLimit: z.number().optional().describe("Maximum number of wishlist items to return. Defaults to 25 if not specified."),
        sysparmOffset: z.number().optional().describe("Number of records to skip for pagination. Use with sysparm_limit to paginate through results."),
    }),
    execute: async ({ servicenowCredentials, sysparmLimit, sysparmOffset }) => {
        return snRequest(servicenowCredentials, '/api/sn_sc/servicecatalog/wishlist', {
            method: 'GET',
            query: { sysparm_limit: sysparmLimit, sysparm_offset: sysparmOffset },
        });
    },
});

export const serviceNowListServiceCatalogCatalogs = tool({
    description: "Retrieves a list of ServiceNow Service Catalog catalogs to which the user has access. Use this action when you need to fetch available service catalogs from ServiceNow, such as displaying available catalogs to users or filtering catalogs by name or description.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysparmText: z.string().optional().describe("Search text to filter catalogs by title or description"),
        sysparmLimit: z.number().optional().describe("Maximum number of catalogs to return. Defaults to 25 if not specified."),
    }),
    execute: async ({ servicenowCredentials, sysparmText, sysparmLimit }) => {
        return snRequest(servicenowCredentials, '/api/sn_sc/servicecatalog/catalogs', {
            method: 'GET',
            query: { sysparm_text: sysparmText, sysparm_limit: sysparmLimit },
        });
    },
});

export const serviceNowUpdateServicecatalogCart = tool({
    description: "Updates an existing item in the ServiceNow Service Portal shopping cart. Use this action when you need to modify the quantity or variables of a cart item in the Service Catalog before checking out. This action sends a PUT request to the Service Catalog cart API endpoint, updating the specified cart item. Use when you need to change the quantity of an item in a user's Service Portal shopping cart or update catalog item variables. The cart_item_id is required, and at least one of sysparm_quantity or variables should be provided.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        variables: z.record(z.any()).optional().describe("A dictionary of catalog item variable name-value string pairs to update. These are the variables associated with the catalog item. Example: {'u_department': 'IT', 'u_justification': 'New laptop needed'}"),
        cartItemId: z.string().describe("The unique system ID (sys_id) of the cart item to update in the current shopping cart. This is a 32-character hexadecimal string that uniquely identifies the cart item. Example: 'da46c07e83fbf210dd2dc2dfeeaad346'. The cart item must exist in the current user's cart."),
        sysparmQuantity: z.number().optional().describe("The new quantity for the cart item. Must be a positive integer (minimum 1). If not provided or set to null, the quantity remains unchanged. Example: 3"),
    }),
    execute: async ({ servicenowCredentials, variables, cartItemId, sysparmQuantity }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/cart/${encodeURIComponent(cartItemId)}`, {
            method: 'PUT',
            body: toServerKeys({ sysparmQuantity, variables }),
        });
    },
});

export const serviceNowUpdateServicecatalogItemsSubmitGuide = tool({
    description: "Submits an order guide in ServiceNow's Service Catalog with the specified variable values. Use this action when a user needs to submit an order guide in ServiceNow's Service Catalog, providing variable values for the items within the order guide. The action retrieves the configured contents of the order guide with the submitted variable values and calculates pricing totals. This is commonly used to preview and submit order guides that contain pre-configured sets of catalog items (e.g., laptop requests, software bundles). The action sends a PUT request with the order guide sys_id and variable values, and returns the order guide items with calculated pricing information. Note: This action is idempotent - submitting the same order guide multiple times with the same variables will return the same calculated values.",
    inputSchema: z.object({
        servicenowCredentials: z.string().optional().describe('Injected auth JSON {baseUrl, username, password} — do not provide'),
        sysId: z.string().describe("The unique system ID (sys_id) of the order guide to submit. This is a 32-character hexadecimal string that uniquely identifies the order guide item. Example: '25110912372211003e7d40ed9dbe5dd6'. The order guide must be active and available in the Service Catalog."),
        variables: z.record(z.any()).optional().describe("Variable values for the order guide submission. Keys are the variable names/IDs and values are the corresponding values to set. The required variables depend on the specific order guide configuration. Common variable types include text inputs, checkboxes, dropdowns, and reference fields. Example: {'requested_for': 'user@example.com', 'justification': 'New equipment needed'}"),
    }),
    execute: async ({ servicenowCredentials, sysId, variables }) => {
        return snRequest(servicenowCredentials, `/api/sn_sc/servicecatalog/items/${encodeURIComponent(sysId)}/submit_guide`, {
            method: 'PUT',
            body: toServerKeys({ variables }),
        });
    },
});
