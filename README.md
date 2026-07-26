# Michael Rodriguez portfolio

This project uses Next.js 16, React 19, TypeScript, and the App Router.

## Writing configuration

The `/writing` route provides public posts, comments, and comment reactions. The `/writing/admin` route provides the private author workspace.

Add these server environment variables in Vercel for production. Use `.env.local` for local development. Do not prefix these variables with `NEXT_PUBLIC_`.

```text
MONGODB_URI=
MONGODB_DB=portfolio
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
- `writing_drafts`

The author writes and edits all text directly. The site sends no content to an external model.

The author session also protects the `/comics` route. Select **Author login** in the comics header to sign in. One session covers the writing pages and the comics pages.
