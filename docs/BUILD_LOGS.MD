# Rythm - Build Logs

Append-only log of completed work slices. Every agent should add an entry when a task is finished, even if the change is small.

---

## 2026-05-03 - Landing Page Polish Pass

- Polished [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) while preserving the documented landing sequence from [docs/landing-page.html](./landing-page.html).
- Improved hero responsiveness with `svh`, removed the forced heading class, enlarged CTA hit areas, and kept the product preview anchored at the bottom of the first screen.
- Replaced the inert mobile hamburger button with a CSS-only mobile navigation dropdown while keeping the primary CTA visible.
- Cleaned the hero product mock by fixing the encoded streak marker, tightening the responsive app-preview grid, and adding an accessible product-preview label.
- Added section scroll offsets, stronger section-label tracking, proof/table/FAQ polish, and footer link hover states.
- Verified with `npx eslint components/marketing/landing-page.tsx` and an HTTP check against `http://localhost:3000` returning status `200`.

## 2026-05-03 - Landing Comparison Key Fix

- Fixed duplicate React keys in the landing comparison table in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) by keying table cells with row label and column index instead of repeated cell text.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Hero CTA And Preview Position

- Increased the hero CTA button text size in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx).
- Adjusted the hero layout so the app preview fills the remaining hero space and sits flush toward the bottom before the next landing section.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Hero Preview Buildout

- Replaced the hero placeholder text in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) with an actual Today preview mock inside the dashed product frame.
- Set the hero section to `min-h-[calc(100vh-73px)]` so the hero fills the first screen under the sticky header before the proof and content sections appear on scroll.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Hero Simplification

- Updated the hero in [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) to match the simpler mockup: headline, supporting copy, CTA pair, risk note, and one large dashed product-preview frame.
- Removed the nested hero stage navigation and product mock that made the page show two taskbar/nav-like areas.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Page Wireframe Alignment

- Rebuilt [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) to follow [docs/landing-page.html](./landing-page.html) as the implementation source.
- Added the wireframed public landing sequence: sticky nav, staged hero, proof strip, problem framing, solution line, core features, Today / Structure / History deep dives, workflow, comparison table, testimonials and metrics, pricing, FAQ, final CTA, and footer.
- Carried over the wireframe's placeholder proof, testimonials, and pricing language so the live page matches the current copy deck.
- Kept styling within the existing slate marketing token system and reused local UI primitives.
- Verified the landing component with `npx eslint components/marketing/landing-page.tsx`.

## 2026-05-03 - Landing Page First Pass

- Reworked [components/marketing/landing-page.tsx](../components/marketing/landing-page.tsx) from a lighter hero page into a fuller staged landing page.
- Replaced the old marketing structure with a sticky header, stronger hero, product preview, problem/solution section, product deep dives, workflow section, mobile/PWA section, FAQ, and final CTA.
- Aligned the landing copy and layout more closely with the canonical product tone: calm, structured, honest, and product-led.
- Kept the implementation inside the existing design-token system rather than introducing a new visual language.
- Verification was partially blocked because local project dependencies were not installed, so `eslint` could not run from the repo.
