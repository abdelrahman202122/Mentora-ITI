# FE4 AI Stability Guardrails

## Purpose

The AI tutor finder needs design improvements, but the current priority is
keeping the existing AI flow usable while the frontend build and core learner
flows are stabilized.

This document defines what FE4 may change in stability branches and what must
wait for a separate redesign branch.

## Allowed In Stability Branches

Stability branches may include fixes that protect existing behavior:

- Fix runtime errors or unhandled promise rejections.
- Fix API contract mismatches with the current backend.
- Fix loading, error, empty, and no-results states.
- Fix broken navigation from AI recommendations to chat or tutor profiles.
- Fix React Query behavior when AI provider calls fail.
- Fix accessibility issues that block basic use, such as missing labels.
- Replace obviously broken text only when it affects user understanding.

## Not Allowed In Stability Branches

These changes must wait for a separate AI redesign branch:

- Full visual redesign of `AITutorFinder`.
- Major layout restructuring.
- New animation systems.
- New recommendation card designs.
- New AI interaction patterns.
- New multi-step onboarding flows.
- Palette, typography, or brand direction changes unrelated to a bug.

## Branch Rules

- Stability fixes use focused FE4 branches, for example:
  - `FE4/fix-ai-no-results-reply`
  - `FE4/fix-ai-chat-start-error`
- Redesign work must use a separate branch, for example:
  - `FE4/redesign-ai-tutor-finder`
- Do not mix AI redesign work with build fixes, booking fixes, auth fixes, or
  unrelated cleanup.

## Validation Checklist

Before opening an AI stability PR, verify:

- The AI assistant page still renders.
- A normal recommendation request still returns tutor results when matching seed
  data exists.
- A no-results request still shows a useful assistant response.
- Backend/provider failure does not crash the page.
- Starting a chat from a recommendation either navigates successfully or shows a
  handled error.
- The PR does not include unrelated layout, theme, or redesign changes.

## Acceptance Criteria

- AI remains usable.
- Stability fixes are small and focused.
- Redesign work is isolated in a future redesign branch.
- Reviewers can clearly tell whether a PR is a bug fix or design work.
