/**
 * Career OS accent in the frozen palette: cobalt is the one action colour.
 * Same shape as getDomainAccent() so the Career OS components keep their inline styles;
 * the values resolve through the --site-* tokens in src/skylent-site.css.
 */
export const careerAccent = {
  primary: "hsl(var(--site-deep))",
  secondary: "hsl(var(--site-deep))",
  subtle: "hsl(var(--site-soft-blue))",
  subtleStrong: "hsl(var(--site-soft-blue))",
  border: "hsl(var(--site-light-blue))",
  text: "hsl(var(--site-deep))",
  textMuted: "hsl(var(--site-ocean))",
} as const
