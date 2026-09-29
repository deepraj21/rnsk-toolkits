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

export const hubspotArchiveContact = tool({
  description:
    'Archives a HubSpot contact by its ID. Archiving hides the contact; it is reversible from HubSpot within 90 days.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    contactId: z
      .string()
      .describe(
        "Numeric HubSpot contact ID (e.g., '386009987808'). Note: The archive endpoint does NOT support email addresses or idProperty - use HUBSPOT_GET_CONTACTS or HUBSPOT_SEARCH_CONTACTS to find the numeric ID first.",
      ),
  }),
  execute: async ({ hubspotToken, contactId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/crm/v3/objects/contacts/${encodeURIComponent(String(contactId))}`,
    );
  },
});

export const hubspotArchiveContacts = tool({
  description: 'Archives multiple HubSpot contacts by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('A list of contact objects, each specifying the ID of the contact to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateContact = tool({
  description: 'Creates a new HubSpot contact.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    fax: z.string().optional().describe("The contact's fax number."),
    zip: z.string().optional().describe("The contact's postal code or ZIP code."),
    city: z.string().optional().describe('The city where the contact resides.'),
    email: z
      .string()
      .optional()
      .describe(
        'The primary email address of the contact. This is a unique identifier for contacts in HubSpot.',
      ),
    phone: z
      .string()
      .optional()
      .describe("The contact's primary phone number (often a business phone)."),
    photo: z.string().optional().describe("URL of the contact's photo or avatar."),
    state: z.string().optional().describe('The state or region where the contact resides.'),
    degree: z.string().optional().describe("The contact's highest completed educational degree."),
    gender: z.string().optional().describe("The contact's gender."),
    school: z
      .string()
      .optional()
      .describe('The name of the school, college, or university the contact attended.'),
    address: z
      .string()
      .optional()
      .describe("The contact's street address, including apartment or unit number."),
    company: z
      .string()
      .optional()
      .describe(
        'The name of the company the contact works for. If `associatedcompanyid` is set, this field might be auto-populated.',
      ),
    country: z.string().optional().describe('The country where the contact resides.'),
    ipCity: z
      .string()
      .optional()
      .describe(
        "The city associated with the contact's IP address, often captured during their first website visit or form submission.",
      ),
    message: z
      .string()
      .optional()
      .describe(
        "A free-text message or note often captured from a form submission's message field.",
      ),
    website: z
      .string()
      .optional()
      .describe("The URL of the contact's personal or company website."),
    industry: z
      .string()
      .optional()
      .describe('The primary industry of the company the contact works for.'),
    ipState: z
      .string()
      .optional()
      .describe("The state or region associated with the contact's IP address."),
    jobtitle: z.string().optional().describe("The contact's job title."),
    lastname: z.string().optional().describe("The contact's last name."),
    closedate: z
      .string()
      .optional()
      .describe(
        'The date when the deal associated with this contact was closed. Expected format is a UTC timestamp in milliseconds.',
      ),
    firstname: z.string().optional().describe("The contact's first name."),
    ipLatlon: z
      .string()
      .optional()
      .describe(
        "The approximate latitude and longitude associated with the contact's IP address, typically in 'latitude,longitude' format.",
      ),
    numNotes: z
      .string()
      .optional()
      .describe("The total number of notes logged on the contact's record."),
    ownername: z
      .string()
      .optional()
      .describe('The full name of the HubSpot user who owns this contact. Read-only.'),
    seniority: z
      .string()
      .optional()
      .describe("The contact's seniority level within their organization."),
    createdate: z
      .string()
      .optional()
      .describe(
        'The date and time when the contact record was created in HubSpot. This is a read-only property, typically a UTC timestamp.',
      ),
    ipCountry: z
      .string()
      .optional()
      .describe("The country associated with the contact's IP address."),
    ipZipcode: z
      .string()
      .optional()
      .describe("The postal code or ZIP code associated with the contact's IP address."),
    owneremail: z
      .string()
      .optional()
      .describe(
        "The email address of the HubSpot user who owns this contact. Read-only, reflects the owner's primary email.",
      ),
    salutation: z
      .string()
      .optional()
      .describe("The salutation for the contact (e.g., 'Mr.', 'Ms.', 'Dr.')."),
    startDate: z
      .string()
      .optional()
      .describe(
        "The contact's start date, typically referring to their employment start date at their current company. Format can vary.",
      ),
    twitterbio: z
      .string()
      .optional()
      .describe("The contact's biography from their Twitter profile."),
    workEmail: z
      .string()
      .optional()
      .describe(
        "The contact's work email address. This might be different from the primary `email` if that's a personal address.",
      ),
    linkedinbio: z
      .string()
      .optional()
      .describe("The contact's biography from their LinkedIn profile."),
    mobilephone: z.string().optional().describe("The contact's mobile phone number."),
    associations: z
      .array(
        z.object({ to: z.record(z.any()), types: z.array(z.record(z.any())) }).catchall(z.any()),
      )
      .optional()
      .describe(
        'List of associations to create with other existing HubSpot objects (e.g., companies, deals).',
      ),
    companySize: z
      .string()
      .optional()
      .describe(
        "The size of the company the contact works for, often categorized (e.g., '1-10 employees', '501-1000 employees').",
      ),
    hubspotscore: z
      .string()
      .optional()
      .describe(
        "The contact's HubSpot lead score, calculated based on criteria defined in your HubSpot portal's scoring settings.",
      ),
    jobFunction: z.string().optional().describe("The contact's job function or department."),
    numemployees: z
      .string()
      .optional()
      .describe(
        "The number of employees at the company the contact works for. This may differ from 'company_size' if manually entered or from a different source.",
      ),
    annualrevenue: z
      .string()
      .optional()
      .describe('The annual revenue of the company the contact works for.'),
    dateOfBirth: z
      .string()
      .optional()
      .describe("The contact's date of birth. Format can vary, but YYYY-MM-DD is common."),
    daysToClose: z
      .string()
      .optional()
      .describe(
        'The number of days it took to close the deal associated with this contact. This is usually calculated automatically.',
      ),
    followercount: z
      .string()
      .optional()
      .describe(
        'The number of followers the contact has on a specified social media platform (e.g., Twitter).',
      ),
    ipStateCode: z
      .string()
      .optional()
      .describe(
        "The state or region code associated with the contact's IP address (e.g., US state code).",
      ),
    totalRevenue: z
      .string()
      .optional()
      .describe(
        'The total revenue generated from all closed-won deals associated with this contact.',
      ),
    twitterhandle: z
      .string()
      .optional()
      .describe("The contact's Twitter username (handle), without the '@' symbol."),
    fieldOfStudy: z
      .string()
      .optional()
      .describe("The contact's primary field of study during their education."),
    hsLegalBasis: z
      .enum([
        'Legitimate interest \u2013 prospect/lead',
        'Legitimate interest \u2013 existing customer',
        'Legitimate interest - other',
        'Performance of a contract',
        'Freely given consent from contact',
        'Not applicable',
      ])
      .optional()
      .describe('Legal basis for processing contact data under GDPR and privacy regulations.'),
    lifecyclestage: z
      .string()
      .optional()
      .describe(
        "The contact's current stage in your sales and marketing funnel (e.g., 'Lead', 'Marketing Qualified Lead', 'Customer'). These stages are customizable in HubSpot.",
      ),
    maritalStatus: z.string().optional().describe("The contact's marital status."),
    graduationDate: z
      .string()
      .optional()
      .describe(
        "The contact's graduation date from their educational institution. Format can vary.",
      ),
    hsAllTeamIds: z
      .string()
      .optional()
      .describe(
        'A semicolon-separated list of all HubSpot Team IDs this contact is or has been associated with.',
      ),
    hubspotTeamId: z
      .string()
      .optional()
      .describe('The ID of the HubSpot team that owns this contact.'),
    ipCountryCode: z
      .string()
      .optional()
      .describe(
        "The two-letter country code (ISO 3166-1 alpha-2) associated with the contact's IP address.",
      ),
    militaryStatus: z.string().optional().describe("The contact's military status."),
    hsAllOwnerIds: z
      .string()
      .optional()
      .describe(
        'A semicolon-separated list of all HubSpot Owner IDs who have been assigned to this contact at some point.',
      ),
    hubspotOwnerId: z
      .string()
      .optional()
      .describe('The ID of the HubSpot user who is the current owner of this contact.'),
    lastmodifieddate: z
      .string()
      .optional()
      .describe(
        'The date and time when the contact record was last modified. This is a read-only property, UTC timestamp.',
      ),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        "A dictionary of custom properties to set for the contact. Keys are the internal names of your custom contact properties, and values are the data to set. Example: `{'custom_property_internal_name': 'value_for_custom_property'}`. Note: For common properties with enum values like hs_legal_basis, use the dedicated field instead of custom_properties to ensure proper validation.",
      ),
    kloutscoregeneral: z
      .string()
      .optional()
      .describe(
        "The contact's general Klout score, if available and integrated. Klout was a service that rated social media influence.",
      ),
    notesLastUpdated: z
      .string()
      .optional()
      .describe(
        'The date and time when the notes on the contact record were last updated. UTC timestamp in milliseconds.',
      ),
    recentDealAmount: z
      .string()
      .optional()
      .describe('The amount of the most recent closed-won deal associated with this contact.'),
    associatedcompanyid: z
      .string()
      .optional()
      .describe(
        'The ID of the primary company associated with this contact. This is a read-only property automatically updated when an association is made.',
      ),
    currentlyinworkflow: z
      .string()
      .optional()
      .describe(
        "Indicates whether the contact is currently active in any HubSpot workflow. Boolean value, 'true' or 'false'.",
      ),
    hsAllContactVids: z
      .string()
      .optional()
      .describe(
        'A semicolon-separated list of all HubSpot Contact VID (Visitor ID) values associated with this contact, typically used for merging contacts.',
      ),
    hsAnalyticsSource: z
      .string()
      .optional()
      .describe(
        "The original source that generated the contact (e.g., 'Organic Search', 'Paid Social', 'Referrals').",
      ),
    linkedinconnections: z
      .string()
      .optional()
      .describe('The number of LinkedIn connections the contact has.'),
    numContactedNotes: z
      .string()
      .optional()
      .describe(
        'The number of notes on the contact record that relate to being contacted (e.g., call logs, meeting notes).',
      ),
    relationshipStatus: z
      .string()
      .optional()
      .describe("The contact's self-reported relationship status."),
    twitterprofilephoto: z
      .string()
      .optional()
      .describe("URL of the contact's Twitter profile photo."),
    hsAdditionalEmails: z
      .string()
      .optional()
      .describe('A semicolon-separated list of additional email addresses for the contact.'),
    hsAnalyticsRevenue: z
      .string()
      .optional()
      .describe(
        "Revenue attributed to this contact through HubSpot's analytics or e-commerce integrations. This is often a sum of closed-won deal amounts associated with the contact.",
      ),
    notesLastContacted: z
      .string()
      .optional()
      .describe(
        'The date and time the contact was last contacted, based on logged activities like calls, emails, or meetings. UTC timestamp in milliseconds.',
      ),
    numAssociatedDeals: z
      .string()
      .optional()
      .describe('The total number of deals currently associated with this contact.'),
    firstConversionDate: z
      .string()
      .optional()
      .describe(
        "The date and time of the contact's first conversion (e.g., form submission). UTC timestamp.",
      ),
    hsAnalyticsLastUrl: z
      .string()
      .optional()
      .describe('The last URL on your website that the contact visited.'),
    numConversionEvents: z
      .string()
      .optional()
      .describe(
        'The total number of conversion events (e.g., form submissions, CTA clicks) attributed to this contact.',
      ),
    hsAnalyticsFirstUrl: z
      .string()
      .optional()
      .describe('The first URL on your website that the contact visited.'),
    recentConversionDate: z
      .string()
      .optional()
      .describe("The date and time of the contact's most recent conversion event. UTC timestamp."),
    recentDealCloseDate: z
      .string()
      .optional()
      .describe(
        'The close date of the most recent closed-won deal associated with this contact. UTC timestamp in milliseconds.',
      ),
    firstDealCreatedDate: z
      .string()
      .optional()
      .describe(
        'The date and time when the first deal was created for this contact. UTC timestamp.',
      ),
    hsAnalyticsNumVisits: z
      .string()
      .optional()
      .describe('The total number of sessions (visits) the contact has had on your website.'),
    webinareventlastupdated: z
      .string()
      .optional()
      .describe(
        'Timestamp of the last update related to a webinar event (e.g., GoToWebinar) for this contact, if integrated. UTC timestamp.',
      ),
    notesNextActivityDate: z
      .string()
      .optional()
      .describe(
        'The date and time of the next scheduled activity (e.g., task, meeting) with the contact. UTC timestamp in milliseconds.',
      ),
    hsAllAccessibleTeamIds: z
      .string()
      .optional()
      .describe(
        'A semicolon-separated list of HubSpot Team IDs that have access to this contact record.',
      ),
    hsAnalyticsLastReferrer: z
      .string()
      .optional()
      .describe(
        'The last referring URL that brought the contact to your website before their most recent session.',
      ),
    hsAnalyticsSourceData1: z
      .string()
      .optional()
      .describe(
        "Additional detail for the source. For 'Organic search', this might be the search engine. For 'Paid social', this could be the social media platform.",
      ),
    hsAnalyticsSourceData2: z
      .string()
      .optional()
      .describe(
        "Further detail for the source. For 'Organic search', this might be the keyword. For 'Paid social', this could be the campaign name.",
      ),
    hubspotOwnerAssigneddate: z
      .string()
      .optional()
      .describe(
        'The date and time when a HubSpot owner was most recently assigned to this contact. UTC timestamp in milliseconds.',
      ),
    firstConversionEventName: z
      .string()
      .optional()
      .describe("The name or identifier of the event that marked the contact's first conversion."),
    hsAnalyticsFirstReferrer: z
      .string()
      .optional()
      .describe('The first referring URL that brought the contact to your website.'),
    hsAnalyticsLastTimestamp: z
      .string()
      .optional()
      .describe(
        "Timestamp of the contact's last recorded interaction (e.g., last website visit, form submission). UTC timestamp.",
      ),
    hsAnalyticsNumPageViews: z
      .string()
      .optional()
      .describe('The total number of pages viewed by the contact on your website.'),
    associatedcompanylastupdated: z
      .string()
      .optional()
      .describe(
        'The timestamp of the last update to the primary associated company. This is a read-only property.',
      ),
    hsAnalyticsFirstTimestamp: z
      .string()
      .optional()
      .describe(
        "Timestamp of the contact's first recorded interaction (e.g., first website visit). UTC timestamp.",
      ),
    numUniqueConversionEvents: z
      .string()
      .optional()
      .describe('The number of unique types of conversion events completed by the contact.'),
    recentConversionEventName: z
      .string()
      .optional()
      .describe("The name or identifier of the contact's most recent conversion event."),
    surveymonkeyeventlastupdated: z
      .string()
      .optional()
      .describe(
        'Timestamp of the last update related to a SurveyMonkey event for this contact, if integrated. UTC timestamp.',
      ),
    engagementsLastMeetingBooked: z
      .string()
      .optional()
      .describe(
        "Timestamp of the last meeting booked with the contact through HubSpot's meetings tool.",
      ),
    hsAnalyticsAveragePageViews: z
      .string()
      .optional()
      .describe(
        'The average number of pages viewed by the contact per session on your website, tracked by HubSpot analytics.',
      ),
    hsAllAssignedBusinessUnitIds: z
      .string()
      .optional()
      .describe(
        "A semicolon-separated list of Business Unit IDs assigned to this contact, if using HubSpot's Business Units feature.",
      ),
    hsAnalyticsLastVisitTimestamp: z
      .string()
      .optional()
      .describe("Timestamp of the contact's most recent visit to your website. UTC timestamp."),
    hsAnalyticsFirstVisitTimestamp: z
      .string()
      .optional()
      .describe("Timestamp of the contact's first visit to your website. UTC timestamp."),
    hsAnalyticsNumEventCompletions: z
      .string()
      .optional()
      .describe('The total number of HubSpot custom events completed by the contact.'),
    engagementsLastMeetingBookedMedium: z
      .string()
      .optional()
      .describe(
        "The medium (e.g., 'Meetings Tool', 'Email') through which the last meeting was booked.",
      ),
    engagementsLastMeetingBookedSource: z
      .string()
      .optional()
      .describe("The source (e.g., 'SALES', 'MARKETING') of the last meeting booked."),
    engagementsLastMeetingBookedCampaign: z
      .string()
      .optional()
      .describe('The HubSpot campaign ID (GUID) associated with the last meeting booked.'),
    hsAnalyticsLastTouchConvertingCampaign: z
      .string()
      .optional()
      .describe(
        "The HubSpot campaign ID (GUID) of the campaign that led to the contact's most recent conversion.",
      ),
    hsAnalyticsFirstTouchConvertingCampaign: z
      .string()
      .optional()
      .describe(
        "The HubSpot campaign ID (GUID) of the campaign that led to the contact's first conversion.",
      ),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts`, {
      body: flatProps(input, {
        fax: 'fax',
        zip: 'zip',
        city: 'city',
        email: 'email',
        phone: 'phone',
        photo: 'photo',
        state: 'state',
        degree: 'degree',
        gender: 'gender',
        school: 'school',
        address: 'address',
        company: 'company',
        country: 'country',
        ipCity: 'ip_city',
        message: 'message',
        website: 'website',
        industry: 'industry',
        ipState: 'ip_state',
        jobtitle: 'jobtitle',
        lastname: 'lastname',
        closedate: 'closedate',
        firstname: 'firstname',
        ipLatlon: 'ip_latlon',
        numNotes: 'num_notes',
        ownername: 'ownername',
        seniority: 'seniority',
        createdate: 'createdate',
        ipCountry: 'ip_country',
        ipZipcode: 'ip_zipcode',
        owneremail: 'owneremail',
        salutation: 'salutation',
        startDate: 'start_date',
        twitterbio: 'twitterbio',
        workEmail: 'work_email',
        linkedinbio: 'linkedinbio',
        mobilephone: 'mobilephone',
        companySize: 'company_size',
        hubspotscore: 'hubspotscore',
        jobFunction: 'job_function',
        numemployees: 'numemployees',
        annualrevenue: 'annualrevenue',
        dateOfBirth: 'date_of_birth',
        daysToClose: 'days_to_close',
        followercount: 'followercount',
        ipStateCode: 'ip_state_code',
        totalRevenue: 'total_revenue',
        twitterhandle: 'twitterhandle',
        fieldOfStudy: 'field_of_study',
        hsLegalBasis: 'hs_legal_basis',
        lifecyclestage: 'lifecyclestage',
        maritalStatus: 'marital_status',
        graduationDate: 'graduation_date',
        hsAllTeamIds: 'hs_all_team_ids',
        hubspotTeamId: 'hubspot_team_id',
        ipCountryCode: 'ip_country_code',
        militaryStatus: 'military_status',
        hsAllOwnerIds: 'hs_all_owner_ids',
        hubspotOwnerId: 'hubspot_owner_id',
        lastmodifieddate: 'lastmodifieddate',
        kloutscoregeneral: 'kloutscoregeneral',
        notesLastUpdated: 'notes_last_updated',
        recentDealAmount: 'recent_deal_amount',
        associatedcompanyid: 'associatedcompanyid',
        currentlyinworkflow: 'currentlyinworkflow',
        hsAllContactVids: 'hs_all_contact_vids',
        hsAnalyticsSource: 'hs_analytics_source',
        linkedinconnections: 'linkedinconnections',
        numContactedNotes: 'num_contacted_notes',
        relationshipStatus: 'relationship_status',
        twitterprofilephoto: 'twitterprofilephoto',
        hsAdditionalEmails: 'hs_additional_emails',
        hsAnalyticsRevenue: 'hs_analytics_revenue',
        notesLastContacted: 'notes_last_contacted',
        numAssociatedDeals: 'num_associated_deals',
        firstConversionDate: 'first_conversion_date',
        hsAnalyticsLastUrl: 'hs_analytics_last_url',
        numConversionEvents: 'num_conversion_events',
        hsAnalyticsFirstUrl: 'hs_analytics_first_url',
        recentConversionDate: 'recent_conversion_date',
        recentDealCloseDate: 'recent_deal_close_date',
        firstDealCreatedDate: 'first_deal_created_date',
        hsAnalyticsNumVisits: 'hs_analytics_num_visits',
        webinareventlastupdated: 'webinareventlastupdated',
        notesNextActivityDate: 'notes_next_activity_date',
        hsAllAccessibleTeamIds: 'hs_all_accessible_team_ids',
        hsAnalyticsLastReferrer: 'hs_analytics_last_referrer',
        hsAnalyticsSourceData1: 'hs_analytics_source_data_1',
        hsAnalyticsSourceData2: 'hs_analytics_source_data_2',
        hubspotOwnerAssigneddate: 'hubspot_owner_assigneddate',
        firstConversionEventName: 'first_conversion_event_name',
        hsAnalyticsFirstReferrer: 'hs_analytics_first_referrer',
        hsAnalyticsLastTimestamp: 'hs_analytics_last_timestamp',
        hsAnalyticsNumPageViews: 'hs_analytics_num_page_views',
        associatedcompanylastupdated: 'associatedcompanylastupdated',
        hsAnalyticsFirstTimestamp: 'hs_analytics_first_timestamp',
        numUniqueConversionEvents: 'num_unique_conversion_events',
        recentConversionEventName: 'recent_conversion_event_name',
        surveymonkeyeventlastupdated: 'surveymonkeyeventlastupdated',
        engagementsLastMeetingBooked: 'engagements_last_meeting_booked',
        hsAnalyticsAveragePageViews: 'hs_analytics_average_page_views',
        hsAllAssignedBusinessUnitIds: 'hs_all_assigned_business_unit_ids',
        hsAnalyticsLastVisitTimestamp: 'hs_analytics_last_visit_timestamp',
        hsAnalyticsFirstVisitTimestamp: 'hs_analytics_first_visit_timestamp',
        hsAnalyticsNumEventCompletions: 'hs_analytics_num_event_completions',
        engagementsLastMeetingBookedMedium: 'engagements_last_meeting_booked_medium',
        engagementsLastMeetingBookedSource: 'engagements_last_meeting_booked_source',
        engagementsLastMeetingBookedCampaign: 'engagements_last_meeting_booked_campaign',
        hsAnalyticsLastTouchConvertingCampaign: 'hs_analytics_last_touch_converting_campaign',
        hsAnalyticsFirstTouchConvertingCampaign: 'hs_analytics_first_touch_converting_campaign',
      }),
    });
  },
});

