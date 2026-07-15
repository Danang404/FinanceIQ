---
name: Luminous Finance
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#bbcabe'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#869489'
  outline-variant: '#3d4a41'
  surface-tint: '#51df9c'
  primary: '#60eca8'
  on-primary: '#003822'
  primary-container: '#3ecf8e'
  on-primary-container: '#005434'
  inverse-primary: '#006c45'
  secondary: '#ffb952'
  on-secondary: '#452b00'
  secondary-container: '#c48410'
  on-secondary-container: '#3c2500'
  tertiary: '#ffc6b8'
  on-tertiary: '#5f1503'
  tertiary-container: '#ff9e86'
  on-tertiary-container: '#802d18'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#71fcb6'
  primary-fixed-dim: '#51df9c'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#005233'
  secondary-fixed: '#ffddb3'
  secondary-fixed-dim: '#ffb952'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0700'
  on-tertiary-fixed-variant: '#7e2c17'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 20px
  stack-gap-sm: 8px
  stack-gap-md: 16px
  stack-gap-lg: 24px
  glass-padding: 16px
---

## Brand & Style
The design system is centered on a "Guiding Light" philosophy. It balances the high-tech precision of AI with the approachability of a personal mentor. The aesthetic leverages **Glassmorphism** to create a sense of depth and transparency, suggesting honesty and clarity in financial matters. 

The experience is mobile-first, prioritizing thumb-friendly interactions and a calm, immersive environment. By using deep, near-black backgrounds paired with vibrant emerald accents, the UI evokes a feeling of quiet growth and steady progress. The tone is supportive and conversational, specifically tailored for an Indonesian audience that values gentle guidance over aggressive financial jargon.

## Colors
The palette is rooted in a deep navy foundation to reduce eye strain and provide a premium, "night-mode" default experience. 

- **Primary (Emerald Green):** Represents wealth growth and successful transactions. Use for main actions and positive trend indicators.
- **Secondary (Warm Amber):** Reserved for "Wawasan" (Insights) and educational moments. It provides a warm contrast to the cool background.
- **Alert (Soft Coral):** Used for attention-seeking states that aren't necessarily errors, such as upcoming bills or budget limits.
- **Surface:** Surfaces are never solid. They are translucent glass layers that allow the subtle radial background gradient to peek through, creating a sense of physical layering.

## Typography
The typography system uses a dual-font approach to balance personality with readability. 

**Sora** is the voice of the brand. It is used for all headings and large numerical data (like account balances) to provide a modern, geometric, and distinctively "tech-forward" feel. 

**Inter** handles the heavy lifting of the conversational AI interface. It is chosen for its exceptional legibility at small sizes and its neutral character, which allows the AI’s guidance to feel humble and clear. Avoid all-caps for body text; keep it sentence-case to maintain the friendly, non-judgmental tone.

## Layout & Spacing
This design system follows a fluid-width model tailored for mobile devices. The standard horizontal margin is 20px. 

Elements are organized in a vertical stack with a baseline 8px grid system. For chat bubbles and glass cards, internal padding should be consistent at 16px to ensure content doesn't feel cramped against the glass borders. Large sections or distinct "insight cards" should be separated by 24px to provide visual breathing room and emphasize the minimalist aesthetic.

## Elevation & Depth
In this system, depth is expressed through **Backdrop Blur** rather than traditional shadows. 

1.  **Base Layer:** The deep navy background with the radial gradient.
2.  **Mid Layer (Cards):** 6% white opacity with a 12px backdrop-blur. These represent the primary content containers.
3.  **High Layer (Modals/Popovers):** 10% white opacity with a 20px backdrop-blur and a slightly brighter hairline border (0.15 opacity).

All glass elements must feature a 1px "hairline" border to define their edges against the dark background, simulating the way light catches the edge of a physical pane of glass.

## Shapes
The shape language is soft and organic. Main container cards use a **24px** radius (rounded-xl) to feel approachable. Interactive elements like buttons and category chips use a **Pill-shaped** (fully rounded) construction. 

Avoid sharp 90-degree corners entirely, as they conflict with the "warm and guiding" brand personality. Simple, thin-stroke line icons (2px stroke weight) should be used, echoing the geometric curves of the Sora typeface.

## Components

### Buttons
- **Primary:** Pill-shaped, solid Emerald Green (#3ECF8E) with dark navy text. No shadows; the glow comes from the color vibrance.
- **Ghost/Glass:** Pill-shaped, transparent with a 1px white border (0.2 opacity). Used for secondary actions.

### Cards & Chat Bubbles
- **User Message:** Solid deep navy, slightly lighter than the background, right-aligned.
- **AI Assistant Message:** Glass-morphic card, left-aligned, with a small Emerald Green dot indicator to show "active" thought.

### Input Fields
- **Search/Chat Input:** Full-width pill shape. Glass background (4% opacity) with a subtle 1px border. Placeholder text should be a muted grey-blue to maintain low contrast.

### Chips & Badges
- Used for categories (e.g., "Makan & Minum", "Tabungan"). These are small pill shapes with a glass background. If a category is "active" or "highlighted," use a subtle tint of the Primary or Secondary color at 15% opacity for the chip background.

### Lists
- Financial transactions should be displayed in a clean list without horizontal separators. Use vertical spacing and the glass card container to group transactions by date.