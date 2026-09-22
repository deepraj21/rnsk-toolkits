// @ts-nocheck
import { ZohoConvertZohoLead } from './convert-zoho-lead.js';
import { ZohoCreateContact } from './create-contact.js';
import { ZohoCreateDeal } from './create-deal.js';
import { ZohoCreateEmailDraft } from './create-email-draft.js';
import { ZohoCreateEvent } from './create-event.js';
import { ZohoCreateLead } from './create-lead.js';
import { ZohoCreateNote } from './create-note.js';
import { ZohoCreateZohoRecord } from './create-zoho-record.js';
import { ZohoCreateZohoTag } from './create-zoho-tag.js';
import { ZohoDeleteAccount } from './delete-account.js';
import { ZohoDeleteContact } from './delete-contact.js';
import { ZohoDeleteDeal } from './delete-deal.js';
import { ZohoGetAccount } from './get-account.js';
import { ZohoGetCall } from './get-call.js';
import { ZohoGetContact } from './get-contact.js';
import { ZohoGetEmailDrafts } from './get-email-drafts.js';
import { ZohoGetEvent } from './get-event.js';
import { ZohoGetFromAddresses } from './get-from-addresses.js';
import { ZohoGetModuleFields } from './get-module-fields.js';
import { ZohoGetNote } from './get-note.js';
import { ZohoGetRecordEmails } from './get-record-emails.js';
import { ZohoGetRelatedLists } from './get-related-lists.js';
import { ZohoGetRelatedRecords } from './get-related-records.js';
import { ZohoGetTask } from './get-task.js';
import { ZohoGetUser } from './get-user.js';
import { ZohoGetZohoRecords } from './get-zoho-records.js';
import { ZohoGetZohoUsers } from './get-zoho-users.js';
import { ZohoListAccounts } from './list-accounts.js';
import { ZohoListCalls } from './list-calls.js';
import { ZohoListContacts } from './list-contacts.js';
import { ZohoListDeals } from './list-deals.js';
import { ZohoListEvents } from './list-events.js';
import { ZohoListLeads } from './list-leads.js';
import { ZohoListModules } from './list-modules.js';
import { ZohoListNotes } from './list-notes.js';
import { ZohoListRecordAttachments } from './list-record-attachments.js';
import { ZohoListTasks } from './list-tasks.js';
import { ZohoSearchAccounts } from './search-accounts.js';
import { ZohoSearchCalls } from './search-calls.js';
import { ZohoSearchContacts } from './search-contacts.js';
import { ZohoSearchDeals } from './search-deals.js';
import { ZohoSearchEvents } from './search-events.js';
import { ZohoSearchLeads } from './search-leads.js';
import { ZohoSearchNotes } from './search-notes.js';
import { ZohoSearchTasks } from './search-tasks.js';
import { ZohoSearchZohoRecords } from './search-zoho-records.js';
import { ZohoUpdateAccount } from './update-account.js';
import { ZohoUpdateCall } from './update-call.js';
import { ZohoUpdateDeal } from './update-deal.js';
import { ZohoUpdateEmailDraft } from './update-email-draft.js';
import { ZohoUpdateEvent } from './update-event.js';
import { ZohoUpdateLead } from './update-lead.js';
import { ZohoUpdateNote } from './update-note.js';
import { ZohoUpdateRelatedRecords } from './update-related-records.js';
import { ZohoUpdateZohoRecord } from './update-zoho-record.js';
import { ZohoUploadAttachment } from './upload-attachment.js';
import { ZohoValidateCredential } from './validate-credential.js';

