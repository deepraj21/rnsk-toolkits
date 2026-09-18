// @ts-nocheck
import { createPresentation } from './create-presentation.js';
import { createSlidesMarkdown } from './create-slides-markdown.js';
import { getPageThumbnail2 } from './get-page-thumbnail2.js';
import { presentationsBatchUpdate } from './presentations-batch-update.js';
import { presentationsCopyFromTemplate } from './presentations-copy-from-template.js';
import { presentationsGet } from './presentations-get.js';
import { presentationsPagesGet } from './presentations-pages-get.js';
import { presentationsPagesGetThumbnail } from './presentations-pages-get-thumbnail.js';

export {
    createPresentation,
    createSlidesMarkdown,
    getPageThumbnail2,
    presentationsBatchUpdate,
    presentationsCopyFromTemplate,
    presentationsGet,
    presentationsPagesGet,
    presentationsPagesGetThumbnail,
};

export const googleSlidesTools = [
    {
        name: 'googleSlidesCreatePresentation',
        description:
            'Tool to create a blank Google Slides presentation. Use when you need to initialize a new presentation with a specific title, locale, or page size.',
        tool: createPresentation,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSlidesCreateSlidesMarkdown',
        description:
            'Creates a new Google Slides presentation from Markdown text. Automatically splits content into slides using \'---\' separators and applies appropriate templates based on content structure.',
        tool: createSlidesMarkdown,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSlidesGetPageThumbnail2',
        description:
            'Tool to generate a thumbnail of the latest version of a specified page. Use when you need a preview image URL for a slide page. This request counts as an expensive read request for quota purposes.',
        tool: getPageThumbnail2,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSlidesPresentationsBatchUpdate',
        description:
            'Update Google Slides presentations using markdown content or raw API text. Supports professional themes, auto-formatting, and multiple slide types (title, bullet, table, quote, image, two-column).',
        tool: presentationsBatchUpdate,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSlidesPresentationsCopyFromTemplate',
        description:
            'Tool to create a new Google Slides presentation by duplicating an existing template deck via Drive file copy. Use when you need to preserve themes, masters, and layouts exactly as they appear in the template. After co...',
        tool: presentationsCopyFromTemplate,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSlidesPresentationsGet',
        description:
            'Tool to retrieve the latest version of a presentation. Use after obtaining the presentation ID.',
        tool: presentationsGet,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSlidesPresentationsPagesGet',
        description:
            'Tool to get the latest version of a specific page in a presentation. Use when you need to inspect slide, layout, master, or notes page details.',
        tool: presentationsPagesGet,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSlidesPresentationsPagesGetThumbnail',
        description:
            'DEPRECATED: Use GOOGLESLIDES_GET_PAGE_THUMBNAIL2 instead. Tool to generate and return a thumbnail image URL for a specific page. Use when you need a quick preview of a slide page after loading it.',
        tool: presentationsPagesGetThumbnail,
        requiredAuth: 'googleSlidesToken' as const,
        scope: 'read' as const,
    },
];
