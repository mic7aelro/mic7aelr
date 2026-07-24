# Michael Rodriguez portfolio

This project uses Next.js 16, React 19, TypeScript, and the App Router.

## Writing configuration

The `/writing` route provides public posts, comments, and comment reactions. The `/writing/admin` route provides the private author workspace.

Add these server environment variables in Vercel for production. Use `.env.local` for local development. Do not prefix these variables with `NEXT_PUBLIC_`.

```text
MONGODB_URI=
MONGODB_DB=portfolio
ANTHROPIC_API_KEY=
WRITING_ADMIN_USERNAME=
WRITING_ADMIN_PASSWORD=
WRITING_SESSION_SECRET=
```

Use a long random value for `WRITING_SESSION_SECRET`. Use a unique password for `WRITING_ADMIN_PASSWORD`. Store secret values in Vercel, not in GitHub.

MongoDB uses these collections:

- `writing_groups`
- `writing_areas`
- `writing_posts`
- `writing_comments`
- `writing_reactions`
- `writing_chats`
- `writing_drafts`

The author workspace sends the active writing field to Claude only when the author sends a chat message. Claude can return advice or an edited field. The author must review and publish the text.

Saved chat messages include the authenticated author name, an ISO timestamp, and the request IP address. Treat the IP address as personal data. Set an appropriate retention policy before production use.

Claude response records also include the model, input tokens, output tokens, request status, field-change status, writing context, pricing rates, and estimated USD cost. The cost uses the Anthropic pricing snapshot dated 2026-07-22 and remains an estimate. Compare stored estimates with the Claude Console invoice data.
