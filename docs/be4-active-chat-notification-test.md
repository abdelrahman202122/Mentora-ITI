# BE4 Active-Chat Notification Test

## Purpose

Verify that message notifications are suppressed while the recipient is actively
viewing the same chat, and created when the recipient is not in that chat room.

The current backend rule is:

- Every authenticated socket joins `user:{userId}` on connect.
- `chat:join` joins the socket to `chat:{chatId}`.
- `message:send` persists the message, then notification creation checks whether
  the recipient has any socket in `chat:{chatId}`.
- If the recipient is in the chat room, no notification record is created.
- If the recipient is not in the chat room, a `message` notification is created
  and delivered to `user:{recipientId}` when online.

## Required Setup

- API server running.
- MongoDB connected.
- Two authenticated users with an existing chat:
  - learner
  - tutor
- Two Socket.IO requests in Postman:
  - one authenticated as the learner
  - one authenticated as the tutor
- REST requests authenticated as the recipient user for notification checks.

## Test 1: Recipient Is Active In Chat

1. Connect learner Socket.IO request.
2. Connect tutor Socket.IO request.
3. In the recipient socket, emit:

```json
Event: chat:join
Payload:
{
  "chatId": "CHAT_ID"
}
```

4. In the sender socket, emit:

```json
Event: message:send
Payload:
{
  "chatId": "CHAT_ID",
  "content": "Active chat notification suppression test"
}
```

5. Confirm both sockets receive `message:new`.
6. As the recipient, call:

```http
GET /api/notifications?type=message&page=1&limit=20
```

Expected result:

- The new message is persisted.
- The recipient receives `message:new`.
- No new notification record exists for that message.
- The recipient should not receive `notification:new` for that message.

## Test 2: Recipient Leaves Chat

1. In the recipient socket, emit:

```json
Event: chat:leave
Payload:
{
  "chatId": "CHAT_ID"
}
```

2. In the sender socket, emit:

```json
Event: message:send
Payload:
{
  "chatId": "CHAT_ID",
  "content": "Inactive chat notification creation test"
}
```

3. As the recipient, call:

```http
GET /api/notifications?type=message&page=1&limit=20
```

Expected result:

- The new message is persisted.
- A `message` notification is created for the recipient.
- If the recipient socket is still connected to `user:{recipientId}`, it receives
  `notification:new`.
- The notification `data` contains `chatId`, `messageId`, and `senderId`.

## Failure Rules

If Test 1 creates a notification, fix active-chat suppression in
`createMessageNotification`.

If Test 2 does not create a notification, fix notification creation or user-room
delivery.

If `notification:new` is not delivered but the REST notification exists, inspect
the authenticated socket user room join flow.
