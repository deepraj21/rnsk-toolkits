const SVG = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 128 113" xml:space="preserve"><style>.st0{fill:#05bdba}</style><path class="st0" d="M34.6 94.1h-1.2l-6-6v-1.2l9.2-9.2H43l.9.9V85zm-7.2-68.3v-1.2l6-6h1.2l9.2 9.2v6.4l-.8.8h-6.4z"/><path d="M80.5 74.6h-8.8l-.7-.7V53.3c0-3.7-1.4-6.5-5.8-6.6-2.3-.1-4.9 0-7.6.1l-.4.4v26.6l-.7.7h-8.8l-.7-.7v-35l.7-.7h19.8c7.7 0 13.9 6.2 13.9 13.9v21.9z" style="fill:#014847"/><path class="st0" d="M35.8 61.4H.7l-.7-.7v-8.8l.7-.7h35.1l.7.7v8.8zm91.5 0H92.2l-.7-.7v-8.8l.7-.7h35.1l.7.7v8.8zM58.9 27.1V.7l.8-.7h8.8l.7.7V27l-.7.7h-8.8zm0 84.8V85.6l.7-.7h8.8l.7.7v26.3l-.7.7h-8.8z"/></svg>`;

export const NETLIFY_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