export { ZohoConvertZohoLead };
export { ZohoCreateContact };
export { ZohoCreateDeal };
export { ZohoCreateEmailDraft };
export { ZohoCreateEvent };
export { ZohoCreateLead };
export { ZohoCreateNote };
export { ZohoCreateZohoRecord };
export { ZohoCreateZohoTag };
export { ZohoDeleteAccount };
export { ZohoDeleteContact };
export { ZohoDeleteDeal };
export { ZohoGetAccount };
export { ZohoGetCall };
export { ZohoGetContact };
export { ZohoGetEmailDrafts };
export { ZohoGetEvent };
export { ZohoGetFromAddresses };
export { ZohoGetModuleFields };
export { ZohoGetNote };
export { ZohoGetRecordEmails };
export { ZohoGetRelatedLists };
export { ZohoGetRelatedRecords };
export { ZohoGetTask };
export { ZohoGetUser };
export { ZohoGetZohoRecords };
export { ZohoGetZohoUsers };
export { ZohoListAccounts };
export { ZohoListCalls };
export { ZohoListContacts };
export { ZohoListDeals };
export { ZohoListEvents };
export { ZohoListLeads };
export { ZohoListModules };
export { ZohoListNotes };
export { ZohoListRecordAttachments };
export { ZohoListTasks };
export { ZohoSearchAccounts };
export { ZohoSearchCalls };
export { ZohoSearchContacts };
export { ZohoSearchDeals };
export { ZohoSearchEvents };
export { ZohoSearchLeads };
export { ZohoSearchNotes };
export { ZohoSearchTasks };
export { ZohoSearchZohoRecords };
export { ZohoUpdateAccount };
export { ZohoUpdateCall };
export { ZohoUpdateDeal };
export { ZohoUpdateEmailDraft };
export { ZohoUpdateEvent };
export { ZohoUpdateLead };
export { ZohoUpdateNote };
export { ZohoUpdateRelatedRecords };
export { ZohoUpdateZohoRecord };
export { ZohoUploadAttachment };
export { ZohoValidateCredential };

