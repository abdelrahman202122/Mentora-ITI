# Mentora API

Simple Express API for the Mentora graduation project.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Environment

Create `apps/api/.env` from `.env.example`.

```env
PORT=4000
MONGO_URI=your-mongodb-uri-here
```

Use a local MongoDB URI or a MongoDB Atlas URI. The API will not start until `MONGO_URI` is set.

## Structure

```txt
src/
  config/       env validation and database connection
  middleware/   error and not-found handlers
  modules/      feature folders
  utils/        response helper and AppError class
  app.ts        express app setup
  server.ts     app startup
```

## How To Add A Feature

For a new feature, create a folder inside `src/modules`:

```txt
modules/courses/
  course.routes.ts
  course.controller.ts
  course.service.ts
  course.model.ts
  course.validator.ts
```

Then register the route in `src/app.ts`.

## API Responses

Use `sendSuccess` and `sendError` from `src/utils/api-response.ts` so all responses keep the same shape.

## Errors

Use `new AppError(message, statusCode)` for expected operational errors, like not found or duplicate email. Unexpected errors return full messages in development and a safe message in production.
