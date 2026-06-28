# BE4 AI Fallback Limitations

## Purpose

Document what the AI tutor finder can and cannot do when `OPENAI_API_KEY` is
missing or the OpenAI provider fails.

This helps FE4 and QA test the feature correctly without assuming the fallback
assistant can extract structured tutor preferences from free text.

## Current Behavior

The AI feature has two separate parts:

- AI conversation reply: generates a conversational assistant message.
- Tutor recommendation engine: ranks tutors using structured criteria.

When OpenAI is unavailable, the backend still returns a fallback assistant reply.
However, the fallback reply does not extract subject, level, curriculum,
language, or budget from free text.

Recommendations depend mainly on the structured fields sent to
`POST /api/ai/recommendations`.

## What Works Without OpenAI

The backend still supports:

- Starting an AI conversation.
- Saving the learner message.
- Returning a fallback assistant message.
- Logging the AI provider status as `fallback`.
- Returning tutor recommendations when the frontend sends structured criteria.

Example reliable recommendation request without OpenAI:

```json
{
  "conversationId": "CONVERSATION_ID",
  "query": "math",
  "category": "mathematics",
  "educationLevel": "secondary",
  "curriculum": "igcse",
  "languages": ["English"],
  "maxHourlyRate": 300,
  "limit": 5
}
```

Expected result:

- Recommendations can still be returned.
- `criteria` echoes the structured fields.
- The assistant message metadata may show `provider: "fallback"` and
  `model: null`.

## What Requires OpenAI

OpenAI is required for:

- Natural conversational replies beyond the hardcoded fallback.
- Better follow-up questions based on the learner goal.
- Language-aware assistant wording beyond simple fallback behavior.

OpenAI does not currently power tutor ranking directly. The backend matching
engine ranks tutors from database data and structured criteria.

## What Is Not Implemented Yet

The backend does not currently perform reliable free-text preference extraction.

This means a learner message like:

```text
I need help with IGCSE math. I prefer English and my budget is 300 EGP.
```

does not automatically become:

```json
{
  "query": "math",
  "category": "mathematics",
  "educationLevel": "secondary",
  "curriculum": "igcse",
  "languages": ["English"],
  "maxHourlyRate": 300
}
```

The frontend must send those structured fields separately for reliable matching.

## Fields FE4 Should Send

For reliable recommendations, FE4 should send as many of these fields as the UI
can collect:

- `query`: free-text subject keyword, for example `"math"`.
- `category`: backend category value, for example `"mathematics"`.
- `educationLevel`: backend education-level value, for example `"secondary"`.
- `curriculum`: backend curriculum value, for example `"igcse"`.
- `languages`: only languages explicitly entered or selected by the learner.
- `maxHourlyRate`: learner budget as a number.
- `limit`: number of recommendations to return, default `5`, maximum `20`.

Important:

- Do not send `"English"` by default unless the learner explicitly selected it.
- Do not depend on the assistant reply to create recommendation filters.
- Use metadata/category endpoints for allowed enum values when building filters.

## QA Test Cases

### Test 1: Missing OpenAI Key With Structured Criteria

Setup:

- Remove or unset `OPENAI_API_KEY`.
- Restart the API.
- Use seed data containing a tutor matching the criteria.

Steps:

1. Start an AI conversation.
2. Send an AI message.
3. Request recommendations with structured criteria.

Expected:

- Assistant reply uses fallback provider.
- Recommendations still return if database data matches the criteria.
- No server error occurs.

### Test 2: Missing OpenAI Key With Free Text Only

Setup:

- Remove or unset `OPENAI_API_KEY`.

Request recommendations with only:

```json
{
  "conversationId": "CONVERSATION_ID",
  "query": "I need help with IGCSE math in English under 300 EGP",
  "limit": 5
}
```

Expected:

- Results may be broad or empty.
- The backend does not reliably infer `curriculum`, `language`, or budget.
- This is expected behavior, not a bug.

### Test 3: OpenAI Enabled

Setup:

- Configure a valid `OPENAI_API_KEY`.
- Restart the API.

Steps:

1. Start an AI conversation.
2. Send a learner message.
3. Request recommendations with structured criteria.

Expected:

- Assistant reply metadata shows provider `openai`.
- Recommendations still depend on structured criteria.
- Tutor ranking remains deterministic from the matching engine.

### Test 4: OpenAI Failure

Setup:

- Configure an invalid OpenAI key or block the provider request.

Expected:

- Backend returns fallback assistant message.
- AI log records fallback/failure details.
- Recommendation request still works when structured criteria is supplied.

## Acceptance Criteria

- FE4 knows the frontend must send structured recommendation criteria.
- QA can test AI with and without `OPENAI_API_KEY`.
- Fallback provider behavior is treated as degraded-but-usable, not as total
  feature failure.
- Free-text extraction is documented as not implemented yet.
