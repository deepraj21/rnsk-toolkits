const SVG = `<svg width="304" height="304" viewBox="0 0 304 304" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M59.68 81.177c0 20.357 10.328 42.318 33.054 42.318 16.853 0 33.894-13.158 33.894-42.616 0-25.828-13.396-43.167-33.334-43.167-16.246 0-33.613 11.412-33.613 43.465M101.3 0c40.748 0 68.147 32.273 68.147 80.313 0 47.285-28.863 80.296-70.125 80.296-19.672 0-32.274-8.425-38.863-14.525.047 1.446.078 3.066.078 4.795V215H18.326V44.157c0-2.484-.795-3.27-3.256-3.27H.553V3.474h35.42c16.309 0 20.483 8.3 21.278 14.698C63.87 10.752 77.594 0 101.3 0" id="a"/></defs><use fill="#26292c" xlink:href="#a" transform="translate(67 44)" fill-rule="evenodd"/></svg>`;

export const PIPEDRIVE_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
