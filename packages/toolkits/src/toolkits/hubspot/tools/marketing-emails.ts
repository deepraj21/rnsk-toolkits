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

export const hubspotCloneMarketingEmail = tool({
  description:
    'Duplicates an existing HubSpot marketing email, identified by its `id`, into a new draft; an optional `cloneName` can be assigned to this new email copy.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    id: z.string().describe('The unique identifier of the existing marketing email to be cloned.'),
    cloneName: z
      .string()
      .optional()
      .describe(
        "The name for the newly cloned marketing email. If not provided, HubSpot may assign a default name (e.g., 'Copy of [Original Email Name]').",
      ),
  }),
  execute: async ({ hubspotToken, id, cloneName }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/marketing/v3/emails/${encodeURIComponent(String(id))}/clone`, {
      body: pickDefined({ name: cloneName }),
    });
  },
});

export const hubspotCreateAbTestVariation = tool({
  description:
    'Creates a new A/B test variation for an existing HubSpot marketing email, using its `contentId`; the new variation is created as a draft that can be edited before publishing. This action only creates the variation\u2014it does not start the A/B test or send emails. Note: If an active variation already exists for the email, a new one will not be created. Requires Marketing Hub Professional or Enterprise subscription. Best-effort mapping to the HubSpot A/B variation endpoint; requires Marketing Hub Professional or Enterprise.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    contentId: z
      .string()
      .describe('The ID of the original email content to use as a template for the new variation.'),
    variationName: z.string().describe('A unique name for the new A/B test variation.'),
  }),
  execute: async ({ hubspotToken, contentId, variationName }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(contentId))}/ab-test`,
      {
        body: pickDefined({ variationName: variationName }),
      },
    );
  },
});

