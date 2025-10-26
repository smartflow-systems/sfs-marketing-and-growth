# SmartFlow Systems Design Guidelines

## Design Approach
Luxury SaaS dashboard combining Linear's precision, Stripe's sophistication, and Apple's restraint. Premium dark interface with gold accents, glassmorphism depth, and tech-forward aesthetics. Reference Notion for dashboard layouts, Figma for tool organization, and high-end fintech apps for the premium feel.

## Core Design Principles
- **Luxurious Minimalism**: Every element purposeful, elevated through gold accents and glass effects
- **Depth Through Layers**: Glassmorphism creates spatial hierarchy without clutter
- **Restrained Animation**: Subtle, purposeful motion that enhances rather than distracts
- **Tech Premium**: Circuit patterns and flowing paths suggest advanced technology

## Typography System

**Font Families**:
- Primary: Inter (300, 400, 500, 600, 700)
- Monospace: JetBrains Mono (400, 500, 600)

**Hierarchy**:
- H1: 56px/60px, weight 700, gold gradient (#FFD700 → #E6C200)
- H2: 40px/44px, weight 600, gold gradient
- H3: 32px/36px, weight 600, solid #FFD700
- H4: 24px/28px, weight 600, #E6C200
- Body Large: 18px/28px, weight 400, rgba(255,255,255,0.9)
- Body: 16px/24px, weight 400, rgba(255,255,255,0.8)
- Body Small: 14px/20px, weight 400, rgba(255,255,255,0.7)
- Caption: 12px/16px, weight 500, rgba(255,255,255,0.6)
- Code: JetBrains Mono 14px/20px, weight 400

## Layout System

**Spacing Scale**: Use Tailwind units 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32 for consistent rhythm

**Grid Structure**:
- Dashboard: Sidebar 280px fixed, main content flex-1 with max-w-7xl
- Cards: 2-column (lg:grid-cols-2), 3-column (xl:grid-cols-3) responsive grids
- Container padding: px-6 md:px-8 lg:px-12
- Section spacing: py-16 md:py-20 lg:py-24

## Background & Atmosphere

**Base**: #0D0D0D solid background

**Circuit Animation Layer**:
- Flowing geometric circuit patterns across viewport
- Animated golden paths (#FFD700 at 15% opacity)
- Subtle glow effects along paths
- Slow, continuous movement creating depth

**Noise Texture**: 3% opacity grain overlay for premium feel

## Glassmorphism Components

**Glass Card Standard**:
- Background: rgba(255, 215, 0, 0.03)
- Backdrop blur: 24px
- Border: 1px solid rgba(255, 215, 0, 0.22)
- Border radius: 16px
- Padding: p-6 to p-8

**Elevated Glass** (hover states, modals):
- Background: rgba(255, 215, 0, 0.05)
- Border: 1px solid rgba(255, 215, 0, 0.35)
- Shadow: 0 8px 32px rgba(255, 215, 0, 0.12)

**Sidebar Glass**:
- Background: rgba(13, 13, 13, 0.8)
- Backdrop blur: 40px
- Right border: 1px solid rgba(255, 215, 0, 0.15)

## Component Library

### Navigation
**Top Bar**: 64px height, glass background, logo left, user profile/notifications right with gold icon highlights

**Sidebar**: 
- Fixed 280px width, glass treatment
- Nav items: p-3, rounded-lg, gold underline active state
- Icon + label layout with 12px gap
- Hover: rgba(255, 215, 0, 0.08) background

### Buttons
**Primary**: Gold gradient background (#FFD700 → #E6C200), black text (900 weight), rounded-lg, px-6 py-3
**Secondary**: Transparent with gold border (2px), gold text, glass hover state
**Ghost**: Gold text only, glass background on hover
**On-Image Buttons**: Backdrop blur 16px, rgba(255, 215, 0, 0.12) background, white text, gold border 1px

### Form Inputs
**Text Fields**:
- Glass card background
- Gold border at 15% opacity
- Focus: border gold 40% opacity, subtle gold glow
- Placeholder: rgba(255, 255, 255, 0.4)
- Padding: px-4 py-3

**Dropdowns/Selects**: Match text field styling, gold chevron icon

**Checkboxes/Radio**: Custom glass design with gold checked state

### Data Display
**Tables**:
- Glass card container
- Header row: slightly elevated glass, gold text
- Rows: border-b gold 8% opacity, hover gold 5% background
- Alternating subtle row background for density

**Cards** (salon/service items):
- Standard glass treatment
- 16px padding
- Stacked content: image/icon → title (H4) → description (body small) → action
- Hover: elevated glass state with subtle lift

**Stats/Metrics**:
- Large gold gradient numbers (H1 sizing)
- Label in caption weight below
- Contained in glass cards

### Dashboard Widgets
**Chart Containers**: Large glass cards (p-8), gold accent lines/data points in charts

**Activity Feed**: List with timestamp (caption) + description (body), gold dot indicators for status

**Quick Actions**: 3-4 column grid of glass cards with centered icon, title, hover elevation

## Images

**Hero Section**: Full-width hero (70vh) with luxury salon interior image showing modern design, ambient lighting, premium equipment. Image should convey sophistication and technology. Overlay: dark gradient from bottom (rgba(13,13,13,0.8) to transparent). Centered content with H1 headline, subtitle, CTA buttons with blurred backgrounds.

**Dashboard Cards**: Service/appointment thumbnails at 16:9 ratio, rounded-lg, subtle gold border glow

**Empty States**: Minimalist illustrations with gold line art on dark background

## Premium Effects

**Gold Glow**: Use sparingly on active elements - box-shadow with gold at 20% opacity, 8px blur

**Hover Transitions**: 200ms ease-out for all interactive elements

**Card Elevation**: Transform translateY(-2px) on hover with shadow enhancement

**Gradient Shimmer** (optional accent): Subtle animated gold gradient on premium badges/tags

## Accessibility

- Maintain 4.5:1 contrast ratio (white text on dark background achieves this)
- Gold borders must be accompanied by other visual indicators (icons, text)
- Focus states: 2px gold outline with 4px offset
- Interactive elements minimum 44x44px touch target

## Icon System

Use Heroicons (outline style) with gold stroke (#FFD700) throughout. Size: 20px for inline, 24px for standalone, 32px for feature cards.