export const hubspotCreateContactFromNl = tool({
  description:
    'Creates a new contact in HubSpot from a natural language description. Fetches the contact property schema at runtime, uses an LLM to generate the correct property payload, and creates the contact. Parses an email address (and phone) out of the natural-language text with regex heuristics; provide an email in the text.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    nlQuery: z
      .string()
      .describe(
        "Natural language description of the contact to create. Example: 'Add Jane Smith, email jane@test.com, phone +1-555-0100, company Acme Corp'.",
      ),
    associations: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Optional associations to create between the new contact and other CRM objects (e.g., companies, deals). Pass-through field, not LLM-generated.',
      ),
  }),
  execute: async ({ hubspotToken, nlQuery, associations }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    const text = String(nlQuery || '');
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (!emailMatch)
      return {
        error: 'Could not find an email address in nl_query.',
        message: 'Include an email like jane@test.com in the description.',
      };
    const properties = { email: emailMatch[0] };
    const phoneMatch = text.match(/\+?[0-9][0-9\s().-]{6,}[0-9]/);
    if (phoneMatch) properties.phone = phoneMatch[0].trim();
    const nameMatch = text.match(
      /(?:add|create|new contact)\s+([A-Za-z][\w'-]*)\s+([A-Za-z][\w'-]*)/i,
    );
    if (nameMatch) {
      properties.firstname = nameMatch[1];
      properties.lastname = nameMatch[2];
    }
    return hubPost(hubspotToken, '/crm/v3/objects/contacts', {
      body: { properties, ...(associations ? { associations } : {}) },
    });
  },
});