const hubspotCreateANewMarketingEmailFieldMap: Record<string, string> = {
  name: 'name',
  state: 'state',
  subject: 'subject',
  archived: 'archived',
  campaign: 'campaign',
  language: 'language',
  publishDate: 'publishDate',
  subcategory: 'subcategory',
  activeDomain: 'activeDomain',
  rssDataUrl: 'rssData__url',
  fromReplyTo: 'from__replyTo',
  sendOnPublish: 'sendOnPublish',
  businessUnitId: 'businessUnitId',
  fromFromName: 'from__fromName',
  rssDataTiming: 'rssData__timing',
  testingTestId: 'testing__testId',
  contentWidgets: 'content__widgets',
  feedbackSurveyId: 'feedbackSurveyId',
  webversionSlug: 'webversion__slug',
  testingAbStatus: 'testing__abStatus',
  webversionTitle: 'webversion__title',
  contentFlexAreas: 'content__flexAreas',
  webversionDomain: 'webversion__domain',
  fromCustomReplyTo: 'from__customReplyTo',
  rssDataBlogLayout: 'rssData__blogLayout',
  rssDataMaxEntries: 'rssData__maxEntries',
  contentSmartFields: 'content__smartFields',
  testingHoursToWait: 'testing__hoursToWait',
  toSuppressGraymail: 'to__suppressGraymail',
  contentTemplatePath: 'content__templatePath',
  webversionExpiresAt: 'webversion__expiresAt',
  rssDataBlogEmailType: 'rssData__blogEmailType',
  rssDataHubspotBlogId: 'rssData__hubspotBlogId',
  toLimitSendFrequency: 'to__limitSendFrequency',
  toContactIdsExclude: 'to__contactIds__exclude',
  toContactIdsInclude: 'to__contactIds__include',
  testingAbSuccessMetric: 'testing__abSuccessMetric',
  contentPlainTextVersion: 'content__plainTextVersion',
  contentWidgetContainers: 'content__widgetContainers',
  rssDataRssEntryTemplate: 'rssData__rssEntryTemplate',
  testingAbTestPercentage: 'testing__abTestPercentage',
  toContactListsExclude: 'to__contactLists__exclude',
  toContactListsInclude: 'to__contactLists__include',
  webversionRedirectToUrl: 'webversion__redirectToUrl',
  rssDataBlogImageMaxWidth: 'rssData__blogImageMaxWidth',
  testingAbSamplingDefault: 'testing__abSamplingDefault',
  webversionMetaDescription: 'webversion__metaDescription',
  contentThemeSettingsValues: 'content__themeSettingsValues',
  testingAbSampleSizeDefault: 'testing__abSampleSizeDefault',
  webversionRedirectToPageId: 'webversion__redirectToPageId',
  rssDataUseHeadlineAsSubject: 'rssData__useHeadlineAsSubject',
  subscriptionDetailsSubscriptionId: 'subscriptionDetails__subscriptionId',
  subscriptionDetailsOfficeLocationId: 'subscriptionDetails__officeLocationId',
  subscriptionDetailsPreferencesGroupId: 'subscriptionDetails__preferencesGroupId',
};
export const hubspotCreateANewMarketingEmail = tool({
  description:
    'Creates a new marketing email in HubSpot, allowing comprehensive configuration of content, recipients, sender details, A/B testing, scheduling, web version, and other settings; the internal `name` for the email is required. Double-underscore fields (from__fromName) are nested into HubSpot objects (from.fromName).',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .describe('Internal name of the email, as displayed on the HubSpot email dashboard.'),
    state: z
      .enum([
        'AUTOMATED',
        'AUTOMATED_DRAFT',
        'AUTOMATED_SENDING',
        'AUTOMATED_FOR_FORM',
        'AUTOMATED_FOR_FORM_BUFFER',
        'AUTOMATED_FOR_FORM_DRAFT',
        'AUTOMATED_FOR_FORM_LEGACY',
        'BLOG_EMAIL_DRAFT',
        'BLOG_EMAIL_PUBLISHED',
        'DRAFT',
        'DRAFT_AB',
        'DRAFT_AB_VARIANT',
        'ERROR',
        'LOSER_AB_VARIANT',
        'PAGE_STUB',
        'PRE_PROCESSING',
        'PROCESSING',
        'PUBLISHED',
        'PUBLISHED_AB',
        'PUBLISHED_AB_VARIANT',
        'PUBLISHED_OR_SCHEDULED',
        'RSS_TO_EMAIL_DRAFT',
        'RSS_TO_EMAIL_PUBLISHED',
        'SCHEDULED',
        'SCHEDULED_AB',
        'SCHEDULED_OR_PUBLISHED',
        'AUTOMATED_AB',
        'AUTOMATED_AB_VARIANT',
        'AUTOMATED_DRAFT_AB',
        'AUTOMATED_DRAFT_ABVARIANT',
        'AUTOMATED_LOSER_ABVARIANT',
      ])
      .optional()
      .describe('Current state of the email (e.g., DRAFT, SCHEDULED, PUBLISHED).'),
    subject: z.string().optional().describe('The subject line of the marketing email.'),
    archived: z
      .boolean()
      .optional()
      .describe('True if the email is archived (typically hidden from main dashboard view).'),
    campaign: z
      .string()
      .optional()
      .describe('ID (GUID) of the associated HubSpot campaign for tracking/reporting.'),
    language: z
      .enum([
        'af',
        'af-na',
        'af-za',
        'agq',
        'agq-cm',
        'ak',
        'ak-gh',
        'am',
        'am-et',
        'ar',
        'ar-001',
        'ar-ae',
        'ar-bh',
        'ar-dj',
        'ar-dz',
        'ar-eg',
        'ar-eh',
        'ar-er',
        'ar-il',
        'ar-iq',
        'ar-jo',
        'ar-km',
        'ar-kw',
        'ar-lb',
        'ar-ly',
        'ar-ma',
        'ar-mr',
        'ar-om',
        'ar-ps',
        'ar-qa',
        'ar-sa',
        'ar-sd',
        'ar-so',
        'ar-ss',
        'ar-sy',
        'ar-td',
        'ar-tn',
        'ar-ye',
        'as',
        'as-in',
        'asa',
        'asa-tz',
        'ast',
        'ast-es',
        'az',
        'az-az',
        'bas',
        'bas-cm',
        'be',
        'be-by',
        'bem',
        'bem-zm',
        'bez',
        'bez-tz',
        'bg',
        'bg-bg',
        'bm',
        'bm-ml',
        'bn',
        'bn-bd',
        'bn-in',
        'bo',
        'bo-cn',
        'bo-in',
        'br',
        'br-fr',
        'brx',
        'brx-in',
        'bs',
        'bs-ba',
        'ca',
        'ca-ad',
        'ca-es',
        'ca-fr',
        'ca-it',
        'ccp',
        'ccp-bd',
        'ccp-in',
        'ce',
        'ce-ru',
        'ceb',
        'ceb-ph',
        'cgg',
        'cgg-ug',
        'chr',
        'chr-us',
        'ckb',
        'ckb-iq',
        'ckb-ir',
        'cs',
        'cs-cz',
        'cu',
        'cu-ru',
        'cy',
        'cy-gb',
        'da',
        'da-dk',
        'da-gl',
        'dav',
        'dav-ke',
        'de',
        'de-at',
        'de-be',
        'de-ch',
        'de-de',
        'de-gr',
        'de-it',
        'de-li',
        'de-lu',
        'dje',
        'dje-ne',
        'doi',
        'doi-in',
        'dsb',
        'dsb-de',
        'dua',
        'dua-cm',
        'dyo',
        'dyo-sn',
        'dz',
        'dz-bt',
        'ebu',
        'ebu-ke',
        'ee',
        'ee-gh',
        'ee-tg',
        'el',
        'el-cy',
        'el-gr',
        'en',
        'en-001',
        'en-150',
        'en-ae',
        'en-ag',
        'en-ai',
        'en-as',
        'en-at',
        'en-au',
        'en-bb',
        'en-be',
        'en-bi',
        'en-bm',
        'en-bs',
        'en-bw',
        'en-bz',
        'en-ca',
        'en-cc',
        'en-ch',
        'en-ck',
        'en-cm',
        'en-cn',
        'en-cx',
        'en-cy',
        'en-de',
        'en-dg',
        'en-dk',
        'en-dm',
        'en-er',
        'en-fi',
        'en-fj',
        'en-fk',
        'en-fm',
        'en-gb',
        'en-gd',
        'en-gg',
        'en-gh',
        'en-gi',
        'en-gm',
        'en-gu',
        'en-gy',
        'en-hk',
        'en-ie',
        'en-il',
        'en-im',
        'en-in',
        'en-io',
        'en-je',
        'en-jm',
        'en-ke',
        'en-ki',
        'en-kn',
        'en-ky',
        'en-lc',
        'en-lr',
        'en-ls',
        'en-lu',
        'en-mg',
        'en-mh',
        'en-mo',
        'en-mp',
        'en-ms',
        'en-mt',
        'en-mu',
        'en-mw',
        'en-mx',
        'en-my',
        'en-na',
        'en-nf',
        'en-ng',
        'en-nl',
        'en-nr',
        'en-nu',
        'en-nz',
        'en-pg',
        'en-ph',
        'en-pk',
        'en-pn',
        'en-pr',
        'en-pw',
        'en-rw',
        'en-sb',
        'en-sc',
        'en-sd',
        'en-se',
        'en-sg',
        'en-sh',
        'en-si',
        'en-sl',
        'en-ss',
        'en-sx',
        'en-sz',
        'en-tc',
        'en-tk',
        'en-to',
        'en-tt',
        'en-tv',
        'en-tz',
        'en-ug',
        'en-um',
        'en-us',
        'en-vc',
        'en-vg',
        'en-vi',
        'en-vu',
        'en-ws',
        'en-za',
        'en-zm',
        'en-zw',
        'eo',
        'eo-001',
        'es',
        'es-419',
        'es-ar',
        'es-bo',
        'es-br',
        'es-bz',
        'es-cl',
        'es-co',
        'es-cr',
        'es-cu',
        'es-do',
        'es-ea',
        'es-ec',
        'es-es',
        'es-gq',
        'es-gt',
        'es-hn',
        'es-ic',
        'es-mx',
        'es-ni',
        'es-pa',
        'es-pe',
        'es-ph',
        'es-pr',
        'es-py',
        'es-sv',
        'es-us',
        'es-uy',
        'es-ve',
        'et',
        'et-ee',
        'eu',
        'eu-es',
        'ewo',
        'ewo-cm',
        'fa',
        'fa-af',
        'fa-ir',
        'ff',
        'ff-bf',
        'ff-cm',
        'ff-gh',
        'ff-gm',
        'ff-gn',
        'ff-gw',
        'ff-lr',
        'ff-mr',
        'ff-ne',
        'ff-ng',
        'ff-sl',
        'ff-sn',
        'fi',
        'fi-fi',
        'fil',
        'fil-ph',
        'fo',
        'fo-dk',
        'fo-fo',
        'fr',
        'fr-be',
        'fr-bf',
        'fr-bi',
        'fr-bj',
        'fr-bl',
        'fr-ca',
        'fr-cd',
        'fr-cf',
        'fr-cg',
        'fr-ch',
        'fr-ci',
        'fr-cm',
        'fr-dj',
        'fr-dz',
        'fr-fr',
        'fr-ga',
        'fr-gf',
        'fr-gn',
        'fr-gp',
        'fr-gq',
        'fr-ht',
        'fr-km',
        'fr-lu',
        'fr-ma',
        'fr-mc',
        'fr-mf',
        'fr-mg',
        'fr-ml',
        'fr-mq',
        'fr-mr',
        'fr-mu',
        'fr-nc',
        'fr-ne',
        'fr-pf',
        'fr-pm',
        'fr-re',
        'fr-rw',
        'fr-sc',
        'fr-sn',
        'fr-sy',
        'fr-td',
        'fr-tg',
        'fr-tn',
        'fr-vu',
        'fr-wf',
        'fr-yt',
        'fur',
        'fur-it',
        'fy',
        'fy-nl',
        'ga',
        'ga-gb',
        'ga-ie',
        'gd',
        'gd-gb',
        'gl',
        'gl-es',
        'gsw',
        'gsw-ch',
        'gsw-fr',
        'gsw-li',
        'gu',
        'gu-in',
        'guz',
        'guz-ke',
        'gv',
        'gv-im',
        'ha',
        'ha-gh',
        'ha-ne',
        'ha-ng',
        'haw',
        'haw-us',
        'he',
        'hi',
        'hi-in',
        'hr',
        'hr-ba',
        'hr-hr',
        'hsb',
        'hsb-de',
        'hu',
        'hu-hu',
        'hy',
        'hy-am',
        'ia',
        'ia-001',
        'id',
        'ig',
        'ig-ng',
        'ii',
        'ii-cn',
        'id-id',
        'is',
        'is-is',
        'it',
        'it-ch',
        'it-it',
        'it-sm',
        'it-va',
        'he-il',
        'ja',
        'ja-jp',
        'jgo',
        'jgo-cm',
        'yi',
        'yi-001',
        'jmc',
        'jmc-tz',
        'jv',
        'jv-id',
        'ka',
        'ka-ge',
        'kab',
        'kab-dz',
        'kam',
        'kam-ke',
        'kde',
        'kde-tz',
        'kea',
        'kea-cv',
        'khq',
        'khq-ml',
        'ki',
        'ki-ke',
        'kk',
        'kk-kz',
        'kkj',
        'kkj-cm',
        'kl',
        'kl-gl',
        'kln',
        'kln-ke',
        'km',
        'km-kh',
        'kn',
        'kn-in',
        'ko',
        'ko-kp',
        'ko-kr',
        'kok',
        'kok-in',
        'ks',
        'ks-in',
        'ksb',
        'ksb-tz',
        'ksf',
        'ksf-cm',
        'ksh',
        'ksh-de',
        'kw',
        'kw-gb',
        'ku',
        'ku-tr',
        'ky',
        'ky-kg',
        'lag',
        'lag-tz',
        'lb',
        'lb-lu',
        'lg',
        'lg-ug',
        'lkt',
        'lkt-us',
        'ln',
        'ln-ao',
        'ln-cd',
        'ln-cf',
        'ln-cg',
        'lo',
        'lo-la',
        'lrc',
        'lrc-iq',
        'lrc-ir',
        'lt',
        'lt-lt',
        'lu',
        'lu-cd',
        'luo',
        'luo-ke',
        'luy',
        'luy-ke',
        'lv',
        'lv-lv',
        'mai',
        'mai-in',
        'mas',
        'mas-ke',
        'mas-tz',
        'mer',
        'mer-ke',
        'mfe',
        'mfe-mu',
        'mg',
        'mg-mg',
        'mgh',
        'mgh-mz',
        'mgo',
        'mgo-cm',
        'mi',
        'mi-nz',
        'mk',
        'mk-mk',
        'ml',
        'ml-in',
        'mn',
        'mn-mn',
        'mni',
        'mni-in',
        'mr',
        'mr-in',
        'ms',
        'ms-bn',
        'ms-id',
        'ms-my',
        'ms-sg',
        'mt',
        'mt-mt',
        'mua',
        'mua-cm',
        'my',
        'my-mm',
        'mzn',
        'mzn-ir',
        'naq',
        'naq-na',
        'nb',
        'nb-no',
        'nb-sj',
        'nd',
        'nd-zw',
        'nds',
        'nds-de',
        'nds-nl',
        'ne',
        'ne-in',
        'ne-np',
        'nl',
        'nl-aw',
        'nl-be',
        'nl-ch',
        'nl-bq',
        'nl-cw',
        'nl-lu',
        'nl-nl',
        'nl-sr',
        'nl-sx',
        'nmg',
        'nmg-cm',
        'nn',
        'nn-no',
        'nnh',
        'nnh-cm',
        'no',
        'no-no',
        'nus',
        'nus-ss',
        'nyn',
        'nyn-ug',
        'om',
        'om-et',
        'om-ke',
        'or',
        'or-in',
        'os',
        'os-ge',
        'os-ru',
        'pa',
        'pa-in',
        'pa-pk',
        'pcm',
        'pcm-ng',
        'pl',
        'pl-pl',
        'prg',
        'prg-001',
        'ps',
        'ps-af',
        'ps-pk',
        'pt',
        'pt-ao',
        'pt-br',
        'pt-ch',
        'pt-cv',
        'pt-gq',
        'pt-gw',
        'pt-lu',
        'pt-mo',
        'pt-mz',
        'pt-pt',
        'pt-st',
        'pt-tl',
        'qu',
        'qu-bo',
        'qu-ec',
        'qu-pe',
        'rm',
        'rm-ch',
        'rn',
        'rn-bi',
        'ro',
        'ro-md',
        'ro-ro',
        'rof',
        'rof-tz',
        'ru',
        'ru-by',
        'ru-kg',
        'ru-kz',
        'ru-md',
        'ru-ru',
        'ru-ua',
        'rw',
        'rw-rw',
        'rwk',
        'rwk-tz',
        'sa',
        'sa-in',
        'sah',
        'sah-ru',
        'saq',
        'saq-ke',
        'sat',
        'sat-in',
        'sbp',
        'sbp-tz',
        'sd',
        'sd-in',
        'sd-pk',
        'se',
        'se-fi',
        'se-no',
        'se-se',
        'seh',
        'seh-mz',
        'ses',
        'ses-ml',
        'sg',
        'sg-cf',
        'shi',
        'shi-ma',
        'si',
        'si-lk',
        'sk',
        'sk-sk',
        'sl',
        'sl-si',
        'smn',
        'smn-fi',
        'sn',
        'sn-zw',
        'so',
        'so-dj',
        'so-et',
        'so-ke',
        'so-so',
        'sq',
        'sq-al',
        'sq-mk',
        'sq-xk',
        'sr',
        'sr-ba',
        'sr-cs',
        'sr-me',
        'sr-rs',
        'sr-xk',
        'su',
        'su-id',
        'sv',
        'sv-ax',
        'sv-fi',
        'sv-se',
        'sw',
        'sw-cd',
        'sw-ke',
        'sw-tz',
        'sw-ug',
        'sy',
        'ta',
        'ta-in',
        'ta-lk',
        'ta-my',
        'ta-sg',
        'te',
        'te-in',
        'teo',
        'teo-ke',
        'teo-ug',
        'tg',
        'tg-tj',
        'th',
        'th-th',
        'ti',
        'ti-er',
        'ti-et',
        'tk',
        'tk-tm',
        'tl',
        'to',
        'to-to',
        'tr',
        'tr-cy',
        'tr-tr',
        'tt',
        'tt-ru',
        'twq',
        'twq-ne',
        'tzm',
        'tzm-ma',
        'ug',
        'ug-cn',
        'uk',
        'uk-ua',
        'ur',
        'ur-in',
        'ur-pk',
        'uz',
        'uz-af',
        'uz-uz',
        'vai',
        'vai-lr',
        'vi',
        'vi-vn',
        'vo',
        'vo-001',
        'vun',
        'vun-tz',
        'wae',
        'wae-ch',
        'wo',
        'wo-sn',
        'xh',
        'xh-za',
        'xog',
        'xog-ug',
        'yav',
        'yav-cm',
        'yo',
        'yo-bj',
        'yo-ng',
        'yue',
        'yue-cn',
        'yue-hk',
        'zgh',
        'zgh-ma',
        'zh',
        'zh-cn',
        'zh-hk',
        'zh-mo',
        'zh-sg',
        'zh-tw',
        'zh-hans',
        'zh-hant',
        'zu',
        'zu-za',
      ])
      .optional()
      .describe('Primary language of the email content.'),
    publishDate: z
      .string()
      .optional()
      .describe('Scheduled ISO 8601 date-time for email publication or sending.'),
    subcategory: z
      .string()
      .optional()
      .describe(
        "Email subcategory for internal organization or specific types (e.g., 'newsletter').",
      ),
    activeDomain: z
      .string()
      .optional()
      .describe(
        'Domain for sending the email; must be a connected and verified HubSpot sending domain.',
      ),
    rssDataUrl: z
      .string()
      .optional()
      .describe(
        'URL of the RSS feed for email content. Must be valid and accessible if using RSS features.',
      ),
    fromReplyTo: z
      .string()
      .optional()
      .describe("Primary 'From' and reply-to email address, unless `from__customReplyTo` is used."),
    sendOnPublish: z
      .boolean()
      .optional()
      .describe(
        'True to send email immediately on publish; false to publish without sending until triggered/scheduled.',
      ),
    businessUnitId: z
      .string()
      .optional()
      .describe('The ID of the business unit this email is associated with, if applicable.'),
    fromFromName: z
      .string()
      .optional()
      .describe("Sender name appearing in the 'From' field of the received email."),
    rssDataTiming: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary specifying the timing and scheduling details for sending RSS emails. Each key must map to a dictionary/object value, not a simple string. Example: {"dayOfWeek": {"value": "Tuesday"}, "time": {"hour": 9, "minute": 0}}.',
      ),
    testingTestId: z
      .string()
      .optional()
      .describe('The unique identifier for the A/B test associated with this email.'),
    contentWidgets: z
      .record(z.any())
      .optional()
      .describe(
        'Dictionary of widgets (e.g., text, images, CTAs) and their configurations for email content. Each key must map to a dictionary/object value, not a simple string. Example: {"widgetId": {"type": "text", "content": "Hello", "style": {...}}}.',
      ),
    feedbackSurveyId: z
      .string()
      .optional()
      .describe('The ID of the feedback survey linked to the email.'),
    webversionSlug: z
      .string()
      .optional()
      .describe("Custom URL slug for the email's web version (e.g., 'july-newsletter')."),
    testingAbStatus: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe('Current A/B test status for this email (e.g., master, variant).'),
    webversionTitle: z
      .string()
      .optional()
      .describe("Browser tab title for the email's web version."),
    contentFlexAreas: z
      .record(z.any())
      .optional()
      .describe(
        'Dictionary defining content and layout of flexible, customizable areas in the email template. Each key must map to a dictionary/object value, not a simple string. Example: {"areaName": {"content": {...}, "layout": {...}}}.',
      ),
    webversionDomain: z
      .string()
      .optional()
      .describe("Domain for the email's web version; defaults to HubSpot domain if unspecified."),
    fromCustomReplyTo: z
      .string()
      .optional()
      .describe("Custom reply-to email address, overrides main 'Reply To' if set."),
    rssDataBlogLayout: z
      .string()
      .optional()
      .describe('Specifies the layout to be used for the blog RSS email.'),
    rssDataMaxEntries: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of blog posts (RSS entries) to include in a single RSS email.'),
    contentSmartFields: z
      .record(z.any())
      .optional()
      .describe(
        'Dictionary of smart fields for email personalization based on contact properties. Each key must map to a dictionary/object value, not a simple string. Example: {"fieldName": {"value": "defaultValue", "conditions": {...}}}.',
      ),
    testingHoursToWait: z
      .number()
      .int()
      .optional()
      .describe(
        'Hours to wait for A/B test results before sending the winning version to remaining recipients.',
      ),
    toSuppressGraymail: z
      .boolean()
      .optional()
      .describe(
        "True to not send to contacts identified by HubSpot as 'graymail' (low engagement).",
      ),
    contentTemplatePath: z
      .string()
      .optional()
      .describe('Path to the email template in HubSpot Design Manager.'),
    webversionExpiresAt: z
      .string()
      .optional()
      .describe('ISO 8601 date-time when the web version expires and becomes inaccessible.'),
    rssDataBlogEmailType: z
      .string()
      .optional()
      .describe(
        'The type of blog email, which determines send frequency (e.g., instant, daily, weekly).',
      ),
    rssDataHubspotBlogId: z
      .string()
      .optional()
      .describe('The ID of the HubSpot blog to be used for the RSS email.'),
    toLimitSendFrequency: z
      .boolean()
      .optional()
      .describe("True to apply HubSpot's send frequency limits, preventing over-mailing."),
    toContactIdsExclude: z
      .array(z.string())
      .optional()
      .describe('List of specific contact IDs to explicitly exclude, even if in included lists.'),
    toContactIdsInclude: z
      .array(z.string())
      .optional()
      .describe('List of specific contact IDs to include as recipients.'),
    testingAbSuccessMetric: z
      .enum(['CLICKS_BY_OPENS', 'CLICKS_BY_DELIVERED', 'OPENS_BY_DELIVERED'])
      .optional()
      .describe('Metric (e.g., CLICKS_BY_OPENS) to determine the A/B test winning version.'),
    contentPlainTextVersion: z
      .string()
      .optional()
      .describe('Plain text version of the email, for non-HTML clients or recipient preference.'),
    contentWidgetContainers: z
      .record(z.any())
      .optional()
      .describe(
        'Dictionary of widget containers for grouping and managing widgets in the email template. Each key must map to a dictionary/object value, not a simple string. Example: {"containerId": {"widgets": [...], "layout": {...}}}.',
      ),
    rssDataRssEntryTemplate: z
      .string()
      .optional()
      .describe('The HTML template for formatting each individual RSS entry within the email.'),
    testingAbTestPercentage: z
      .number()
      .int()
      .optional()
      .describe('Percentage of recipients in the A/B test group (e.g., 20 for 20%).'),
    toContactListsExclude: z
      .array(z.string())
      .optional()
      .describe(
        "List of contact list IDs whose members to explicitly exclude. HubSpot contact list IDs are typically numeric strings (e.g., '12345', '67890'). Provide the numeric ID as a string.",
      ),
    toContactListsInclude: z
      .array(z.string())
      .optional()
      .describe(
        "List of contact list IDs whose members to include as recipients. HubSpot contact list IDs are typically numeric strings (e.g., '12345', '67890'). Provide the numeric ID as a string.",
      ),
    webversionRedirectToUrl: z
      .string()
      .optional()
      .describe('Custom URL for redirect if web version link is expired/deactivated.'),
    rssDataBlogImageMaxWidth: z
      .number()
      .int()
      .optional()
      .describe('The maximum width for images included from the blog feed in the RSS email.'),
    testingAbSamplingDefault: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe(
        'Default email version (master/variant) if A/B test is inconclusive after the test period.',
      ),
    webversionMetaDescription: z
      .string()
      .optional()
      .describe('Meta description for the web version, used by search engines.'),
    contentThemeSettingsValues: z
      .record(z.any())
      .optional()
      .describe(
        'Dictionary of theme settings values to customize email appearance. Each key must map to a dictionary/object value, not a simple string. Example: {"brandColor": {"value": "#0055CC"}, "fontFamily": {"name": "Arial"}}.',
      ),
    testingAbSampleSizeDefault: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe(
        'Default email version (master/variant) if A/B test sample size is too small for significance.',
      ),
    webversionRedirectToPageId: z
      .string()
      .optional()
      .describe('ID of a HubSpot page for redirect if web version link is expired/deactivated.'),
    rssDataUseHeadlineAsSubject: z
      .boolean()
      .optional()
      .describe(
        'If true, the email subject will be automatically populated from the blog post headline for RSS emails.',
      ),
    subscriptionDetailsSubscriptionId: z
      .string()
      .optional()
      .describe('ID of the specific subscription type (e.g., newsletter, product updates).'),
    subscriptionDetailsOfficeLocationId: z
      .string()
      .optional()
      .describe('ID of the office location for CAN-SPAM compliance and personalization.'),
    subscriptionDetailsPreferencesGroupId: z
      .string()
      .optional()
      .describe('ID of the subscription preferences group for managing recipient preferences.'),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/marketing/v3/emails/`, {
      body: unflattenDeep(
        mapKeys(
          pickDefined(stripKeys(input, ['hubspotToken'])),
          hubspotCreateANewMarketingEmailFieldMap,
        ),
      ),
    });
  },
});

const hubspotCreateOrUpdateDraftVersionFieldMap: Record<string, string> = {
  name: 'name',
  state: 'state',
  subject: 'subject',
  archived: 'archived',
  campaign: 'campaign',
  language: 'language',
  publishDate: 'publishDate',
  subcategory: 'subcategory',
  activeDomain: 'activeDomain',
  rssDataUrl: 'rssData__url',
  fromReplyTo: 'from__replyTo',
  sendOnPublish: 'sendOnPublish',
  businessUnitId: 'businessUnitId',
  fromFromName: 'from__fromName',
  rssDataTiming: 'rssData__timing',
  testingTestId: 'testing__testId',
  contentWidgets: 'content__widgets',
  webversionSlug: 'webversion__slug',
  testingAbStatus: 'testing__abStatus',
  webversionTitle: 'webversion__title',
  contentFlexAreas: 'content__flexAreas',
  webversionDomain: 'webversion__domain',
  fromCustomReplyTo: 'from__customReplyTo',
  rssDataBlogLayout: 'rssData__blogLayout',
  rssDataMaxEntries: 'rssData__maxEntries',
  contentSmartFields: 'content__smartFields',
  testingHoursToWait: 'testing__hoursToWait',
  toSuppressGraymail: 'to__suppressGraymail',
  contentTemplatePath: 'content__templatePath',
  webversionExpiresAt: 'webversion__expiresAt',
  rssDataBlogEmailType: 'rssData__blogEmailType',
  rssDataHubspotBlogId: 'rssData__hubspotBlogId',
  toLimitSendFrequency: 'to__limitSendFrequency',
  toContactIdsExclude: 'to__contactIds__exclude',
  toContactIdsInclude: 'to__contactIds__include',
  testingAbSuccessMetric: 'testing__abSuccessMetric',
  contentPlainTextVersion: 'content__plainTextVersion',
  contentWidgetContainers: 'content__widgetContainers',
  rssDataRssEntryTemplate: 'rssData__rssEntryTemplate',
  testingAbTestPercentage: 'testing__abTestPercentage',
  toContactListsExclude: 'to__contactLists__exclude',
  toContactListsInclude: 'to__contactLists__include',
  webversionRedirectToUrl: 'webversion__redirectToUrl',
  rssDataBlogImageMaxWidth: 'rssData__blogImageMaxWidth',
  testingAbSamplingDefault: 'testing__abSamplingDefault',
  webversionMetaDescription: 'webversion__metaDescription',
  contentThemeSettingsValues: 'content__themeSettingsValues',
  testingAbSampleSizeDefault: 'testing__abSampleSizeDefault',
  webversionRedirectToPageId: 'webversion__redirectToPageId',
  rssDataUseHeadlineAsSubject: 'rssData__useHeadlineAsSubject',
  subscriptionDetailsSubscriptionId: 'subscriptionDetails__subscriptionId',
  subscriptionDetailsOfficeLocationId: 'subscriptionDetails__officeLocationId',
  subscriptionDetailsPreferencesGroupId: 'subscriptionDetails__preferencesGroupId',
};
export const hubspotCreateOrUpdateDraftVersion = tool({
  description:
    'Creates or updates the draft version of a marketing email identified by `emailId`; if no draft exists, a new one is created from the current live version to prepare changes or A/B tests before publishing.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z.string().optional().describe('Internal name of the email for HubSpot dashboard.'),
    state: z
      .enum([
        'AUTOMATED',
        'AUTOMATED_DRAFT',
        'AUTOMATED_SENDING',
        'AUTOMATED_FOR_FORM',
        'AUTOMATED_FOR_FORM_BUFFER',
        'AUTOMATED_FOR_FORM_DRAFT',
        'AUTOMATED_FOR_FORM_LEGACY',
        'BLOG_EMAIL_DRAFT',
        'BLOG_EMAIL_PUBLISHED',
        'DRAFT',
        'DRAFT_AB',
        'DRAFT_AB_VARIANT',
        'ERROR',
        'LOSER_AB_VARIANT',
        'PAGE_STUB',
        'PRE_PROCESSING',
        'PROCESSING',
        'PUBLISHED',
        'PUBLISHED_AB',
        'PUBLISHED_AB_VARIANT',
        'PUBLISHED_OR_SCHEDULED',
        'RSS_TO_EMAIL_DRAFT',
        'RSS_TO_EMAIL_PUBLISHED',
        'SCHEDULED',
        'SCHEDULED_AB',
        'SCHEDULED_OR_PUBLISHED',
        'AUTOMATED_AB',
        'AUTOMATED_AB_VARIANT',
        'AUTOMATED_DRAFT_AB',
        'AUTOMATED_DRAFT_ABVARIANT',
        'AUTOMATED_LOSER_ABVARIANT',
      ])
      .optional()
      .describe("Current state of the email (e.g., 'DRAFT'); typically system-managed."),
    emailId: z.string().describe('The unique identifier of the marketing email.'),
    subject: z.string().optional().describe('The subject line of the email.'),
    archived: z.boolean().optional().describe('Indicates if the marketing email is archived.'),
    campaign: z
      .string()
      .optional()
      .describe('Associated HubSpot campaign ID for tracking/reporting.'),
    language: z
      .enum([
        'af',
        'af-na',
        'af-za',
        'agq',
        'agq-cm',
        'ak',
        'ak-gh',
        'am',
        'am-et',
        'ar',
        'ar-001',
        'ar-ae',
        'ar-bh',
        'ar-dj',
        'ar-dz',
        'ar-eg',
        'ar-eh',
        'ar-er',
        'ar-il',
        'ar-iq',
        'ar-jo',
        'ar-km',
        'ar-kw',
        'ar-lb',
        'ar-ly',
        'ar-ma',
        'ar-mr',
        'ar-om',
        'ar-ps',
        'ar-qa',
        'ar-sa',
        'ar-sd',
        'ar-so',
        'ar-ss',
        'ar-sy',
        'ar-td',
        'ar-tn',
        'ar-ye',
        'as',
        'as-in',
        'asa',
        'asa-tz',
        'ast',
        'ast-es',
        'az',
        'az-az',
        'bas',
        'bas-cm',
        'be',
        'be-by',
        'bem',
        'bem-zm',
        'bez',
        'bez-tz',
        'bg',
        'bg-bg',
        'bm',
        'bm-ml',
        'bn',
        'bn-bd',
        'bn-in',
        'bo',
        'bo-cn',
        'bo-in',
        'br',
        'br-fr',
        'brx',
        'brx-in',
        'bs',
        'bs-ba',
        'ca',
        'ca-ad',
        'ca-es',
        'ca-fr',
        'ca-it',
        'ccp',
        'ccp-bd',
        'ccp-in',
        'ce',
        'ce-ru',
        'ceb',
        'ceb-ph',
        'cgg',
        'cgg-ug',
        'chr',
        'chr-us',
        'ckb',
        'ckb-iq',
        'ckb-ir',
        'cs',
        'cs-cz',
        'cu',
        'cu-ru',
        'cy',
        'cy-gb',
        'da',
        'da-dk',
        'da-gl',
        'dav',
        'dav-ke',
        'de',
        'de-at',
        'de-be',
        'de-ch',
        'de-de',
        'de-gr',
        'de-it',
        'de-li',
        'de-lu',
        'dje',
        'dje-ne',
        'doi',
        'doi-in',
        'dsb',
        'dsb-de',
        'dua',
        'dua-cm',
        'dyo',
        'dyo-sn',
        'dz',
        'dz-bt',
        'ebu',
        'ebu-ke',
        'ee',
        'ee-gh',
        'ee-tg',
        'el',
        'el-cy',
        'el-gr',
        'en',
        'en-001',
        'en-150',
        'en-ae',
        'en-ag',
        'en-ai',
        'en-as',
        'en-at',
        'en-au',
        'en-bb',
        'en-be',
        'en-bi',
        'en-bm',
        'en-bs',
        'en-bw',
        'en-bz',
        'en-ca',
        'en-cc',
        'en-ch',
        'en-ck',
        'en-cm',
        'en-cn',
        'en-cx',
        'en-cy',
        'en-de',
        'en-dg',
        'en-dk',
        'en-dm',
        'en-er',
        'en-fi',
        'en-fj',
        'en-fk',
        'en-fm',
        'en-gb',
        'en-gd',
        'en-gg',
        'en-gh',
        'en-gi',
        'en-gm',
        'en-gu',
        'en-gy',
        'en-hk',
        'en-ie',
        'en-il',
        'en-im',
        'en-in',
        'en-io',
        'en-je',
        'en-jm',
        'en-ke',
        'en-ki',
        'en-kn',
        'en-ky',
        'en-lc',
        'en-lr',
        'en-ls',
        'en-lu',
        'en-mg',
        'en-mh',
        'en-mo',
        'en-mp',
        'en-ms',
        'en-mt',
        'en-mu',
        'en-mw',
        'en-mx',
        'en-my',
        'en-na',
        'en-nf',
        'en-ng',
        'en-nl',
        'en-nr',
        'en-nu',
        'en-nz',
        'en-pg',
        'en-ph',
        'en-pk',
        'en-pn',
        'en-pr',
        'en-pw',
        'en-rw',
        'en-sb',
        'en-sc',
        'en-sd',
        'en-se',
        'en-sg',
        'en-sh',
        'en-si',
        'en-sl',
        'en-ss',
        'en-sx',
        'en-sz',
        'en-tc',
        'en-tk',
        'en-to',
        'en-tt',
        'en-tv',
        'en-tz',
        'en-ug',
        'en-um',
        'en-us',
        'en-vc',
        'en-vg',
        'en-vi',
        'en-vu',
        'en-ws',
        'en-za',
        'en-zm',
        'en-zw',
        'eo',
        'eo-001',
        'es',
        'es-419',
        'es-ar',
        'es-bo',
        'es-br',
        'es-bz',
        'es-cl',
        'es-co',
        'es-cr',
        'es-cu',
        'es-do',
        'es-ea',
        'es-ec',
        'es-es',
        'es-gq',
        'es-gt',
        'es-hn',
        'es-ic',
        'es-mx',
        'es-ni',
        'es-pa',
        'es-pe',
        'es-ph',
        'es-pr',
        'es-py',
        'es-sv',
        'es-us',
        'es-uy',
        'es-ve',
        'et',
        'et-ee',
        'eu',
        'eu-es',
        'ewo',
        'ewo-cm',
        'fa',
        'fa-af',
        'fa-ir',
        'ff',
        'ff-bf',
        'ff-cm',
        'ff-gh',
        'ff-gm',
        'ff-gn',
        'ff-gw',
        'ff-lr',
        'ff-mr',
        'ff-ne',
        'ff-ng',
        'ff-sl',
        'ff-sn',
        'fi',
        'fi-fi',
        'fil',
        'fil-ph',
        'fo',
        'fo-dk',
        'fo-fo',
        'fr',
        'fr-be',
        'fr-bf',
        'fr-bi',
        'fr-bj',
        'fr-bl',
        'fr-ca',
        'fr-cd',
        'fr-cf',
        'fr-cg',
        'fr-ch',
        'fr-ci',
        'fr-cm',
        'fr-dj',
        'fr-dz',
        'fr-fr',
        'fr-ga',
        'fr-gf',
        'fr-gn',
        'fr-gp',
        'fr-gq',
        'fr-ht',
        'fr-km',
        'fr-lu',
        'fr-ma',
        'fr-mc',
        'fr-mf',
        'fr-mg',
        'fr-ml',
        'fr-mq',
        'fr-mr',
        'fr-mu',
        'fr-nc',
        'fr-ne',
        'fr-pf',
        'fr-pm',
        'fr-re',
        'fr-rw',
        'fr-sc',
        'fr-sn',
        'fr-sy',
        'fr-td',
        'fr-tg',
        'fr-tn',
        'fr-vu',
        'fr-wf',
        'fr-yt',
        'fur',
        'fur-it',
        'fy',
        'fy-nl',
        'ga',
        'ga-gb',
        'ga-ie',
        'gd',
        'gd-gb',
        'gl',
        'gl-es',
        'gsw',
        'gsw-ch',
        'gsw-fr',
        'gsw-li',
        'gu',
        'gu-in',
        'guz',
        'guz-ke',
        'gv',
        'gv-im',
        'ha',
        'ha-gh',
        'ha-ne',
        'ha-ng',
        'haw',
        'haw-us',
        'he',
        'hi',
        'hi-in',
        'hr',
        'hr-ba',
        'hr-hr',
        'hsb',
        'hsb-de',
        'hu',
        'hu-hu',
        'hy',
        'hy-am',
        'ia',
        'ia-001',
        'id',
        'ig',
        'ig-ng',
        'ii',
        'ii-cn',
        'id-id',
        'is',
        'is-is',
        'it',
        'it-ch',
        'it-it',
        'it-sm',
        'it-va',
        'he-il',
        'ja',
        'ja-jp',
        'jgo',
        'jgo-cm',
        'yi',
        'yi-001',
        'jmc',
        'jmc-tz',
        'jv',
        'jv-id',
        'ka',
        'ka-ge',
        'kab',
        'kab-dz',
        'kam',
        'kam-ke',
        'kde',
        'kde-tz',
        'kea',
        'kea-cv',
        'khq',
        'khq-ml',
        'ki',
        'ki-ke',
        'kk',
        'kk-kz',
        'kkj',
        'kkj-cm',
        'kl',
        'kl-gl',
        'kln',
        'kln-ke',
        'km',
        'km-kh',
        'kn',
        'kn-in',
        'ko',
        'ko-kp',
        'ko-kr',
        'kok',
        'kok-in',
        'ks',
        'ks-in',
        'ksb',
        'ksb-tz',
        'ksf',
        'ksf-cm',
        'ksh',
        'ksh-de',
        'kw',
        'kw-gb',
        'ku',
        'ku-tr',
        'ky',
        'ky-kg',
        'lag',
        'lag-tz',
        'lb',
        'lb-lu',
        'lg',
        'lg-ug',
        'lkt',
        'lkt-us',
        'ln',
        'ln-ao',
        'ln-cd',
        'ln-cf',
        'ln-cg',
        'lo',
        'lo-la',
        'lrc',
        'lrc-iq',
        'lrc-ir',
        'lt',
        'lt-lt',
        'lu',
        'lu-cd',
        'luo',
        'luo-ke',
        'luy',
        'luy-ke',
        'lv',
        'lv-lv',
        'mai',
        'mai-in',
        'mas',
        'mas-ke',
        'mas-tz',
        'mer',
        'mer-ke',
        'mfe',
        'mfe-mu',
        'mg',
        'mg-mg',
        'mgh',
        'mgh-mz',
        'mgo',
        'mgo-cm',
        'mi',
        'mi-nz',
        'mk',
        'mk-mk',
        'ml',
        'ml-in',
        'mn',
        'mn-mn',
        'mni',
        'mni-in',
        'mr',
        'mr-in',
        'ms',
        'ms-bn',
        'ms-id',
        'ms-my',
        'ms-sg',
        'mt',
        'mt-mt',
        'mua',
        'mua-cm',
        'my',
        'my-mm',
        'mzn',
        'mzn-ir',
        'naq',
        'naq-na',
        'nb',
        'nb-no',
        'nb-sj',
        'nd',
        'nd-zw',
        'nds',
        'nds-de',
        'nds-nl',
        'ne',
        'ne-in',
        'ne-np',
        'nl',
        'nl-aw',
        'nl-be',
        'nl-ch',
        'nl-bq',
        'nl-cw',
        'nl-lu',
        'nl-nl',
        'nl-sr',
        'nl-sx',
        'nmg',
        'nmg-cm',
        'nn',
        'nn-no',
        'nnh',
        'nnh-cm',
        'no',
        'no-no',
        'nus',
        'nus-ss',
        'nyn',
        'nyn-ug',
        'om',
        'om-et',
        'om-ke',
        'or',
        'or-in',
        'os',
        'os-ge',
        'os-ru',
        'pa',
        'pa-in',
        'pa-pk',
        'pcm',
        'pcm-ng',
        'pl',
        'pl-pl',
        'prg',
        'prg-001',
        'ps',
        'ps-af',
        'ps-pk',
        'pt',
        'pt-ao',
        'pt-br',
        'pt-ch',
        'pt-cv',
        'pt-gq',
        'pt-gw',
        'pt-lu',
        'pt-mo',
        'pt-mz',
        'pt-pt',
        'pt-st',
        'pt-tl',
        'qu',
        'qu-bo',
        'qu-ec',
        'qu-pe',
        'rm',
        'rm-ch',
        'rn',
        'rn-bi',
        'ro',
        'ro-md',
        'ro-ro',
        'rof',
        'rof-tz',
        'ru',
        'ru-by',
        'ru-kg',
        'ru-kz',
        'ru-md',
        'ru-ru',
        'ru-ua',
        'rw',
        'rw-rw',
        'rwk',
        'rwk-tz',
        'sa',
        'sa-in',
        'sah',
        'sah-ru',
        'saq',
        'saq-ke',
        'sat',
        'sat-in',
        'sbp',
        'sbp-tz',
        'sd',
        'sd-in',
        'sd-pk',
        'se',
        'se-fi',
        'se-no',
        'se-se',
        'seh',
        'seh-mz',
        'ses',
        'ses-ml',
        'sg',
        'sg-cf',
        'shi',
        'shi-ma',
        'si',
        'si-lk',
        'sk',
        'sk-sk',
        'sl',
        'sl-si',
        'smn',
        'smn-fi',
        'sn',
        'sn-zw',
        'so',
        'so-dj',
        'so-et',
        'so-ke',
        'so-so',
        'sq',
        'sq-al',
        'sq-mk',
        'sq-xk',
        'sr',
        'sr-ba',
        'sr-cs',
        'sr-me',
        'sr-rs',
        'sr-xk',
        'su',
        'su-id',
        'sv',
        'sv-ax',
        'sv-fi',
        'sv-se',
        'sw',
        'sw-cd',
        'sw-ke',
        'sw-tz',
        'sw-ug',
        'sy',
        'ta',
        'ta-in',
        'ta-lk',
        'ta-my',
        'ta-sg',
        'te',
        'te-in',
        'teo',
        'teo-ke',
        'teo-ug',
        'tg',
        'tg-tj',
        'th',
        'th-th',
        'ti',
        'ti-er',
        'ti-et',
        'tk',
        'tk-tm',
        'tl',
        'to',
        'to-to',
        'tr',
        'tr-cy',
        'tr-tr',
        'tt',
        'tt-ru',
        'twq',
        'twq-ne',
        'tzm',
        'tzm-ma',
        'ug',
        'ug-cn',
        'uk',
        'uk-ua',
        'ur',
        'ur-in',
        'ur-pk',
        'uz',
        'uz-af',
        'uz-uz',
        'vai',
        'vai-lr',
        'vi',
        'vi-vn',
        'vo',
        'vo-001',
        'vun',
        'vun-tz',
        'wae',
        'wae-ch',
        'wo',
        'wo-sn',
        'xh',
        'xh-za',
        'xog',
        'xog-ug',
        'yav',
        'yav-cm',
        'yo',
        'yo-bj',
        'yo-ng',
        'yue',
        'yue-cn',
        'yue-hk',
        'zgh',
        'zgh-ma',
        'zh',
        'zh-cn',
        'zh-hk',
        'zh-mo',
        'zh-sg',
        'zh-tw',
        'zh-hans',
        'zh-hant',
        'zu',
        'zu-za',
      ])
      .optional()
      .describe("Primary language of email content (e.g., 'en', 'en-us')."),
    publishDate: z
      .string()
      .optional()
      .describe('Scheduled send date/time (ISO 8601). Used for scheduled emails.'),
    subcategory: z
      .string()
      .optional()
      .describe("Email subcategory for organization/reporting (e.g., 'MARKETING_EMAIL')."),
    activeDomain: z
      .string()
      .optional()
      .describe('Connected and verified sending domain in HubSpot.'),
    rssDataUrl: z
      .string()
      .optional()
      .describe('External RSS feed URL. Required for external blog RSS emails.'),
    fromReplyTo: z
      .string()
      .optional()
      .describe("'From' email address; receives replies if `customReplyTo` is not set."),
    sendOnPublish: z
      .boolean()
      .optional()
      .describe('If true, sends email immediately on publishing, overriding `publishDate`.'),
    businessUnitId: z
      .string()
      .optional()
      .describe('Associated business unit ID, for accounts with multiple units.'),
    fromFromName: z.string().optional().describe("'From' name displayed to recipients."),
    rssDataTiming: z
      .record(z.any())
      .optional()
      .describe('Send timing for RSS emails. Applies if `rssData` is configured.'),
    testingTestId: z
      .string()
      .optional()
      .describe('Unique identifier of the A/B test, if applicable.'),
    contentWidgets: z
      .record(z.any())
      .optional()
      .describe('Configuration for widgets (modules) in email content.'),
    webversionSlug: z
      .string()
      .optional()
      .describe("URL slug for the web version (e.g., 'july-newsletter')."),
    testingAbStatus: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe('Current status of the A/B test.'),
    webversionTitle: z.string().optional().describe('Browser tab title for the web version.'),
    contentFlexAreas: z
      .record(z.any())
      .optional()
      .describe('Configuration for flexible content areas in the email template.'),
    webversionDomain: z
      .string()
      .optional()
      .describe('Domain for the email web version; defaults to HubSpot domain if unspecified.'),
    fromCustomReplyTo: z
      .string()
      .optional()
      .describe('Custom reply-to email address; overrides `replyTo`.'),
    rssDataBlogLayout: z
      .string()
      .optional()
      .describe('Layout style for blog posts in RSS email. Applies if `rssData` is configured.'),
    rssDataMaxEntries: z
      .number()
      .int()
      .optional()
      .describe('Maximum blog posts per RSS email. Applies if `rssData` is configured.'),
    contentSmartFields: z
      .record(z.any())
      .optional()
      .describe('Smart fields and values for email personalization.'),
    testingHoursToWait: z
      .number()
      .int()
      .optional()
      .describe('Hours to wait for A/B test results before sending the winning version.'),
    toSuppressGraymail: z
      .boolean()
      .optional()
      .describe("If true, suppresses sending to 'graymail' contacts."),
    contentTemplatePath: z
      .string()
      .optional()
      .describe('Path to the email template in HubSpot Design Manager.'),
    webversionExpiresAt: z
      .string()
      .optional()
      .describe('Expiration date/time (ISO 8601) for the web version link.'),
    rssDataBlogEmailType: z
      .string()
      .optional()
      .describe(
        "Type of RSS email (e.g., 'instant', 'daily', 'weekly'). Applies if `rssData` is configured.",
      ),
    rssDataHubspotBlogId: z
      .string()
      .optional()
      .describe(
        'HubSpot-hosted blog ID for RSS-to-Email. Applies if `rssData` is configured and blog is HubSpot-hosted.',
      ),
    toLimitSendFrequency: z
      .boolean()
      .optional()
      .describe('If true, respects contact send frequency limits.'),
    toContactIdsExclude: z
      .array(z.string())
      .optional()
      .describe('Specific contact IDs to exclude from recipients.'),
    toContactIdsInclude: z
      .array(z.string())
      .optional()
      .describe('Specific contact IDs to include as recipients.'),
    testingAbSuccessMetric: z
      .enum(['CLICKS_BY_OPENS', 'CLICKS_BY_DELIVERED', 'OPENS_BY_DELIVERED'])
      .optional()
      .describe("Metric to determine A/B test winning version (e.g., 'CLICKS_BY_OPENS')."),
    contentPlainTextVersion: z.string().optional().describe('Plain text version of the email.'),
    contentWidgetContainers: z
      .record(z.any())
      .optional()
      .describe('Configuration for widget containers in the email template.'),
    rssDataRssEntryTemplate: z
      .string()
      .optional()
      .describe('HTML template for each RSS entry. Applies if `rssData` is configured.'),
    testingAbTestPercentage: z
      .number()
      .int()
      .optional()
      .describe('Percentage of recipients in the A/B test group (e.g., 20 for 20%).'),
    toContactListsExclude: z
      .array(z.string())
      .optional()
      .describe('Contact list IDs whose members will be excluded.'),
    toContactListsInclude: z
      .array(z.string())
      .optional()
      .describe('Contact list IDs whose members will be included as recipients.'),
    webversionRedirectToUrl: z
      .string()
      .optional()
      .describe(
        'Custom URL to redirect to from web version link if `redirectToPageId` is not set.',
      ),
    rssDataBlogImageMaxWidth: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum width for images imported from RSS feed blog posts. Applies if `rssData` is configured.',
      ),
    testingAbSamplingDefault: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe(
        "Default email version ('master' or 'variant') if A/B test results are inconclusive.",
      ),
    webversionMetaDescription: z
      .string()
      .optional()
      .describe('Meta description for the web version (for search engines).'),
    contentThemeSettingsValues: z
      .record(z.any())
      .optional()
      .describe('Custom values for theme settings applied to the email template.'),
    testingAbSampleSizeDefault: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe(
        "Default email version ('master' or 'variant') if A/B test sample size is too small.",
      ),
    webversionRedirectToPageId: z
      .string()
      .optional()
      .describe('HubSpot page ID to redirect to from web version link; overrides `redirectToUrl`.'),
    rssDataUseHeadlineAsSubject: z
      .boolean()
      .optional()
      .describe(
        'If true, email subject is first blog post headline. Applies if `rssData` is configured.',
      ),
    subscriptionDetailsSubscriptionId: z
      .string()
      .optional()
      .describe('Specific subscription type ID (e.g., newsletter).'),
    subscriptionDetailsOfficeLocationId: z
      .string()
      .optional()
      .describe('Company office location ID for email footer (compliance).'),
    subscriptionDetailsPreferencesGroupId: z
      .string()
      .optional()
      .describe('Associated subscription preferences group ID.'),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPut(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/draft`,
      {
        body: unflattenDeep(
          mapKeys(
            pickDefined(stripKeys(input, ['hubspotToken', 'emailId'])),
            hubspotCreateOrUpdateDraftVersionFieldMap,
          ),
        ),
      },
    );
  },
});

