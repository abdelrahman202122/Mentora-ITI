# Validation System — Developer Reference

> BE3 · Request Validation · Zod + Express

---

## 1. Architecture Overview

The validation system intercepts every incoming HTTP request before it reaches any route handler. It uses Zod schemas to parse, coerce, and validate request data, then either passes clean data downstream or routes errors to the central error handler.

The system is split into three layers:

| Layer           | File                                      | Responsibility                                                              |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Engine          | `validation_middleware.ts`                | `validate()` factory — runs schemas against `req.body` / `params` / `query` |
| Shared Schemas  | `common.ts`                               | Reusable building blocks: IDs, pagination, dates, ratings, currency         |
| Feature Schemas | `booking.ts` / `payment.ts` / `review.ts` | Domain-specific schemas composed from common building blocks                |

### Request Lifecycle

```
HTTP Request  →  validate(schema)  →  Route Handler            (success)
HTTP Request  →  validate(schema)  →  next(ZodError)  →  400   (failure)
```

> **Key behavior:** On successful validation, `req.body` / `req.params` / `req.query` are **replaced** with the parsed output. This means coercions and defaults (e.g. `page` defaults to `1`) are already applied before your handler runs.

---

## 2. Available Schemas

### 2.1 Common Schemas — `common.ts`

These are shared primitives. Import them into your schema files rather than redefining them.

| Export             | Validates                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| `objectIdSchema`   | MongoDB 24-character hex ObjectId string                                               |
| `paginationSchema` | `page` (default 1), `limit` (default 10, max 100), `sortBy`, `sortOrder` (`asc\|desc`) |
| `idParamSchema`    | URL param `{ id }` as a valid ObjectId                                                 |
| `isoDateSchema`    | ISO 8601 datetime string                                                               |
| `ratingSchema`     | Integer 1–5 inclusive                                                                  |
| `currencySchema`   | 3-letter uppercase currency code (e.g. `USD`, `EGP`)                                   |

### 2.2 Booking Schemas — `booking.ts`

| Export                      | Used for                                             |
| --------------------------- | ---------------------------------------------------- |
| `createBookingSchema`       | `POST` body — new booking request                    |
| `bookingIdSchema`           | URL param `{ bookingId }`                            |
| `listBookingsSchema`        | Query — paginated list with optional `status` filter |
| `acceptBookingSchema`       | `PATCH` body — accept booking (optional tutor note)  |
| `rejectBookingSchema`       | `PATCH` body — reject booking (required tutor note)  |
| `cancelBookingSchema`       | `PATCH` body — cancel booking (optional reason)      |
| `updateBookingStatusSchema` | `PATCH` body — direct status update (admin)          |

### 2.3 Payment Schemas — `payment.ts`

| Export                 | Used for                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `createCheckoutSchema` | `POST` body — initiate payment checkout                        |
| `paymentIdSchema`      | URL param `{ paymentId }`                                      |
| `listPaymentsSchema`   | Query — paginated payments with optional `status` filter       |
| `listEarningsSchema`   | Query — paginated tutor earnings with optional `status` filter |
| `paymentWebhookSchema` | `POST` body — payment provider webhook _(placeholder, TBD)_    |

### 2.4 Review Schemas — `review.ts`

| Export               | Used for                                                             |
| -------------------- | -------------------------------------------------------------------- |
| `createReviewSchema` | `POST` body — new review (`bookingId`, `rating`, optional `comment`) |
| `reviewIdSchema`     | URL param `{ reviewId }`                                             |
| `tutorIdSchema`      | URL param `{ tutorProfileId }`                                       |
| `listReviewsSchema`  | Query — paginated reviews with optional `tutorProfileId` filter      |
| `updateReviewSchema` | `PATCH` body — update `rating` or `comment`                          |

---

## 3. How to Use With Your Routes

### 3.1 Validating the Request Body

Pass a single schema to `validate()`. It targets `req.body` by default.

```ts
import { validate } from '../middleware/validation.middleware.js';
import { createBookingSchema } from '../validation/booking.js';

router.post(
  '/bookings',
  validate(createBookingSchema),
  bookingController.create,
);
```

### 3.2 Validating URL Parameters

Pass an object with a `params` key to validate URL segments like `/:bookingId`.

```ts
import { bookingIdSchema } from '../validation/booking.js';

router.get(
  '/bookings/:bookingId',
  validate({ params: bookingIdSchema }),
  bookingController.getOne,
);
```

### 3.3 Validating Query Parameters

Pass an object with a `query` key for `?page=1&limit=20` style parameters.

```ts
import { listBookingsSchema } from '../validation/booking.js';

router.get(
  '/bookings',
  validate({ query: listBookingsSchema }),
  bookingController.list,
);
```

### 3.4 Validating Multiple Targets at Once

You can validate `body`, `params`, and `query` in a single `validate()` call.

```ts
router.patch(
  '/bookings/:bookingId/cancel',
  validate({
    params: bookingIdSchema,
    body: cancelBookingSchema,
  }),
  bookingController.cancel,
);
```

> **Note:** `validate()` is async-safe. If your schema includes async refinements (e.g. a DB uniqueness check), they work correctly because the middleware uses `safeParseAsync()` internally.

---

## 4. How to Add Schemas for Your Module

### Step 1 — Create your schema file

Create a new file under `src/validation/`, named after your module (e.g. `tutor.ts`, `message.ts`).

### Step 2 — Import from `common.ts`

Always reuse shared primitives instead of redefining them.

```ts
import { z } from 'zod';
import { objectIdSchema, paginationSchema, isoDateSchema } from './common.js';
```

### Step 3 — Define and export your schemas

Follow the naming conventions already established across the codebase.

```ts
export const createMessageSchema = z.object({
  recipientId: objectIdSchema,
  content: z.string().min(1).max(2000),
  sentAt: isoDateSchema.optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const messageIdSchema = z.object({
  messageId: objectIdSchema,
});

export type MessageIdParam = z.infer<typeof messageIdSchema>;

export const listMessagesSchema = paginationSchema.extend({
  conversationId: objectIdSchema.optional(),
});

export type ListMessagesQuery = z.infer<typeof listMessagesSchema>;
```

### Step 4 — Wire to your router

```ts
import {
  createMessageSchema,
  messageIdSchema,
  listMessagesSchema,
} from '../validation/message.js';

router.post('/', validate(createMessageSchema), controller.create);
router.get('/', validate({ query: listMessagesSchema }), controller.list);
router.get(
  '/:messageId',
  validate({ params: messageIdSchema }),
  controller.getOne,
);
```

---

## 5. Conventions & Best Practices

### Naming

| Thing            | Convention                                                   |
| ---------------- | ------------------------------------------------------------ |
| Schema variables | `createXSchema`, `xIdSchema`, `listXSchema`, `updateXSchema` |
| Inferred types   | `CreateXInput`, `XIdParam`, `ListXQuery`, `UpdateXInput`     |
| Files            | One file per module in `src/validation/`                     |

### Do ✅

- **Extend** `paginationSchema` for any list endpoint that supports pagination
- **Export** the inferred TypeScript type alongside every schema
- **Keep schemas focused** — one schema per operation, not one giant schema per resource
- **Use `.optional()`** for fields that are truly optional, not just sometimes omitted

### Don't ❌

- **Don't redefine** `objectIdSchema` or `paginationSchema` — import them from `common.ts`
- **Don't put business logic** inside schemas (e.g. checking if a booking exists). Schemas validate shape only
- **Don't use** `z.any()` or `z.unknown()` unless absolutely necessary
- **Don't skip** `z.infer<typeof ...>` — the exported types are used for controller parameter typing
