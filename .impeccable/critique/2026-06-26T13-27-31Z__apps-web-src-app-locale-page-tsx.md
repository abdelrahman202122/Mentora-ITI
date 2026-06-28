---
target: apps/web/src/app/[locale]/page.tsx
total_score: 14
p0_count: 0
p1_count: 3
timestamp: 2026-06-26T13-27-31Z
slug: apps-web-src-app-locale-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Header has auth loading, but most CTAs and newsletter actions do not confirm state or outcome. |
| 2 | Match System / Real World | 2 | Copy switches between mentor, tutor, teacher, clients, students, and even job language. |
| 3 | User Control and Freedom | 2 | Static navigation exists, but carousels autoplay without visible controls and final CTA has no destination. |
| 4 | Consistency and Standards | 1 | Product/shadcn vocabulary is mixed with large marketing cards, gradients, heavy shadows, and custom button overrides. |
| 5 | Error Prevention | 1 | Newsletter and CTA actions do not prevent or explain failed/empty states; auth/logout errors only log to console. |
| 6 | Recognition Rather Than Recall | 2 | Main CTA is visible, but users must infer whether Browse Mentors, AI matching, and Start Learning are the same flow. |
| 7 | Flexibility and Efficiency | 1 | No direct search or AI entry remains in the hero, and carousels hide controls. |
| 8 | Aesthetic and Minimalist Design | 1 | Repeated icon-card sections, oversized radii, gradients, and heavy shadows dilute focus. |
| 9 | Error Recovery | 1 | User-facing recovery is mostly absent; failed logout/newsletter states are not visible. |
| 10 | Help and Documentation | 1 | Footer has Help Center text, but no contextual guidance or reassurance on the page. |
| **Total** | | **14/40** | **Poor: the page has a basic structure, but the visual system and message need a serious pass.** |

#### Anti-Patterns Verdict

**LLM assessment:** The homepage currently does read as AI-assisted template work. The strongest tells are repeated icon-card grids, generic section rhythm, over-rounded containers, large decorative shadows, autoplay carousels without controls, and a dark gradient CTA/footer treatment that conflicts with the new Mentora product design system. It also violates Mentora's own anti-reference: the AI/tutor discovery story is vague, and the page leans into generic SaaS/education landing patterns instead of a specific learning marketplace voice.

**Deterministic scan:** The bundled detector found 3 warnings:

- `apps/web/src/components/home/Footer.tsx:124` � `gradient-text`
- `apps/web/src/components/home/Footer.tsx:121` � `ai-color-palette`
- `apps/web/src/components/home/StartLearning.tsx:8` � `ai-color-palette`

These match the design review. No false positives: gradient text and indigo/violet dark gradients are explicitly against the new DESIGN.md rules.

**Visual overlays:** No reliable user-visible overlay is available in this run. Browser automation was not exposed through Codex tools, and a bounded Playwright CLI attempt failed because the Chromium executable is not installed locally.

#### Overall Impression

The page has the right broad sequence: header, hero, subjects, grades, process, testimonials, CTA, footer. The problem is that those sections do not yet feel like one trustworthy product. They feel stitched together from separate landing-page examples. The biggest opportunity is to turn the homepage from a generic education landing page into a focused tutor-discovery entry point: one clear promise, one primary path, restrained visuals, and language that matches the actual product.

#### What's Working

- The page gives learners several familiar landmarks: hero, subject browse, grade levels, how it works, testimonials, and final CTA.
- The primary indigo accent is present across the page, so there is at least a recognizable brand color to refine.
- The three-step Search / Chat / Book model is understandable and maps well to Mentora's real backend/chat/booking flow.

#### Priority Issues

**[P1] The homepage message is inconsistent.**

**Why it matters:** A learner should immediately understand whether Mentora offers tutors, mentors, teachers, AI matching, or job help. Current copy uses all of those signals: "mentor," "teacher," "tutor," "clients," "students," and "Catch Your Dream Job." That weakens trust at the exact moment the product needs confidence.

**Fix:** Pick one vocabulary system. For Mentora, use "tutor" for providers, "learner" or "student" for customers, and reserve "AI" for the assistant/matching flow. Remove job-related copy from the hero badge.