export const hubspotDeleteMarketingEmail = tool({
  description:
    'Permanently deletes a marketing email from your HubSpot account. This action cannot be undone.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z.string().describe('The unique identifier of the marketing email to delete.'),
  }),
  execute: async ({ hubspotToken, emailId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/marketing/v3/emails/${encodeURIComponent(String(emailId))}`);
  },
});

export const hubspotGetAbEmailVariation = tool({
  description:
    'Retrieves the alternate variation of a specified A/B marketing email; the `emailId` must identify an email currently in an A/B test. Requires Marketing Hub Professional or Enterprise subscription. Best-effort: HubSpot has no dedicated A/B-variation endpoint, so this returns the email (including its A/B test fields) for an email in an A/B test.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe(
        'The unique identifier of the A/B marketing email. If this ID refers to variation A, the details for variation B will be returned, and vice-versa.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Boolean variable to request archived email. Set to true to retrieve archived A/B test emails.',
      ),
    includeStats: z
      .boolean()
      .optional()
      .describe(
        'Boolean variable to request stats to be returned in response. Set to true to include email performance statistics.',
      ),
    workflowNames: z
      .boolean()
      .optional()
      .describe(
        'Boolean variable to request name of the associated workflows in response. Set to true to include workflow names.',
      ),
    includedProperties: z
      .array(z.string())
      .optional()
      .describe(
        'List of properties to be returned in the API response. If not specified, all properties will be returned.',
      ),
    marketingCampaignNames: z
      .boolean()
      .optional()
      .describe(
        'Boolean variable to request name of the campaign in response. Set to true to include associated campaign names.',
      ),
  }),
  execute: async ({
    hubspotToken,
    emailId,
    archived,
    includeStats,
    workflowNames,
    includedProperties,
    marketingCampaignNames,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/marketing/v3/emails/${encodeURIComponent(String(emailId))}`, {
      query: pickDefined({
        archived: archived,
        includeStats: includeStats,
        workflowNames: workflowNames,
        includedProperties: includedProperties,
        marketingCampaignNames: marketingCampaignNames,
      }),
    });
  },
});

