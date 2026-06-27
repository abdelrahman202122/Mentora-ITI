---
name: Mentora
description: A trustworthy, modern, friendly education marketplace workspace.
colors:
  primary: "oklch(0.457 0.24 264.376)"
  primary-strong: "oklch(0.428 0.222 283.45)"
  primary-soft: "oklch(0.95 0.05 264.376)"
  background: "oklch(0.97 0 0)"
  foreground: "oklch(0.145 0 0)"
  surface: "oklch(1 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  border: "oklch(0.922 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Plus Jakarta Sans, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Plus Jakarta Sans, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
---

# Design System: Mentora

## 1. Overview

**Creative North Star: "The Guided Learning Workspace"**

Mentora should feel like a focused workspace for making good education decisions: calm enough for repeated use, clear enough for high-trust actions, and friendly enough that learners do not feel alone while comparing tutors, booking sessions, chatting, or using AI recommendations.

The visual system is restrained product UI. Indigo carries the primary action and active-state vocabulary, while white and neutral surfaces keep dashboards, forms, chat, and tutor discovery easy to scan. The product should never look like a generic AI SaaS surface; AI features should feel integrated into learning workflows rather than advertised through decorative gradients or vague automation language.

**Key Characteristics:**

- Familiar controls with predictable hover, focus, loading, disabled, and error states.
- Compact layouts that support dashboards, forms, chat, and marketplace browsing.
- Indigo accents used for action, selection, and guidance rather than decoration.
- Friendly copy and supportive empty states instead of ornamental visual effects.
- Localization-aware spacing and hierarchy for English now and Arabic/RTL later.

## 2. Colors

The palette is a restrained indigo product system: one confident accent, neutral work surfaces, and semantic red only for destructive or error states.

### Primary

- **Mentora Indigo** (`primary`): Used for primary actions, current selection, focus rings, active navigation, and high-confidence guidance moments.
- **Deep Mentora Indigo** (`primary-strong`): Used for pressed states and darker emphasis when the primary action needs more contrast.
- **Guidance Tint** (`primary-soft`): Used for selected backgrounds, subtle callouts, hover surfaces, and low-intensity AI or tutor-match hints.

### Neutral

- **Quiet Canvas** (`background`): The application background. It keeps the product light without becoming warm beige or generic paper.
- **Clean Surface** (`surface`): Cards, panels, form shells, and message containers. It should stay crisp and undecorated.
- **Confident Ink** (`foreground`): Primary readable text, titles, labels, and data.
- **Muted Support** (`muted-foreground`): Secondary descriptions and helper text. Use carefully and preserve contrast.
- **Structural Line** (`border`): Dividers, card rings, input borders, and quiet boundaries between product regions.

### Tertiary

- **Error Red** (`destructive`): Validation errors, destructive actions, and failure messages. It is semantic only, never decorative.

### Named Rules

**The Indigo Earns Attention Rule.** Mentora Indigo appears on primary actions, selected states, and focus feedback. It should not be scattered across icons, badges, and decorations just to make a screen feel colorful.

**The No Generic AI Gradient Rule.** AI tutor matching must use the same product palette as the rest of Mentora. Decorative purple-blue gradients, glass cards, and automation-heavy visual tropes are prohibited.

## 3. Typography

**Display Font:** Plus Jakarta Sans with Noto Sans Arabic and system sans fallback  
**Body Font:** Plus Jakarta Sans with Noto Sans Arabic and system sans fallback  
**Label/Mono Font:** Geist Mono where technical or code-like values are needed

**Character:** Plus Jakarta Sans gives Mentora a friendlier product voice than Geist while staying polished and readable. Noto Sans Arabic keeps the same calm clarity for future Arabic and RTL surfaces. The type system should feel clean, readable, and practical, with hierarchy coming from weight and spacing more than dramatic font changes.

### Hierarchy

- **Display** (800, `3rem`, `1`): Landing-page hero headings and rare high-impact section titles only.
- **Headline** (700, `1.5rem`, `1.25`): Page titles, dashboard section headers, and important empty-state headings.
- **Title** (600, `1rem`, `1.375`): Card titles, chat headers, tutor names, and panel headings.
- **Body** (400, `0.875rem`, `1.5`): Product copy, descriptions, chat text, and form helper content. Keep long prose to roughly 65-75 characters per line.
- **Label** (500, `0.875rem`, `1.25`): Buttons, form labels, tabs, filters, and compact navigation labels.

### Named Rules

**The Product Scale Rule.** Product surfaces use fixed, compact rem sizes. Avoid fluid hero typography inside dashboards, chat, forms, and sidebars.

**The Friendly Clarity Rule.** Copy should sound supportive and direct. Avoid vague AI promises, hype language, and empty marketing adjectives.

## 4. Elevation

Mentora is layered but restrained. Depth is mostly conveyed through white surfaces, neutral backgrounds, subtle rings, and borders. Shadows may appear on landing-page media, dropdowns, and elevated overlays, but product cards should stay flat by default.

### Shadow Vocabulary

- **Surface Ring** (`ring-1 ring-foreground/10`): The default boundary for cards and panels.
- **Soft Panel Shadow** (`shadow-sm`): Used sparingly for message composers, lightweight floating panels, and subtle separation.
- **Hero Media Shadow** (`shadow-lg` / `shadow-xl`): Reserved for marketing imagery or high-emphasis visual moments, not repeated dashboard cards.

### Named Rules

**The Flat-By-Default Rule.** Product surfaces are not lifted unless the state or interaction needs it. If every card has a visible drop shadow, the screen is too noisy.

## 5. Components

### Buttons

- **Shape:** Gently rounded rectangles (`8px`, with smaller variants at `6px`).
- **Primary:** Mentora Indigo background, white text, compact height (`32px`) and medium label weight.
- **Hover / Focus:** Hover darkens or softens the background; focus uses a visible indigo ring. Disabled state reduces opacity and blocks pointer interaction.
- **Secondary / Ghost / Outline:** Secondary uses Guidance Tint, outline uses Structural Line, ghost relies on hover fill only. These variants must stay visually quieter than primary.

### Chips

- **Style:** Use Guidance Tint or neutral muted surfaces with indigo or foreground text.
- **State:** Selected chips should clearly differ through fill and text color, not only border color.

### Cards / Containers

- **Corner Style:** Soft product radius (`14px` for cards, `10px` for panels).
- **Background:** Clean Surface on Quiet Canvas.
- **Shadow Strategy:** Ring-first, shadow-second. Cards use a subtle ring by default.
- **Border:** Structural Line or foreground transparency at low intensity.
- **Internal Padding:** Default card spacing is `16px`; compact cards use `12px`.

### Inputs / Fields

- **Style:** Transparent or white background, Structural Line border, `8px` radius, compact `32px` height.
- **Focus:** Border shifts to Mentora Indigo with a visible soft ring.
- **Error / Disabled:** Error uses Error Red border and ring. Disabled fields reduce opacity and use a muted background.

### Navigation

Navigation should be simple and familiar: brand text in Mentora Indigo, neutral links, and indigo hover/active states. Sidebars and top bars should prioritize scan speed over decoration, especially for learner and tutor dashboards.

### Chat Surfaces

Chat uses the same product vocabulary: own messages use Mentora Indigo, incoming messages use neutral muted surfaces, and message metadata stays quiet. Message actions should never disrupt the conversation flow.

### AI Tutor Finder

AI recommendations should look like guided product assistance, not a separate AI landing page. Use direct labels, clear criteria, and match reasons. The recommendation UI should explain why a tutor fits without over-promising certainty.

## 6. Do's and Don'ts

### Do:

- **Do** use Mentora Indigo for primary actions, active navigation, focus rings, and selected states.
- **Do** keep dashboard, chat, tutor discovery, booking, and payment surfaces compact and predictable.
- **Do** use clear loading, empty, error, and disabled states before adding visual flourish.
- **Do** keep component states consistent across learner, tutor, and admin surfaces.
- **Do** preserve readable contrast for helper text, placeholders, and muted metadata.

### Don't:

- **Don't** make Mentora feel like a generic AI SaaS product.
- **Don't** use decorative AI gradients, glassmorphism, or vague automation-heavy hero copy for tutor matching.
- **Don't** decorate cards with colored side stripes, oversized shadows, or excessive rounding.
- **Don't** invent custom controls where standard buttons, inputs, tabs, selects, and menus already solve the task.
- **Don't** use indigo as decoration on every icon, card, and heading. Its restraint is what makes it useful.