**Suggested command:** `$impeccable clarify apps/web/src/components/home`

**[P1] The visual system violates the new Mentora design rules.**

**Why it matters:** `DESIGN.md` says restrained product UI, no generic AI gradients, ring-first cards, and indigo used with restraint. The homepage still uses gradient text, violet/indigo dark gradients, shadow-heavy cards, 3xl rounding, and decorative blur effects. This makes the public face of the product contradict the design system.

**Fix:** Replace the dark gradient CTA/footer with solid or tonal surfaces. Remove gradient text. Reduce card radii to the documented 10-14px range. Use rings/borders before shadows.

**Suggested command:** `$impeccable quieter apps/web/src/components/home`

**[P1] The primary action path is unclear.**

**Why it matters:** The hero says users can browse or let AI find a match, but only exposes "Browse Mentors." The commented-out search/AI input suggests the intended entry point was abandoned. The final "Get Started Today" button has no link or handler. A motivated learner can hit a dead end.

**Fix:** Define two clear primary paths: "Find a tutor" and "Ask AI to match me," or choose one. Make the final CTA link to the same primary path. Avoid visually advertising unavailable functionality.

**Suggested command:** `$impeccable shape apps/web/src/app/[locale]/page.tsx`

**[P2] Repeated icon-card sections create template fatigue.**

**Why it matters:** Subjects, grade levels, and how-it-works all rely on centered icon blocks with similar spacing and motion. That sameness makes the page feel generic and forces users to scan repeated decoration instead of meaningful tutor-discovery information.

**Fix:** Give each section a distinct job. Subjects can be compact filters or chips. Grade levels can become a concise horizontal selector. How-it-works can stay as the only true sequence.

**Suggested command:** `$impeccable layout apps/web/src/components/home`

**[P2] Autoplay carousels reduce user control and hurt accessibility.**

**Why it matters:** Subjects and testimonials move automatically, and visible previous/next controls are intentionally removed. This is frustrating for slower readers, keyboard users, and users with reduced-motion needs.

**Fix:** Remove autoplay or expose clear carousel controls. Honor reduced motion. Let testimonials be read at the user's pace.

**Suggested command:** `$impeccable audit apps/web/src/components/home`

#### Persona Red Flags

**Jordan (First-Timer):** Jordan lands on the page and sees "mentor," "teacher," "tutor," "clients," and "students." They cannot confidently tell what Mentora calls the person they are hiring. The hero promises AI matching, but the only action says Browse Mentors. The floating badge says Mentora helps with a dream job, which sounds like career coaching rather than tutoring.

**Sam (Accessibility-Dependent User):** Sam encounters autoplay carousels without visible controls. Motion is used in multiple sections without a visible reduced-motion alternative. Several interactive or CTA-looking elements are visually prominent but not always functional, especially the final Start Learning button. Color and motion are doing too much of the communication.

**Casey (Distracted Mobile User):** Casey sees a long stacked landing page with multiple repeated sections before getting a second clear action. The final CTA is full width on mobile but has no route. The top header can become crowded with Become a Mentor, Dashboard, and Logout states, creating a heavy first viewport for authenticated mobile users.

#### Minor Observations

- `apps/web/src/app/[locale]/page.tsx` has inconsistent formatting and mixed relative/alias imports.
- `Hero.tsx` has unused imports and a commented-out search block, which suggests unresolved product direction.
- The home components contain many mojibake Arabic comments, making maintenance harder.
- Footer social icons are hand-rolled SVGs while the rest of the app uses lucide; consistency would improve if they were standardized.
- Testimonials are generic and do not establish marketplace trust: no ratings source, tutor profile link, or context.

#### Questions to Consider

- What if the homepage's only job were to get a learner to the best tutor search path within 5 seconds?
- Does the page need both subjects and grade levels as large visual sections, or should one become a compact filter preview?
- What would a more confident Mentora sound like if it stopped saying "AI" as a selling point and started showing why matches are trustworthy?
- Should authenticated users see the marketing homepage at all, or should they get a role-aware dashboard/home redirect?