export const hubspotGetAggregatedStatisticIntervals = tool({
  description:
    'Retrieves aggregated statistics for marketing emails (e.g., send counts), grouped by specified time intervals within a defined time range.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailIds: z
      .array(z.number().int())
      .optional()
      .describe(
        'Optional list of specific email IDs to filter results; if omitted, statistics for all emails in the time range are returned.',
      ),
    interval: z
      .enum(['YEAR', 'QUARTER', 'MONTH', 'WEEK', 'DAY', 'HOUR', 'QUARTER_HOUR', 'MINUTE', 'SECOND'])
      .optional()
      .describe(
        'Time interval for aggregating email statistics, defining data granularity (e.g., YEAR, MONTH, DAY).',
      ),
    endTimestamp: z
      .string()
      .optional()
      .describe(
        'End of the time span for statistics (ISO8601 timestamp); must be on or after `startTimestamp`.',
      ),
    startTimestamp: z
      .string()
      .optional()
      .describe('Start of the time span for statistics (ISO8601 timestamp).'),
  }),
  execute: async ({ hubspotToken, emailIds, interval, endTimestamp, startTimestamp }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/marketing/v3/emails/statistics/histogram`, {
      query: pickDefined({
        emailIds: emailIds,
        interval: interval,
        endTimestamp: endTimestamp,
        startTimestamp: startTimestamp,
      }),
    });
  },
});

export const hubspotGetAggregatedStatistics = tool({
  description:
    'Retrieves aggregated statistics for marketing emails, optionally within an ISO8601 formatted time range, by email IDs, or specific email properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailIds: z
      .array(z.number().int())
      .optional()
      .describe('Filter statistics by specific email IDs.'),
    property: z
      .string()
      .optional()
      .describe(
        "Specific email property to include (e.g., 'subject', 'campaignGuid'); if omitted, all available properties are returned. See HubSpot docs for available properties.",
      ),
    endTimestamp: z
      .string()
      .optional()
      .describe(
        'End of the time range (ISO8601 format); statistics are aggregated for emails sent on or before this time. Required by the API; if not provided, defaults to current time.',
      ),
    startTimestamp: z
      .string()
      .optional()
      .describe(
        'Start of the time range (ISO8601 format); statistics are aggregated for emails sent on or after this time. Required by the API; if not provided, defaults to 30 days ago.',
      ),
  }),
  execute: async ({ hubspotToken, emailIds, property, endTimestamp, startTimestamp }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/marketing/v3/emails/statistics/list`, {
      query: pickDefined({
        emailIds: emailIds,
        property: property,
        endTimestamp: endTimestamp,
        startTimestamp: startTimestamp,
      }),
    });
  },
});