export const hubspotCreateContacts = tool({
  description: 'Creates multiple new HubSpot contacts in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            zip: z.string().optional(),
            city: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            state: z.string().optional(),
            address: z.string().optional(),
            company: z.string().optional(),
            country: z.string().optional(),
            website: z.string().optional(),
            jobtitle: z.string().optional(),
            lastname: z.string().optional(),
            firstname: z.string().optional(),
            associations: z.array(z.record(z.any())).optional(),
            annualrevenue: z.string().optional(),
            lifecyclestage: z.string().optional(),
            custom_properties: z.record(z.any()).optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        'A list of contact objects to create. Each object represents one new contact with its properties and optional associations.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotDeleteContactGdpr = tool({
  description:
    "Irreversibly erases a HubSpot contact and associated data per a GDPR request; if an email is given for a non-existent contact, it's blocklisted. GDPR deletion is permanent and irreversible.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectId: z
      .string()
      .describe(
        "The contact's identifier (email or HubSpot ID, based on `idProperty`) for permanent deletion.",
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        "Identifies how `objectId` should be interpreted: 'email' for email address, or null/omitted for HubSpot contact ID (default).",
      ),
  }),
  execute: async ({ hubspotToken, objectId, idProperty }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/gdpr-delete`, {
      body: pickDefined({ objectId: objectId, idProperty: idProperty }),
    });
  },
});

export const hubspotListContacts = tool({
  description: 'Retrieves a paginated list of HubSpot contacts.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Pagination token from `paging.next.after` of a previous response, used to fetch the subsequent page. Omit for the first page. Empty strings will be treated as None.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of contacts to return per page, controlling pagination size (default: 10).',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Boolean flag to filter contacts by archived status: `true` returns only archived contacts; `false` (default) returns only active (non-archived) contacts.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'List of contact property internal names to include in the response (e.g., "email", "firstname"). If omitted, a default set of properties is returned.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        'List of object types (e.g., "companies", "deals") for which to retrieve associated IDs with each contact.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'List of property internal names for which to retrieve historical values (e.g., "lifecyclestage"). If no history exists for a property, only its current value is returned.',
      ),
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
    return hubGet(hubspotToken, `/crm/v3/objects/contacts`, {
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

export const hubspotMergeContacts = tool({
  description: 'Merges two HubSpot contacts into one.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe(
        'The ID of the contact record that will be merged into the primary contact record. This contact will be deleted after the merge.',
      ),
    primaryObjectId: z
      .string()
      .describe(
        'The ID of the contact record that will remain after the merge and will absorb the information from the contact specified by `objectIdToMerge`. The merged contact will retain this ID.',
      ),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotReadContact = tool({
  description: 'Retrieves a HubSpot contact by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to true to include only archived contacts; defaults to false (active contacts).',
      ),
    contactId: z
      .string()
      .describe(
        'Unique internal HubSpot CRM object ID for the contact, which must be valid and existing.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Contact property names to include in the response; if omitted, all available properties are returned.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Object types (e.g., 'companies', 'deals') to include associated object IDs in the response.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Property names for which to include current and historical values in the response.',
      ),
  }),
  execute: async ({
    hubspotToken,
    archived,
    contactId,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/objects/contacts/${encodeURIComponent(String(contactId))}`,
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

export const hubspotReadContacts = tool({
  description:
    'Batch read multiple HubSpot contacts by their IDs or custom identifier property. This action retrieves up to 100 contacts per request using the HubSpot CRM batch read API. You can specify which contact properties to return and optionally include historical values for properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe(
        'A list of contact identifiers to retrieve. Each object in the list should contain an `id` (or the `idProperty` if specified) of a contact.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Specifies if only archived contacts should be returned (`true`), or only non-archived contacts (`false`).',
      ),
    idProperty: z
      .string()
      .optional()
      .describe(
        'The name of an alternate unique identifier property to use for retrieving contacts. If specified, the `inputs` objects should provide values for this property instead of the default `id`.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Contact property names to include in the response. Optional - a default set is returned if unspecified.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Contact property names for which to retrieve historical values. Optional - omit if history is not needed.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/batch/read`, {
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

export const hubspotSearchContactsByCriteria = tool({
  description:
    'Searches for HubSpot contacts using a text query, specific filter criteria (filters in a group are ANDed, groups are ORed), sorting, and pagination to retrieve selected properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'The cursor token for pagination. Use the `after` value from the `paging.next` object of a previous response to fetch the next set of results. If `None` or an empty string, it fetches the first page.',
      ),
    limit: z.number().int().optional().describe('The maximum number of contacts to return.'),
    query: z
      .string()
      .optional()
      .describe(
        "A string to search across HubSpot's default searchable contact properties ONLY: firstname, lastname, email, phone, hs_additional_emails, hs_object_id, hs_searchable_calculated_phone_number, company. IMPORTANT: This does NOT search custom properties. To search/filter by custom properties (e.g., 'icp_segment', 'lead_source'), use filterGroups with specific property filters instead. At least one of 'query' or 'filterGroups' must be provided.",
      ),
    sorts: z
      .array(
        z
          .object({ direction: z.enum(['ASCENDING', 'DESCENDING']), propertyName: z.string() })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        "A list of sort criteria to apply. Each criterion specifies a contact `propertyName` and a sort `direction`. Example: `[{'propertyName': 'lastname', 'direction': 'ASCENDING'}]` sorts contacts by last name.",
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of contact property internal names to include in the response. Supports both standard properties (firstname, email, etc.) and custom properties. If omitted, a default set is returned.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())) }).catchall(z.any()))
      .optional()
      .describe(
        "A list of filter groups. HubSpot enforces strict limits: maximum 5 filterGroups and maximum 18 total filters across all groups combined. Filters within a group are ANDed. Multiple groups are ORed. Use filterGroups to search/filter by ANY property (including custom properties) with precise operators. At least one of 'query' or 'filterGroups' must be provided. For custom property filtering (e.g., icp_segment='Construction'), use filterGroups instead of query. Example: `[{'filters': [{'propertyName': 'icp_segment', 'operator': 'EQ', 'value': 'Construction'}]}]`. If you need more filter groups or filters, split your search into multiple requests.",
      ),
    customProperties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of internal names for custom contact properties to retrieve (e.g., `custom_lead_score`). This is a convenience alias that gets merged into `properties` before the API call - you can also include custom properties directly in the `properties` field instead.',
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
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after, customProperties }),
    });
  },
});

