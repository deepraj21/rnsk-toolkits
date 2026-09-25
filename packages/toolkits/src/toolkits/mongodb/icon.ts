const SVG = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 120 257" style="enable-background:new 0 0 120 257;" xml:space="preserve">
 <style type="text/css">
  .st0{fill:#00684A;}
 </style>
 <g>
  <path class="st0" d="M82.3,28.6C71.5,15.8,62.2,2.8,60.4,0.1c-0.2-0.2-0.5-0.2-0.7,0c-1.9,2.7-11.2,15.7-22,28.5&#xA;&#x9;&#x9;c-92.6,118.1,14.6,197.8,14.6,197.8l0.9,0.6c0.8,12.3,2.8,30,2.8,30h4h4c0,0,2-17.6,2.8-30l0.9-0.7&#xA;&#x9;&#x9;C67.7,226.4,174.9,146.7,82.3,28.6z M60,224.6c0,0-4.8-4.1-6.1-6.2v-0.2l5.8-128.6c0-0.4,0.6-0.4,0.6,0L66,218.2v0.2&#xA;&#x9;&#x9;C64.7,220.5,60,224.6,60,224.6z">
  </path>
 </g>
</svg>`;

export const MONGODB_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