export const hubspotGetAllMarketingEmailsForAHubspotAccount = tool({
  description:
    'Fetches a list of marketing emails from a HubSpot account, with options for filtering, sorting, pagination, and including performance statistics.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    sort: z
      .array(z.string())
      .optional()
      .describe(
        "A list of fields to sort the results by. Valid fields are `name`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`. Prefix with '-' for descending order (e.g., '-createdAt'). `createdAt` is the default sort order if unspecified.",
      ),
    type: z
      .enum([
        'AB_EMAIL',
        'BATCH_EMAIL',
        'LOCALTIME_EMAIL',
        'AUTOMATED_AB_EMAIL',
        'BLOG_EMAIL',
        'BLOG_EMAIL_CHILD',
        'RSS_EMAIL',
        'RSS_EMAIL_CHILD',
        'RESUBSCRIBE_EMAIL',
        'OPTIN_EMAIL',
        'OPTIN_FOLLOWUP_EMAIL',
        'AUTOMATED_EMAIL',
        'FEEDBACK_CES_EMAIL',
        'FEEDBACK_CUSTOM_EMAIL',
        'FEEDBACK_CUSTOM_SURVEY_EMAIL',
        'FEEDBACK_NPS_EMAIL',
        'FOLLOWUP_EMAIL',
        'LEADFLOW_EMAIL',
        'SINGLE_SEND_API',
        'MARKETING_SINGLE_SEND_API',
        'SMTP_TOKEN',
        'TICKET_EMAIL',
        'MEMBERSHIP_REGISTRATION_EMAIL',
        'MEMBERSHIP_PASSWORD_SAVED_EMAIL',
        'MEMBERSHIP_PASSWORD_RESET_EMAIL',
        'MEMBERSHIP_EMAIL_VERIFICATION_EMAIL',
        'MEMBERSHIP_OTP_LOGIN_EMAIL',
      ])
      .optional()
      .describe(
        'Filter emails by type. Multiple types can be specified. If omitted, emails of all types are returned. See TypeEnm for allowed values.',
      ),
    after: z
      .string()
      .optional()
      .describe(
        'The cursor token to retrieve the next page of results. This value is obtained from the `paging.next.after` property of a previous paged response.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of emails to return per page. Default is 100, max is 100.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Specifies whether to include archived emails in the results. Defaults to `false` (archived emails are not returned). Set to `true` to retrieve archived emails.',
      ),
    createdAt: z
      .string()
      .optional()
      .describe(
        "Filter emails created at this exact ISO 8601 date-time (e.g., '2023-10-26T10:30:00Z').",
      ),
    updatedAt: z
      .string()
      .optional()
      .describe(
        "Filter emails last updated at this exact ISO 8601 date-time (e.g., '2023-10-26T12:45:00Z').",
      ),
    isPublished: z
      .boolean()
      .optional()
      .describe(
        'Filter emails based on their publication status: `true` for published emails, `false` for draft emails. If omitted, both published and draft emails are returned.',
      ),
    createdAfter: z
      .string()
      .optional()
      .describe(
        "Filter emails created after this ISO 8601 date-time (e.g., '2023-10-26T00:00:00Z').",
      ),
    includeStats: z
      .boolean()
      .optional()
      .describe(
        'If `true`, includes statistics (e.g., open rates, click rates) with each email. Defaults to `false`.',
      ),
    updatedAfter: z
      .string()
      .optional()
      .describe(
        "Filter emails last updated after this ISO 8601 date-time (e.g., '2023-10-26T00:00:00Z').",
      ),
    createdBefore: z
      .string()
      .optional()
      .describe(
        "Filter emails created before this ISO 8601 date-time (e.g., '2023-10-27T00:00:00Z').",
      ),
    updatedBefore: z
      .string()
      .optional()
      .describe(
        "Filter emails last updated before this ISO 8601 date-time (e.g., '2023-10-27T00:00:00Z').",
      ),
    includedProperties: z
      .array(z.string())
      .optional()
      .describe(
        'A list of specific property names to include in the response for each email object. If omitted, a default set of properties is returned. Consult the HubSpot API documentation for available email properties.',
      ),
  }),
  execute: async ({
    hubspotToken,
    sort,
    type,
    after,
    limit,
    archived,
    createdAt,
    updatedAt,
    isPublished,
    createdAfter,
    includeStats,
    updatedAfter,
    createdBefore,
    updatedBefore,
    includedProperties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/marketing/v3/emails/`, {
      query: pickDefined({
        sort: sort,
        type: type,
        after: after,
        limit: limit,
        archived: archived,
        createdAt: createdAt,
        updatedAt: updatedAt,
        isPublished: isPublished,
        createdAfter: createdAfter,
        includeStats: includeStats,
        updatedAfter: updatedAfter,
        createdBefore: createdBefore,
        updatedBefore: updatedBefore,
        includedProperties: includedProperties,
      }),
    });
  },
});

export const hubspotGetMarketingEmailDraft = tool({
  description:
    'Retrieves the draft version of a marketing email by its `emailId`; if no draft exists, returns the published version.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe(
        'The unique identifier of the marketing email. Used to fetch its draft version or, if unavailable, its published version.',
      ),
  }),
  execute: async ({ hubspotToken, emailId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/draft`,
    );
  },
});

