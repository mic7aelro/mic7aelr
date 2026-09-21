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

### Comic lookup

The Add comic form can fill the fields from Open Library. Enter a title, an
ISBN, or an Amazon link. An Amazon book link contains the ISBN-10 as the ASIN,
so the server reads the ISBN from the link. Open Library needs no API key and
no account, so this feature adds no environment variable.

Open Library returns the data of one printing. The year is the year of that
printing, not the year of the first release. Search results include reprints
and translations. Check every value before you save.

The author session also protects the `/comics` route. Select **Author login** in the comics header to sign in. One session covers the writing pages and the comics pages.

## Ponder

The `/ponder` route lists small experiments with Jev and other AI models. Each experiment has its own route under `/ponder`. To add an experiment, add one item to `src/data/ponder.ts` and one route under `src/app/ponder`.

### Password and environment variables

Every page under `/ponder` and every route under `/api/ponder` needs a shared password. A visitor enters the password on the `/ponder` page. The server then sets a signed cookie that lasts 30 days. The **Lock** button in the header ends the session.

Add these server environment variables in Vercel for production. Use `.env.local` for local development. Do not prefix them with `NEXT_PUBLIC_`.

```text
PONDER_PASSWORD=
TYPESAFE_API_KEY=
```

- `PONDER_PASSWORD` is the shared password. Without it, Ponder stays locked. Changing the password ends every session.
- `TYPESAFE_API_KEY` is the Jev key. Without it, the games still open, but Jev is unavailable.

The password route allows 10 tries each 10 minutes for each address.

### CFOP with Jev

The `/ponder/rubiks-cube` route solves a Rubik's Cube from a scramble.

- `src/lib/cube.ts` is the cube simulator.
- `src/lib/cfop-algs.ts` lists the algorithms: F2L, OLL, PLL, COLL, and Winter Variation.
- `src/lib/cfop-tables.ts` checks every algorithm in the simulator and builds the lookup tables.
- `src/lib/cfop-solve.ts` is the solver. Code recognizes each case and checks each step. Jev makes the choices that have no single right answer.
- `src/lib/jev.ts` is the Jev client. The server calls Jev. The browser never sees the API key.

Without `TYPESAFE_API_KEY`, the solver still works. It uses the shortest option at each choice, and the page says that Jev is unavailable.

Each solve makes up to 10 requests to Jev. The API route allows 10 solves each minute for each address.

Run `npm test` to check the simulator, the algorithm tables, and the solver.
