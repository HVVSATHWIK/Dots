import * as React from 'react';

// Lightweight brand icons replacing deprecated lucide social glyphs.
// Each accepts standard SVG props and inherits currentColor.

export const FacebookIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function FacebookIcon(props, ref) {
  return (
    <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 4.99 3.64 9.13 8.39 9.93v-7.03H7.9v-2.9h2.35V9.83c0-2.33 1.38-3.62 3.5-3.62.7 0 1.6.11 2.02.17v2.24h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.9h-2.1V22c4.75-.8 8.39-4.94 8.39-9.93Z" />
    </svg>
  );
});

export const TwitterXIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function TwitterXIcon(props, ref) {
  return (
    <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.25 2h3.13l-6.84 7.8L23 22h-6.56l-4.6-6.58L6.4 22H3.26l7.3-8.31L1 2h6.7l4.16 5.94L18.25 2Zm-1.15 17.99h1.73L7.01 3.9H5.15l11.95 16.09Z" />
    </svg>
  );
});

export const InstagramIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function InstagramIcon(props, ref) {
  return (
    <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 8.5A3.5 3.5 0 1 1 8.5 12 3.51 3.51 0 0 1 12 8.5Zm0-2A5.5 5.5 0 1 0 17.5 12 5.5 5.5 0 0 0 12 6.5Zm5.75-.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
    </svg>
  );
});

export const YoutubeIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function YoutubeIcon(props, ref) {
  return (
    <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.58 7.2a2.75 2.75 0 0 0-1.93-1.95C17.9 5 12 5 12 5s-5.9 0-7.65.25A2.75 2.75 0 0 0 2.42 7.2 29.1 29.1 0 0 0 2.17 12a29.1 29.1 0 0 0 .25 4.8 2.75 2.75 0 0 0 1.93 1.95C6.1 19 12 19 12 19s5.9 0 7.65-.25a2.75 2.75 0 0 0 1.93-1.95c.17-1.57.25-3.15.25-4.8a29.1 29.1 0 0 0-.25-4.8ZM10.5 15.02V8.98L15.5 12l-5 3.02Z" />
    </svg>
  );
});