export const hubspotUpdateContact = tool({
  description: 'Updates properties for an existing HubSpot contact.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    contactId: z
      .string()
      .describe(
        "Unique HubSpot identifier for the contact to be partially updated. Can also be provided as 'contact_id' (snake_case).",
      ),
    properties: z
      .record(z.any())
      .optional()
      .describe('Standard HubSpot contact properties. Use these for common contact fields.'),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        "Custom HubSpot properties to update. Use this for any custom properties you've created in your HubSpot account. Keys must be the internal property names (e.g., 'my_custom_field'). Values must be strings. Use HUBSPOT_LIST_CONTACT_PROPERTIES with custom_only=true to discover available custom property names. These are merged with standard properties before sending to the API.",
      ),
  }),
  execute: async ({ hubspotToken, contactId, properties, customProperties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/crm/v3/objects/contacts/${encodeURIComponent(String(contactId))}`,
      {
        body: { properties: { ...(properties ?? {}), ...(customProperties ?? {}) } },
      },
    );
  },
});

export const hubspotUpdateContacts = tool({
  description: 'Updates multiple HubSpot contacts in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            id: z.string(),
            properties: z.record(z.any()).optional(),
            custom_properties: z.record(z.any()).optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        "List of contact update operations, each specifying contact 'id' (VID) and 'properties' with new values.",
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});

export const hubspotUpsertContacts = tool({
  description: 'Creates or updates as many as 100 HubSpot contacts by unique property value.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            id: z.string(),
            idProperty: z.string(),
            properties: z.record(z.any()),
            objectWriteTraceId: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        "Contacts to upsert. Include between 1 and 100 items. HubSpot does not support partial upserts when an item's idProperty is email.",
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/contacts/batch/upsert`, {
      body: { inputs: inputs },
    });
  },
});