export const hubspotGetMarketingEmailRevision = tool({
  description:
    'Retrieves a specific, previously saved revision of a marketing email using its unique email ID and revision ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe('The unique identifier of the marketing email whose revision is to be fetched.'),
    revisionId: z
      .string()
      .describe(
        'The unique identifier of the specific revision of the marketing email to be retrieved.',
      ),
  }),
  execute: async ({ hubspotToken, emailId, revisionId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/revisions/${encodeURIComponent(String(revisionId))}`,
    );
  },
});

export const hubspotGetMarketingEmailRevisions = tool({
  description:
    'Retrieves a paginated list of all historical versions (including full state like content, settings, metadata) for a specified, existing marketing email; revision ID -1 identifies the current version.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Cursor for the next page of results, typically from `paging.next.after` in a previous response.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of email revisions per page. The API defaults to 100 if this parameter is not provided.',
      ),
    before: z
      .string()
      .optional()
      .describe(
        'Cursor for the previous page of results, typically from `paging.prev.before` in a previous response.',
      ),
    emailId: z
      .string()
      .describe(
        'The unique identifier of the marketing email for which revisions are to be fetched.',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, before, emailId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/revisions`,
      {
        query: pickDefined({ after: after, limit: limit, before: before }),
      },
    );
  },
});

export const hubspotGetTheDetailsOfASpecifiedMarketingEmail = tool({
  description:
    'Retrieves detailed information for a specific marketing email in HubSpot using its unique email ID, optionally including performance statistics and specific properties.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z.string().describe('The unique identifier of the marketing email to retrieve.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Filter by archived status: `true` for archived, `false` for not archived. Omit to retrieve regardless of archived status.',
      ),
    includeStats: z
      .boolean()
      .optional()
      .describe(
        'Whether to include performance statistics (e.g., open rates, click-through rates) with the email details.',
      ),
    includedProperties: z
      .array(z.string())
      .optional()
      .describe(
        'Specific marketing email property names to include in the response (e.g., "name", "subject", "createdById"). If omitted, a default set of properties is returned.',
      ),
  }),
  execute: async ({ hubspotToken, emailId, archived, includeStats, includedProperties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/marketing/v3/emails/${encodeURIComponent(String(emailId))}`, {
      query: pickDefined({
        archived: archived,
        includeStats: includeStats,
        includedProperties: includedProperties,
      }),
    });
  },
});

export const hubspotListEmailEvents = tool({
  description:
    'Lists one page of HubSpot marketing email events; continue with `offset` only while `hasMore` is true.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    appId: z
      .string()
      .optional()
      .describe('Return only events generated by this HubSpot application ID.'),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of email events to return, from 1 through 1000.'),
    offset: z
      .string()
      .optional()
      .describe(
        'Opaque pagination token returned as `offset` by a previous response; use it only when that response has `hasMore` set to true.',
      ),
    eventType: z
      .string()
      .optional()
      .describe(
        'Case-sensitive email event type to return, such as SENT, DELIVERED, OPEN, CLICK, or BOUNCE.',
      ),
    recipient: z
      .string()
      .optional()
      .describe('Return only events for this recipient email address.'),
    campaignId: z
      .string()
      .optional()
      .describe('Return only events for this HubSpot email campaign ID.'),
    endTimestamp: z
      .number()
      .int()
      .optional()
      .describe('Return events created at or before this Unix epoch timestamp in milliseconds.'),
    startTimestamp: z
      .number()
      .int()
      .optional()
      .describe('Return events created at or after this Unix epoch timestamp in milliseconds.'),
    excludeFilteredEvents: z
      .boolean()
      .optional()
      .describe("Whether to omit events excluded by the account's customer filtering settings."),
  }),
  execute: async ({
    hubspotToken,
    appId,
    limit,
    offset,
    eventType,
    recipient,
    campaignId,
    endTimestamp,
    startTimestamp,
    excludeFilteredEvents,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/email/public/v1/events`, {
      query: pickDefined({
        appId: appId,
        limit: limit,
        offset: offset,
        eventType: eventType,
        recipient: recipient,
        campaignId: campaignId,
        endTimestamp: endTimestamp,
        startTimestamp: startTimestamp,
        excludeFilteredEvents: excludeFilteredEvents,
      }),
    });
  },
});

export const hubspotPublishMarketingEmail = tool({
  description:
    'Publishes or sends a specified HubSpot marketing email that is valid and ready for sending; requires Marketing Hub Enterprise or the transactional email add-on. Publishes or sends a valid, ready email; requires Marketing Hub Enterprise or the transactional add-on.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z.string().describe('Identifier of the HubSpot marketing email to publish or send.'),
  }),
  execute: async ({ hubspotToken, emailId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/publish`,
      {
        query: pickDefined({ email_id: emailId }),
      },
    );
  },
});

export const hubspotResetDraft = tool({
  description:
    "Resets a marketing email's draft to its currently published (live) version, discarding all unpublished changes; the email must have a live version to revert to.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z
      .string()
      .describe(
        'Identifier of the marketing email whose draft will be reset to its currently published (live) version.',
      ),
  }),
  execute: async ({ hubspotToken, emailId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/draft/reset`,
    );
  },
});