export const zohoTools = [
    { name: 'ZohoConvertZohoLead', description: 'Converts a lead into a contact, account, and optionally a deal in Zoho CRM.', tool: ZohoConvertZohoLead, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateContact', description: 'Creates a new contact record in Zoho CRM. Use this action when you need to add a new contact to the CRM system. The Last_Name field is mandatory and must be provided with a non-emp', tool: ZohoCreateContact, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateDeal', description: 'Creates a new deal in Zoho CRM representing a sales opportunity with deal name, stage, amount, and closing date. Use this action when you need to create a sales deal or opportunity', tool: ZohoCreateDeal, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateEmailDraft', description: 'Creates email drafts for a specific record in Zoho CRM. Email drafts are saved but not sent, allowing for review and editing before sending. Use this action when you need to prepar', tool: ZohoCreateEmailDraft, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateEvent', description: 'Creates a new Event record in Zoho CRM. Events represent scheduled activities like meetings, calls, or appointments. Use this action when you need to schedule a new event or meetin', tool: ZohoCreateEvent, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateLead', description: 'Creates a new lead record in Zoho CRM with the specified details. The only mandatory field is Last_Name - all other fields are optional. Use this action when you need to add a new ', tool: ZohoCreateLead, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateNote', description: 'Creates a new note attached to a specific record in Zoho CRM. Notes are text annotations that can be added to any standard or custom module record. Use this action when you need to', tool: ZohoCreateNote, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateZohoRecord', description: 'Creates new records in a specified module in Zoho CRM. Bulk operations may partially succeed — inspect each item\'s status field in the response, as some records may be created whi', tool: ZohoCreateZohoRecord, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoCreateZohoTag', description: 'Creates a new tag in Zoho CRM for a specific module. Tags help organize and categorize CRM records. Each module can have up to 100 tags, and each record can have up to 10 tags assi', tool: ZohoCreateZohoTag, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoDeleteAccount', description: 'Deletes an existing account record from Zoho CRM. This action permanently removes the account and cannot be undone through the API. Use this action when you need to remove an accou', tool: ZohoDeleteAccount, requiredAuth: 'zohoToken' as const, scope: 'delete' as const },
    { name: 'ZohoDeleteContact', description: 'Deletes a contact from Zoho CRM. This action is irreversible — the contact cannot be recovered once deleted. Use this action when you need to permanently remove a contact record fr', tool: ZohoDeleteContact, requiredAuth: 'zohoToken' as const, scope: 'delete' as const },
    { name: 'ZohoDeleteDeal', description: 'Deletes a deal record from Zoho CRM. This action is irreversible — once deleted, the deal cannot be recovered. Use this action when you need to permanently remove a deal from the C', tool: ZohoDeleteDeal, requiredAuth: 'zohoToken' as const, scope: 'delete' as const },
    { name: 'ZohoGetAccount', description: 'Retrieves a specific Account record from Zoho CRM by its unique identifier. Returns complete account details including all standard and custom fields. Use this action when you need', tool: ZohoGetAccount, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetCall', description: 'Retrieves a specific Call record by its unique identifier from Zoho CRM. Use this action when you need to fetch detailed information about a particular call, including its subject,', tool: ZohoGetCall, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetContact', description: 'Retrieves a single contact record by ID from Zoho CRM. Returns the complete contact details including owner information, account associations, address fields, and all custom fields', tool: ZohoGetContact, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetEmailDrafts', description: 'Retrieves email drafts associated with a specific record in Zoho CRM. Use this action when you need to view unsent email drafts that have been composed for a CRM record. This retur', tool: ZohoGetEmailDrafts, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetEvent', description: 'Retrieves a specific event record from Zoho CRM by its unique identifier. Returns complete event details including all standard and custom fields. Use this action when you need to ', tool: ZohoGetEvent, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetFromAddresses', description: 'Retrieves the list of from addresses configured for email operations in Zoho CRM. Use this action when you need to get available email addresses for sending emails or configuring e', tool: ZohoGetFromAddresses, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetModuleFields', description: 'Retrieves field metadata for a Zoho CRM module including API names, data types, permissions, and configuration details. Use this tool to discover correct field names and types befo', tool: ZohoGetModuleFields, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetNote', description: 'Retrieves a single note by its unique identifier from Zoho CRM. Returns the note\'s title, content, parent record reference, owner details, and timestamps. Use this action when you', tool: ZohoGetNote, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetRecordEmails', description: 'Retrieves all emails associated with a specific record in Zoho CRM. Use this action when you need to fetch email history for a lead, contact, account, deal, or other CRM record. Th', tool: ZohoGetRecordEmails, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetRelatedLists', description: 'Retrieves related list metadata for a Zoho CRM module to discover correct api_name values. Use this before updating related records to avoid INVALID_DATA errors from incorrect rela', tool: ZohoGetRelatedLists, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetRelatedRecords', description: 'Fetch related-list records (e.g., Notes, Attachments, Emails) for a Zoho CRM parent record using related_list_api_name. Use ZOHO_GET_RELATED_LISTS first to discover the correct api', tool: ZohoGetRelatedRecords, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetTask', description: 'Retrieves a specific task record by its ID from Zoho CRM. Returns complete task data including all standard and custom fields, subforms, and multi-user lookup fields that are only ', tool: ZohoGetTask, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetUser', description: 'Retrieves a specific user from Zoho CRM by their user ID. Returns detailed user information including name, email, role, profile, status, and preferences. Use this action when you ', tool: ZohoGetUser, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetZohoRecords', description: 'Retrieves records from a specified module in Zoho CRM. Notes: - Discrete (page/per_page) pagination is limited to the first 2,000 records. To retrieve records beyond this, use toke', tool: ZohoGetZohoRecords, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoGetZohoUsers', description: 'Tool to retrieve users from Zoho CRM. Use when you need to fetch user information such as IDs, names, emails, roles, or status for setting Owner fields or performing user-related o', tool: ZohoGetZohoUsers, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListAccounts', description: 'Retrieves a list of account records from Zoho CRM with pagination and filtering support. Use this action when you need to fetch multiple account records from the Accounts module, o', tool: ZohoListAccounts, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListCalls', description: 'Retrieves Call activity records from Zoho CRM with pagination support. Use this action when you need to list calls logged in the CRM, filter by custom views, or retrieve specific C', tool: ZohoListCalls, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListContacts', description: 'Retrieves contact records from Zoho CRM with support for pagination, filtering, and sorting. Use this action when you need to fetch a list of contacts from Zoho CRM. This is a spec', tool: ZohoListContacts, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListDeals', description: 'Retrieves a list of deals from Zoho CRM with support for filtering, sorting, and pagination. Use this action when you need to fetch deal records from Zoho CRM, whether all deals or', tool: ZohoListDeals, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListEvents', description: 'Lists events (meetings) from Zoho CRM with pagination and filtering support. Use this action when you need to retrieve scheduled events, meetings, or appointments from Zoho CRM for', tool: ZohoListEvents, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListLeads', description: 'Retrieves lead records from Zoho CRM\'s Leads module with pagination support. Use this action when you need to list, filter, or paginate through leads in the CRM. Supports both dis', tool: ZohoListLeads, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListModules', description: 'Lists all available Zoho CRM modules (standard + custom) to reliably select module API names/IDs for operations. Use this tool before calling other module-specific operations to en', tool: ZohoListModules, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListNotes', description: 'Retrieves a list of notes from Zoho CRM across all modules. Notes are returned in chronological order (oldest first by default). Use this action when you need to view all notes in ', tool: ZohoListNotes, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListRecordAttachments', description: 'Tool to list attachment metadata (id, File_Name, Size, Created_Time, etc.) for a specific Zoho CRM record. Use when you need to identify attachments before downloading them via oth', tool: ZohoListRecordAttachments, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoListTasks', description: 'Retrieves tasks from the Tasks module in Zoho CRM with support for filtering, pagination, and sorting. Use this action when you need to fetch a list of tasks, either all tasks or s', tool: ZohoListTasks, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchAccounts', description: 'Search for Account records within Zoho CRM using server-side queries. Returns accounts matching the specified criteria, email, phone, or keyword. Use this action when you need to f', tool: ZohoSearchAccounts, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchCalls', description: 'Search for Call records in Zoho CRM using server-side queries. Returns calls matching the specified criteria, email, phone, or keyword. Use this action when you need to find specif', tool: ZohoSearchCalls, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchContacts', description: 'Search for contacts in Zoho CRM using server-side queries by criteria, email, phone, or keyword. This action performs efficient server-side filtering in the Contacts module, avoidi', tool: ZohoSearchContacts, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchDeals', description: 'Search for Deal records in Zoho CRM using server-side queries. Supports searching by criteria (field conditions), email, phone, or keyword. Use this action when you need to find sp', tool: ZohoSearchDeals, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchEvents', description: 'Search for Events in Zoho CRM using server-side queries. Supports searching by field criteria, email, phone, or keyword. Use this action when you need to find specific events (meet', tool: ZohoSearchEvents, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchLeads', description: 'Search for lead records in Zoho CRM using server-side queries. Use this action when you need to find specific leads by criteria (field conditions), email address, phone number, or ', tool: ZohoSearchLeads, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchNotes', description: 'Search for notes in Zoho CRM using server-side queries. Allows searching notes by criteria (field conditions), keyword, email, or phone number. Use this action when you need to fin', tool: ZohoSearchNotes, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchTasks', description: 'Search for tasks in Zoho CRM using flexible criteria including subject, status, priority, or due date. Use this action when you need to find specific task records by criteria, emai', tool: ZohoSearchTasks, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoSearchZohoRecords', description: 'Search for records within a Zoho CRM module using server-side queries. Use when you need to find specific records by criteria, email, phone, or keyword instead of listing all recor', tool: ZohoSearchZohoRecords, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
    { name: 'ZohoUpdateAccount', description: 'Updates an existing Account record in Zoho CRM with the specified field values. Only the fields provided in the request will be updated; other fields remain unchanged. Use this act', tool: ZohoUpdateAccount, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateCall', description: 'Updates existing call records in the Calls module in Zoho CRM. Supports updating up to 100 call records per API call. Use this action when you need to modify call details such as c', tool: ZohoUpdateCall, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateDeal', description: 'Updates an existing deal in Zoho CRM. Use this action when you need to modify specific fields of a deal record, such as updating the deal amount, stage, closing date, or associated', tool: ZohoUpdateDeal, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateEmailDraft', description: 'Updates an existing email draft associated with a record in Zoho CRM. Requires the draft ID, sender address, and text format. Use this action when you need to modify the recipients', tool: ZohoUpdateEmailDraft, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateEvent', description: 'Updates existing events in Zoho CRM. Supports updating up to 100 events per API call. Use this action when you need to modify event details such as title, start/end times, location', tool: ZohoUpdateEvent, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateLead', description: 'Updates existing lead records in Zoho CRM. Supports updating up to 100 leads per API call. Use this action when you need to modify lead information such as contact details, lead st', tool: ZohoUpdateLead, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateNote', description: 'Updates an existing note in Zoho CRM. Only the Note_Title and Note_Content fields can be modified. Read-only fields (Owner, Modified_Time, Created_Time, Modified_By, Created_By) ca', tool: ZohoUpdateNote, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateRelatedRecords', description: 'Associates or updates relationships between records across different modules in Zoho CRM. This action creates or modifies relationships between a parent record and related records.', tool: ZohoUpdateRelatedRecords, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUpdateZohoRecord', description: 'Updates existing records in a specified module in Zoho CRM. Supports updating up to 100 records per API call. Use field API names (not display names) for all field updates. The \'i', tool: ZohoUpdateZohoRecord, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoUploadAttachment', description: 'Tool to upload a file as an Attachment to a specific Zoho CRM record. Use when you need to store files (PDFs, documents, images) in a record\'s Attachments section.', tool: ZohoUploadAttachment, requiredAuth: 'zohoToken' as const, scope: 'write' as const },
    { name: 'ZohoValidateCredential', description: 'Validates Zoho CRM credentials by retrieving current user information. Returns user details if credentials are valid. Use this action when you need to verify that API credentials a', tool: ZohoValidateCredential, requiredAuth: 'zohoToken' as const, scope: 'read' as const },
];