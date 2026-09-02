/*
 * The human half of the token reference. The Token and Default columns of
 * /reference/tokens are read out of packages/core/styles.css when this site
 * builds; this file is the column that says what each one is for.
 *
 * Keyed by the custom property, without the leading dashes. A token the
 * stylesheet declares and this file does not describe fails the build, and so
 * does a description for a token the stylesheet no longer declares. Section
 * order on the page follows the stylesheet, not this file, so keep these keys
 * alphabetical.
 *
 * Backticks render as inline code.
 */

export const tokenGroups = [
  "type",
  "spacing",
  "figures",
  "surfaces",
  "backgrounds",
  "media",
  "chrome",
] as const

export type TokenGroup = (typeof tokenGroups)[number]

export interface TokenNote {
  group: TokenGroup
  note: string
}

export const slideTokenNotes: Record<string, TokenNote> = {
  "slide-accent-soft": {
    group: "surfaces",
    note: "The tint on a `CardGrid` accent card and a highlighted `DataTable` row",
  },
  "slide-body-size": {
    group: "type",
    note: "Bullet copy, the main text of a slide",
  },
  "slide-chrome-border": {
    group: "chrome",
    note: "The rules above the footer and below the header",
  },
  "slide-chrome-emphasis": { group: "chrome", note: "The brand" },
  "slide-chrome-foreground": {
    group: "chrome",
    note: "Header and footer text",
  },
  "slide-chrome-gap": {
    group: "chrome",
    note: "Column gap inside header and footer",
  },
  "slide-chrome-size": { group: "chrome", note: "Chrome type size" },
  "slide-chrome-tracking": {
    group: "chrome",
    note: "Letter spacing on the counter",
  },
  "slide-code-size": { group: "type", note: "Type inside a `CodeBlock`" },
  "slide-content-gap": {
    group: "spacing",
    note: "The rhythm between blocks inside a slide",
  },
  "slide-figure-size": { group: "figures", note: "A `StatGrid` figure" },
  "slide-figure-unit-size": { group: "figures", note: "The unit suffix on it" },
  "slide-font-body": { group: "type", note: "Body copy and the chrome" },
  "slide-font-heading": { group: "type", note: "Headings and figures" },
  "slide-font-mono": { group: "type", note: "Code" },
  "slide-footer-space": {
    group: "chrome",
    note: "Canvas padding reserved for the footer",
  },
  "slide-grid-color": {
    group: "backgrounds",
    note: "The rule color for the `grid` variant",
  },
  "slide-grid-size": { group: "backgrounds", note: "The grid pitch" },
  "slide-halo": {
    group: "backgrounds",
    note: "The `text-shadow` a theme puts behind display type",
  },
  "slide-hatch": {
    group: "backgrounds",
    note: "A diagonal fill, which the `spotlight` variant uses",
  },
  "slide-header-space": {
    group: "chrome",
    note: "Canvas padding reserved for the header",
  },
  "slide-heading-size": {
    group: "type",
    note: "The `h1` on a content slide",
  },
  "slide-item-gap": {
    group: "spacing",
    note: "The rhythm between rows inside one block",
  },
  "slide-label-size": {
    group: "type",
    note: "Eyebrows and other uppercase labels",
  },
  "slide-label-tracking": {
    group: "type",
    note: "Letter spacing on those labels",
  },
  "slide-lead-size": { group: "type", note: "The sentence under a headline" },
  "slide-media-foreground": { group: "media", note: "Text over photography" },
  "slide-media-foreground-muted": {
    group: "media",
    note: "Secondary text over photography",
  },
  "slide-media-overlay-medium": { group: "media", note: '`overlay="medium"`' },
  "slide-media-overlay-strong": { group: "media", note: '`overlay="strong"`' },
  "slide-media-overlay-subtle": { group: "media", note: '`overlay="subtle"`' },
  "slide-meter-size": {
    group: "figures",
    note: "The height of the proportion bar under it",
  },
  "slide-padding-block": {
    group: "spacing",
    note: "Top and bottom padding when the slide has no header or footer",
  },
  "slide-padding-inline": {
    group: "spacing",
    note: "The gutter on both sides of the frame, and inside the canvas header",
  },
  "slide-progress-fill": { group: "chrome", note: "The filled portion" },
  "slide-progress-track": {
    group: "chrome",
    note: "The progress element's own background",
  },
  "slide-radius": {
    group: "surfaces",
    note: "Cards, code blocks, small panels",
  },
  "slide-radius-lg": {
    group: "surfaces",
    note: "The `ContentSlideCard` panel",
  },
  "slide-rail-size": {
    group: "spacing",
    note: "The fixed side column on `HeroSplitSlide` and `ProseSlide`",
  },
  "slide-rule": {
    group: "backgrounds",
    note: "Hairlines a theme draws on the sheet, such as corner brackets",
  },
  "slide-scanline": {
    group: "backgrounds",
    note: "A repeating line mask over the canvas",
  },
  "slide-subheading-size": { group: "type", note: "An `h2` inside a body" },
  "slide-support-size": {
    group: "type",
    note: "Captions, grid copy, metadata rows",
  },
  "slide-surface": {
    group: "surfaces",
    note: "The raised surface a panel paints",
  },
  "slide-surface-border": {
    group: "surfaces",
    note: "Panel borders, the `StatGrid` rule",
  },
  "slide-surface-muted": {
    group: "surfaces",
    note: "`FeatureGrid` cards, secondary panels",
  },
  "slide-surface-shadow": {
    group: "surfaces",
    note: "Depth under a panel, where the theme wants it",
  },
  "slide-title-size": { group: "type", note: "Hero and breaker headlines" },
}