export const hubspotRestoreEmailRevision = tool({
  description:
    'Restores a specific revision of a marketing email to a DRAFT state, overwriting any existing draft.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z.string().describe('The unique identifier of the marketing email.'),
    revisionId: z
      .number()
      .int()
      .describe('The specific revision ID of the marketing email to restore.'),
  }),
  execute: async ({ hubspotToken, emailId, revisionId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/revisions/${encodeURIComponent(String(revisionId))}/restore`,
    );
  },
});

export const hubspotRestoreMarketingEmailRevision = tool({
  description:
    'Restores a specific, existing, non-active revision of a marketing email to become the new live version for that email.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    emailId: z.string().describe('Identifier of the marketing email.'),
    revisionId: z.string().describe('Identifier of the specific email revision to restore.'),
  }),
  execute: async ({ hubspotToken, emailId, revisionId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(
      hubspotToken,
      `/marketing/v3/emails/${encodeURIComponent(String(emailId))}/revisions/${encodeURIComponent(String(revisionId))}/restore`,
    );
  },
});

const hubspotUpdateAMarketingEmailFieldMap: Record<string, string> = {
  name: 'name',
  state: 'state',
  subject: 'subject',
  archived: 'archived',
  campaign: 'campaign',
  language: 'language',
  publishDate: 'publishDate',
  subcategory: 'subcategory',
  activeDomain: 'activeDomain',
  rssDataUrl: 'rssData__url',
  fromReplyTo: 'from__replyTo',
  sendOnPublish: 'sendOnPublish',
  businessUnitId: 'businessUnitId',
  fromFromName: 'from__fromName',
  rssDataTiming: 'rssData__timing',
  testingTestId: 'testing__testId',
  contentWidgets: 'content__widgets',
  webversionSlug: 'webversion__slug',
  testingAbStatus: 'testing__abStatus',
  webversionTitle: 'webversion__title',
  contentFlexAreas: 'content__flexAreas',
  webversionDomain: 'webversion__domain',
  fromCustomReplyTo: 'from__customReplyTo',
  rssDataBlogLayout: 'rssData__blogLayout',
  rssDataMaxEntries: 'rssData__maxEntries',
  contentSmartFields: 'content__smartFields',
  testingHoursToWait: 'testing__hoursToWait',
  toSuppressGraymail: 'to__suppressGraymail',
  contentTemplatePath: 'content__templatePath',
  webversionExpiresAt: 'webversion__expiresAt',
  rssDataBlogEmailType: 'rssData__blogEmailType',
  rssDataHubspotBlogId: 'rssData__hubspotBlogId',
  toLimitSendFrequency: 'to__limitSendFrequency',
  toContactIdsExclude: 'to__contactIds__exclude',
  toContactIdsInclude: 'to__contactIds__include',
  testingAbSuccessMetric: 'testing__abSuccessMetric',
  contentPlainTextVersion: 'content__plainTextVersion',
  contentWidgetContainers: 'content__widgetContainers',
  rssDataRssEntryTemplate: 'rssData__rssEntryTemplate',
  testingAbTestPercentage: 'testing__abTestPercentage',
  toContactListsExclude: 'to__contactLists__exclude',
  toContactListsInclude: 'to__contactLists__include',
  webversionRedirectToUrl: 'webversion__redirectToUrl',
  rssDataBlogImageMaxWidth: 'rssData__blogImageMaxWidth',
  testingAbSamplingDefault: 'testing__abSamplingDefault',
  webversionMetaDescription: 'webversion__metaDescription',
  contentThemeSettingsValues: 'content__themeSettingsValues',
  testingAbSampleSizeDefault: 'testing__abSampleSizeDefault',
  webversionRedirectToPageId: 'webversion__redirectToPageId',
  rssDataUseHeadlineAsSubject: 'rssData__useHeadlineAsSubject',
  subscriptionDetailsSubscriptionId: 'subscriptionDetails__subscriptionId',
  subscriptionDetailsOfficeLocationId: 'subscriptionDetails__officeLocationId',
  subscriptionDetailsPreferencesGroupId: 'subscriptionDetails__preferencesGroupId',
};
export const hubspotUpdateAMarketingEmail = tool({
  description:
    'Updates properties of an existing marketing email identified by its `emailId`; unspecified fields retain their current values. Only draft emails can be updated via the API; published emails must be edited as drafts.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z
      .string()
      .optional()
      .describe('The internal name of the email as it appears in the HubSpot dashboard.'),
    state: z
      .enum([
        'AUTOMATED',
        'AUTOMATED_DRAFT',
        'AUTOMATED_SENDING',
        'AUTOMATED_FOR_FORM',
        'AUTOMATED_FOR_FORM_BUFFER',
        'AUTOMATED_FOR_FORM_DRAFT',
        'AUTOMATED_FOR_FORM_LEGACY',
        'BLOG_EMAIL_DRAFT',
        'BLOG_EMAIL_PUBLISHED',
        'DRAFT',
        'DRAFT_AB',
        'DRAFT_AB_VARIANT',
        'ERROR',
        'LOSER_AB_VARIANT',
        'PAGE_STUB',
        'PRE_PROCESSING',
        'PROCESSING',
        'PUBLISHED',
        'PUBLISHED_AB',
        'PUBLISHED_AB_VARIANT',
        'PUBLISHED_OR_SCHEDULED',
        'RSS_TO_EMAIL_DRAFT',
        'RSS_TO_EMAIL_PUBLISHED',
        'SCHEDULED',
        'SCHEDULED_AB',
        'SCHEDULED_OR_PUBLISHED',
        'AUTOMATED_AB',
        'AUTOMATED_AB_VARIANT',
        'AUTOMATED_DRAFT_AB',
        'AUTOMATED_DRAFT_ABVARIANT',
        'AUTOMATED_LOSER_ABVARIANT',
      ])
      .optional()
      .describe(
        "The desired state of the email after the update. Common states include 'DRAFT', 'SCHEDULED', 'PUBLISHED'.",
      ),
    emailId: z.string().describe('The unique ID of the marketing email to be updated.'),
    subject: z.string().optional().describe('The subject line of the marketing email.'),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to archive the marketing email, or `false` to make it active (unarchive).',
      ),
    campaign: z
      .string()
      .optional()
      .describe('The ID of the HubSpot campaign this email is associated with.'),
    language: z
      .enum([
        'af',
        'af-na',
        'af-za',
        'agq',
        'agq-cm',
        'ak',
        'ak-gh',
        'am',
        'am-et',
        'ar',
        'ar-001',
        'ar-ae',
        'ar-bh',
        'ar-dj',
        'ar-dz',
        'ar-eg',
        'ar-eh',
        'ar-er',
        'ar-il',
        'ar-iq',
        'ar-jo',
        'ar-km',
        'ar-kw',
        'ar-lb',
        'ar-ly',
        'ar-ma',
        'ar-mr',
        'ar-om',
        'ar-ps',
        'ar-qa',
        'ar-sa',
        'ar-sd',
        'ar-so',
        'ar-ss',
        'ar-sy',
        'ar-td',
        'ar-tn',
        'ar-ye',
        'as',
        'as-in',
        'asa',
        'asa-tz',
        'ast',
        'ast-es',
        'az',
        'az-az',
        'bas',
        'bas-cm',
        'be',
        'be-by',
        'bem',
        'bem-zm',
        'bez',
        'bez-tz',
        'bg',
        'bg-bg',
        'bm',
        'bm-ml',
        'bn',
        'bn-bd',
        'bn-in',
        'bo',
        'bo-cn',
        'bo-in',
        'br',
        'br-fr',
        'brx',
        'brx-in',
        'bs',
        'bs-ba',
        'ca',
        'ca-ad',
        'ca-es',
        'ca-fr',
        'ca-it',
        'ccp',
        'ccp-bd',
        'ccp-in',
        'ce',
        'ce-ru',
        'ceb',
        'ceb-ph',
        'cgg',
        'cgg-ug',
        'chr',
        'chr-us',
        'ckb',
        'ckb-iq',
        'ckb-ir',
        'cs',
        'cs-cz',
        'cu',
        'cu-ru',
        'cy',
        'cy-gb',
        'da',
        'da-dk',
        'da-gl',
        'dav',
        'dav-ke',
        'de',
        'de-at',
        'de-be',
        'de-ch',
        'de-de',
        'de-gr',
        'de-it',
        'de-li',
        'de-lu',
        'dje',
        'dje-ne',
        'doi',
        'doi-in',
        'dsb',
        'dsb-de',
        'dua',
        'dua-cm',
        'dyo',
        'dyo-sn',
        'dz',
        'dz-bt',
        'ebu',
        'ebu-ke',
        'ee',
        'ee-gh',
        'ee-tg',
        'el',
        'el-cy',
        'el-gr',
        'en',
        'en-001',
        'en-150',
        'en-ae',
        'en-ag',
        'en-ai',
        'en-as',
        'en-at',
        'en-au',
        'en-bb',
        'en-be',
        'en-bi',
        'en-bm',
        'en-bs',
        'en-bw',
        'en-bz',
        'en-ca',
        'en-cc',
        'en-ch',
        'en-ck',
        'en-cm',
        'en-cn',
        'en-cx',
        'en-cy',
        'en-de',
        'en-dg',
        'en-dk',
        'en-dm',
        'en-er',
        'en-fi',
        'en-fj',
        'en-fk',
        'en-fm',
        'en-gb',
        'en-gd',
        'en-gg',
        'en-gh',
        'en-gi',
        'en-gm',
        'en-gu',
        'en-gy',
        'en-hk',
        'en-ie',
        'en-il',
        'en-im',
        'en-in',
        'en-io',
        'en-je',
        'en-jm',
        'en-ke',
        'en-ki',
        'en-kn',
        'en-ky',
        'en-lc',
        'en-lr',
        'en-ls',
        'en-lu',
        'en-mg',
        'en-mh',
        'en-mo',
        'en-mp',
        'en-ms',
        'en-mt',
        'en-mu',
        'en-mw',
        'en-mx',
        'en-my',
        'en-na',
        'en-nf',
        'en-ng',
        'en-nl',
        'en-nr',
        'en-nu',
        'en-nz',
        'en-pg',
        'en-ph',
        'en-pk',
        'en-pn',
        'en-pr',
        'en-pw',
        'en-rw',
        'en-sb',
        'en-sc',
        'en-sd',
        'en-se',
        'en-sg',
        'en-sh',
        'en-si',
        'en-sl',
        'en-ss',
        'en-sx',
        'en-sz',
        'en-tc',
        'en-tk',
        'en-to',
        'en-tt',
        'en-tv',
        'en-tz',
        'en-ug',
        'en-um',
        'en-us',
        'en-vc',
        'en-vg',
        'en-vi',
        'en-vu',
        'en-ws',
        'en-za',
        'en-zm',
        'en-zw',
        'eo',
        'eo-001',
        'es',
        'es-419',
        'es-ar',
        'es-bo',
        'es-br',
        'es-bz',
        'es-cl',
        'es-co',
        'es-cr',
        'es-cu',
        'es-do',
        'es-ea',
        'es-ec',
        'es-es',
        'es-gq',
        'es-gt',
        'es-hn',
        'es-ic',
        'es-mx',
        'es-ni',
        'es-pa',
        'es-pe',
        'es-ph',
        'es-pr',
        'es-py',
        'es-sv',
        'es-us',
        'es-uy',
        'es-ve',
        'et',
        'et-ee',
        'eu',
        'eu-es',
        'ewo',
        'ewo-cm',
        'fa',
        'fa-af',
        'fa-ir',
        'ff',
        'ff-bf',
        'ff-cm',
        'ff-gh',
        'ff-gm',
        'ff-gn',
        'ff-gw',
        'ff-lr',
        'ff-mr',
        'ff-ne',
        'ff-ng',
        'ff-sl',
        'ff-sn',
        'fi',
        'fi-fi',
        'fil',
        'fil-ph',
        'fo',
        'fo-dk',
        'fo-fo',
        'fr',
        'fr-be',
        'fr-bf',
        'fr-bi',
        'fr-bj',
        'fr-bl',
        'fr-ca',
        'fr-cd',
        'fr-cf',
        'fr-cg',
        'fr-ch',
        'fr-ci',
        'fr-cm',
        'fr-dj',
        'fr-dz',
        'fr-fr',
        'fr-ga',
        'fr-gf',
        'fr-gn',
        'fr-gp',
        'fr-gq',
        'fr-ht',
        'fr-km',
        'fr-lu',
        'fr-ma',
        'fr-mc',
        'fr-mf',
        'fr-mg',
        'fr-ml',
        'fr-mq',
        'fr-mr',
        'fr-mu',
        'fr-nc',
        'fr-ne',
        'fr-pf',
        'fr-pm',
        'fr-re',
        'fr-rw',
        'fr-sc',
        'fr-sn',
        'fr-sy',
        'fr-td',
        'fr-tg',
        'fr-tn',
        'fr-vu',
        'fr-wf',
        'fr-yt',
        'fur',
        'fur-it',
        'fy',
        'fy-nl',
        'ga',
        'ga-gb',
        'ga-ie',
        'gd',
        'gd-gb',
        'gl',
        'gl-es',
        'gsw',
        'gsw-ch',
        'gsw-fr',
        'gsw-li',
        'gu',
        'gu-in',
        'guz',
        'guz-ke',
        'gv',
        'gv-im',
        'ha',
        'ha-gh',
        'ha-ne',
        'ha-ng',
        'haw',
        'haw-us',
        'he',
        'hi',
        'hi-in',
        'hr',
        'hr-ba',
        'hr-hr',
        'hsb',
        'hsb-de',
        'hu',
        'hu-hu',
        'hy',
        'hy-am',
        'ia',
        'ia-001',
        'id',
        'ig',
        'ig-ng',
        'ii',
        'ii-cn',
        'id-id',
        'is',
        'is-is',
        'it',
        'it-ch',
        'it-it',
        'it-sm',
        'it-va',
        'he-il',
        'ja',
        'ja-jp',
        'jgo',
        'jgo-cm',
        'yi',
        'yi-001',
        'jmc',
        'jmc-tz',
        'jv',
        'jv-id',
        'ka',
        'ka-ge',
        'kab',
        'kab-dz',
        'kam',
        'kam-ke',
        'kde',
        'kde-tz',
        'kea',
        'kea-cv',
        'khq',
        'khq-ml',
        'ki',
        'ki-ke',
        'kk',
        'kk-kz',
        'kkj',
        'kkj-cm',
        'kl',
        'kl-gl',
        'kln',
        'kln-ke',
        'km',
        'km-kh',
        'kn',
        'kn-in',
        'ko',
        'ko-kp',
        'ko-kr',
        'kok',
        'kok-in',
        'ks',
        'ks-in',
        'ksb',
        'ksb-tz',
        'ksf',
        'ksf-cm',
        'ksh',
        'ksh-de',
        'kw',
        'kw-gb',
        'ku',
        'ku-tr',
        'ky',
        'ky-kg',
        'lag',
        'lag-tz',
        'lb',
        'lb-lu',
        'lg',
        'lg-ug',
        'lkt',
        'lkt-us',
        'ln',
        'ln-ao',
        'ln-cd',
        'ln-cf',
        'ln-cg',
        'lo',
        'lo-la',
        'lrc',
        'lrc-iq',
        'lrc-ir',
        'lt',
        'lt-lt',
        'lu',
        'lu-cd',
        'luo',
        'luo-ke',
        'luy',
        'luy-ke',
        'lv',
        'lv-lv',
        'mai',
        'mai-in',
        'mas',
        'mas-ke',
        'mas-tz',
        'mer',
        'mer-ke',
        'mfe',
        'mfe-mu',
        'mg',
        'mg-mg',
        'mgh',
        'mgh-mz',
        'mgo',
        'mgo-cm',
        'mi',
        'mi-nz',
        'mk',
        'mk-mk',
        'ml',
        'ml-in',
        'mn',
        'mn-mn',
        'mni',
        'mni-in',
        'mr',
        'mr-in',
        'ms',
        'ms-bn',
        'ms-id',
        'ms-my',
        'ms-sg',
        'mt',
        'mt-mt',
        'mua',
        'mua-cm',
        'my',
        'my-mm',
        'mzn',
        'mzn-ir',
        'naq',
        'naq-na',
        'nb',
        'nb-no',
        'nb-sj',
        'nd',
        'nd-zw',
        'nds',
        'nds-de',
        'nds-nl',
        'ne',
        'ne-in',
        'ne-np',
        'nl',
        'nl-aw',
        'nl-be',
        'nl-ch',
        'nl-bq',
        'nl-cw',
        'nl-lu',
        'nl-nl',
        'nl-sr',
        'nl-sx',
        'nmg',
        'nmg-cm',
        'nn',
        'nn-no',
        'nnh',
        'nnh-cm',
        'no',
        'no-no',
        'nus',
        'nus-ss',
        'nyn',
        'nyn-ug',
        'om',
        'om-et',
        'om-ke',
        'or',
        'or-in',
        'os',
        'os-ge',
        'os-ru',
        'pa',
        'pa-in',
        'pa-pk',
        'pcm',
        'pcm-ng',
        'pl',
        'pl-pl',
        'prg',
        'prg-001',
        'ps',
        'ps-af',
        'ps-pk',
        'pt',
        'pt-ao',
        'pt-br',
        'pt-ch',
        'pt-cv',
        'pt-gq',
        'pt-gw',
        'pt-lu',
        'pt-mo',
        'pt-mz',
        'pt-pt',
        'pt-st',
        'pt-tl',
        'qu',
        'qu-bo',
        'qu-ec',
        'qu-pe',
        'rm',
        'rm-ch',
        'rn',
        'rn-bi',
        'ro',
        'ro-md',
        'ro-ro',
        'rof',
        'rof-tz',
        'ru',
        'ru-by',
        'ru-kg',
        'ru-kz',
        'ru-md',
        'ru-ru',
        'ru-ua',
        'rw',
        'rw-rw',
        'rwk',
        'rwk-tz',
        'sa',
        'sa-in',
        'sah',
        'sah-ru',
        'saq',
        'saq-ke',
        'sat',
        'sat-in',
        'sbp',
        'sbp-tz',
        'sd',
        'sd-in',
        'sd-pk',
        'se',
        'se-fi',
        'se-no',
        'se-se',
        'seh',
        'seh-mz',
        'ses',
        'ses-ml',
        'sg',
        'sg-cf',
        'shi',
        'shi-ma',
        'si',
        'si-lk',
        'sk',
        'sk-sk',
        'sl',
        'sl-si',
        'smn',
        'smn-fi',
        'sn',
        'sn-zw',
        'so',
        'so-dj',
        'so-et',
        'so-ke',
        'so-so',
        'sq',
        'sq-al',
        'sq-mk',
        'sq-xk',
        'sr',
        'sr-ba',
        'sr-cs',
        'sr-me',
        'sr-rs',
        'sr-xk',
        'su',
        'su-id',
        'sv',
        'sv-ax',
        'sv-fi',
        'sv-se',
        'sw',
        'sw-cd',
        'sw-ke',
        'sw-tz',
        'sw-ug',
        'sy',
        'ta',
        'ta-in',
        'ta-lk',
        'ta-my',
        'ta-sg',
        'te',
        'te-in',
        'teo',
        'teo-ke',
        'teo-ug',
        'tg',
        'tg-tj',
        'th',
        'th-th',
        'ti',
        'ti-er',
        'ti-et',
        'tk',
        'tk-tm',
        'tl',
        'to',
        'to-to',
        'tr',
        'tr-cy',
        'tr-tr',
        'tt',
        'tt-ru',
        'twq',
        'twq-ne',
        'tzm',
        'tzm-ma',
        'ug',
        'ug-cn',
        'uk',
        'uk-ua',
        'ur',
        'ur-in',
        'ur-pk',
        'uz',
        'uz-af',
        'uz-uz',
        'vai',
        'vai-lr',
        'vi',
        'vi-vn',
        'vo',
        'vo-001',
        'vun',
        'vun-tz',
        'wae',
        'wae-ch',
        'wo',
        'wo-sn',
        'xh',
        'xh-za',
        'xog',
        'xog-ug',
        'yav',
        'yav-cm',
        'yo',
        'yo-bj',
        'yo-ng',
        'yue',
        'yue-cn',
        'yue-hk',
        'zgh',
        'zgh-ma',
        'zh',
        'zh-cn',
        'zh-hk',
        'zh-mo',
        'zh-sg',
        'zh-tw',
        'zh-hans',
        'zh-hant',
        'zu',
        'zu-za',
      ])
      .optional()
      .describe(
        "The primary language of the email, using ISO 639-1 language codes (e.g., 'en') or language-locale codes (e.g., 'en-us').",
      ),
    publishDate: z
      .string()
      .optional()
      .describe(
        "The scheduled publication date and time for the email in ISO 8601 format (e.g., '2023-12-31T10:00:00Z'). Used for scheduled emails.",
      ),
    subcategory: z
      .string()
      .optional()
      .describe(
        "The subcategory of the email, often used for organization (e.g., 'newsletter', 'promotional').",
      ),
    activeDomain: z
      .string()
      .optional()
      .describe(
        "The domain from which this email will be sent (e.g., 'info.example.com'). Must be a connected sending domain in HubSpot.",
      ),
    rssDataUrl: z
      .string()
      .optional()
      .describe('The URL of the external RSS feed if not using a HubSpot blog.'),
    fromReplyTo: z
      .string()
      .optional()
      .describe(
        "The email address used as the 'From' address and default 'Reply-To' address. Must be a verified address in HubSpot.",
      ),
    sendOnPublish: z
      .boolean()
      .optional()
      .describe(
        "If `true` and the email state is set to 'PUBLISHED', the email will be sent immediately. If `false` for a 'PUBLISHED' state, it implies it was already sent or is a template.",
      ),
    businessUnitId: z
      .string()
      .optional()
      .describe(
        'The ID of the business unit this email belongs to. Requires the Business Units add-on for HubSpot.',
      ),
    fromFromName: z
      .string()
      .optional()
      .describe(
        "The sender's name as it appears in the recipient's inbox (e.g., 'Marketing Team').",
      ),
    rssDataTiming: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary defining the scheduling for RSS emails (e.g., time of day, day of week/month). The structure depends on `blogEmailType`.',
      ),
    testingTestId: z
      .string()
      .optional()
      .describe('The unique identifier of the A/B test, if applicable.'),
    contentWidgets: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary specifying the configuration and content of various widgets (modules) used in the email.',
      ),
    webversionSlug: z
      .string()
      .optional()
      .describe("The URL slug for the web version of the email (e.g., 'july-newsletter-2024')."),
    testingAbStatus: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe("Status of the AB test (e.g., 'master', 'variant')."),
    webversionTitle: z
      .string()
      .optional()
      .describe('The title displayed in the browser tab for the web version of the email.'),
    contentFlexAreas: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary defining content for flexible column areas within drag-and-drop email templates.',
      ),
    webversionDomain: z
      .string()
      .optional()
      .describe(
        'The domain to be used for the web version of this email. If not specified, the default portal domain is used.',
      ),
    fromCustomReplyTo: z
      .string()
      .optional()
      .describe(
        'A custom email address for replies. If set, this overrides the main `replyTo` address for replies.',
      ),
    rssDataBlogLayout: z
      .string()
      .optional()
      .describe('Defines the layout style for displaying blog posts within an RSS email.'),
    rssDataMaxEntries: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of blog posts to include in a single RSS email.'),
    contentSmartFields: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary of smart fields and their values/configurations used in the email content. Enables personalization based on contact properties.',
      ),
    testingHoursToWait: z
      .number()
      .int()
      .optional()
      .describe(
        'Time limit in hours on gathering test results. After this time is up, the winning version will be sent to the remaining contacts.',
      ),
    toSuppressGraymail: z
      .boolean()
      .optional()
      .describe(
        "If `true`, HubSpot will attempt to avoid sending this email to contacts classified as 'graymail' (low engagement).",
      ),
    contentTemplatePath: z
      .string()
      .optional()
      .describe(
        "The path to the email template file within the HubSpot Design Manager (e.g., 'marketplace/some_template_name').",
      ),
    webversionExpiresAt: z
      .string()
      .optional()
      .describe(
        'The date and time when the web version link will expire, in ISO 8601 format. After this time, the link may redirect or show an error.',
      ),
    rssDataBlogEmailType: z
      .string()
      .optional()
      .describe('Specifies the type of RSS email, such as instant, daily, weekly, or monthly.'),
    rssDataHubspotBlogId: z
      .string()
      .optional()
      .describe('The ID of the HubSpot blog used as the source for an RSS-to-email.'),
    toLimitSendFrequency: z
      .boolean()
      .optional()
      .describe(
        "If `true`, respects HubSpot's send frequency limits for contacts. If `false`, may override these limits.",
      ),
    toContactIdsExclude: z
      .array(z.string())
      .optional()
      .describe('A list of contact IDs to specifically exclude from receiving this email.'),
    toContactIdsInclude: z
      .array(z.string())
      .optional()
      .describe('A list of contact IDs to specifically include as recipients for this email.'),
    testingAbSuccessMetric: z
      .enum(['CLICKS_BY_OPENS', 'CLICKS_BY_DELIVERED', 'OPENS_BY_DELIVERED'])
      .optional()
      .describe(
        "Metric to determine the winning version that will be sent to the remaining contacts (e.g., 'CLICKS_BY_OPENS').",
      ),
    contentPlainTextVersion: z
      .string()
      .optional()
      .describe(
        'The plain text version of the email. If omitted, HubSpot may auto-generate it from the HTML content.',
      ),
    contentWidgetContainers: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary defining the layout and content of widget containers in the email template.',
      ),
    rssDataRssEntryTemplate: z
      .string()
      .optional()
      .describe(
        'The HTML template used to render each individual blog post (entry) in an RSS email.',
      ),
    testingAbTestPercentage: z
      .number()
      .int()
      .optional()
      .describe(
        'The percentage of recipients who will be part of the A/B test group (e.g., 50 for 50%).',
      ),
    toContactListsExclude: z
      .array(z.string())
      .optional()
      .describe(
        'A list of contact list IDs whose members should be excluded from receiving this email.',
      ),
    toContactListsInclude: z
      .array(z.string())
      .optional()
      .describe('A list of contact list IDs whose members should receive this email.'),
    webversionRedirectToUrl: z
      .string()
      .optional()
      .describe(
        'An external URL to redirect to if the web version link is expired or disabled, used if `redirectToPageId` is not set.',
      ),
    rssDataBlogImageMaxWidth: z
      .number()
      .int()
      .optional()
      .describe('Maximum width in pixels for images included from an RSS feed in the email.'),
    testingAbSamplingDefault: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe(
        "Version of the email that should be sent if the results are inconclusive after the test period (e.g., 'master', 'variant').",
      ),
    webversionMetaDescription: z
      .string()
      .optional()
      .describe('The meta description for the web version of the email, used by search engines.'),
    contentThemeSettingsValues: z
      .record(z.any())
      .optional()
      .describe(
        'A dictionary of theme settings overrides for the email template. Allows customization of global theme styles.',
      ),
    testingAbSampleSizeDefault: z
      .enum([
        'master',
        'variant',
        'loser_variant',
        'mab_master',
        'mab_variant',
        'automated_master',
        'automated_variant',
        'automated_loser_variant',
      ])
      .optional()
      .describe(
        "Version of the email that should be sent if there are too few recipients to conduct an AB test (e.g., 'master', 'variant').",
      ),
    webversionRedirectToPageId: z
      .string()
      .optional()
      .describe(
        'The ID of a HubSpot-hosted page to redirect to if the web version link is expired or manually disabled.',
      ),
    rssDataUseHeadlineAsSubject: z
      .boolean()
      .optional()
      .describe(
        "If `true`, the headline of the latest blog post will be used as the email's subject line for RSS emails.",
      ),
    subscriptionDetailsSubscriptionId: z
      .string()
      .optional()
      .describe(
        'The ID of the specific email subscription type (e.g., marketing, newsletter) this email belongs to.',
      ),
    subscriptionDetailsOfficeLocationId: z
      .string()
      .optional()
      .describe('The ID of the CAN-SPAM office location to be used in the email footer.'),
    subscriptionDetailsPreferencesGroupId: z
      .string()
      .optional()
      .describe(
        'The ID of the subscription preferences page/group associated with this email. Allows recipients to manage their preferences.',
      ),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(hubspotToken, `/marketing/v3/emails/${encodeURIComponent(String(emailId))}`, {
      body: unflattenDeep(
        mapKeys(
          pickDefined(stripKeys(input, ['hubspotToken', 'emailId'])),
          hubspotUpdateAMarketingEmailFieldMap,
        ),
      ),
    });
  },
});
