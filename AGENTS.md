# AGENTS.md

## Project overview

This repository is a personal portfolio built with Next.js 16, React 19, TypeScript, and the App Router. Styling is primarily CSS Modules and global CSS, with GSAP, Lenis, and React Three Fiber used for motion and interactive 3D experiences.

## Working conventions

- Use TypeScript and follow the patterns already present in nearby files.
- Keep route-level code in `src/app` and reusable UI in `src/components`.
- Prefer CSS Modules for component-specific styles and `src/app/globals.css` for truly global rules.
- Preserve the existing visual language, animation behavior, and responsive design unless the task explicitly calls for a redesign.
- Keep client components narrowly scoped. Add `"use client"` only when browser APIs, state, effects, or interactive libraries require it.
- Reuse existing utilities from `src/lib` and shared types from `src/types` before introducing duplicates.
- Keep static assets in `public` and reference them with root-relative paths.
- Avoid adding dependencies unless they materially simplify the requested work.

## Writing standard

Use ASD-STE100 Simplified Technical English for documentation, interface copy, code comments, change summaries, and user-facing explanations.

- Use approved, common words when they keep the technical meaning accurate.
- Use one word for one meaning. Do not switch between synonyms for the same item or action.
- Use short, direct sentences. Put one main instruction or idea in each sentence.
- Use active voice and identify who or what performs the action.
- Use imperative verbs for instructions. Example: "Select Save." Do not write: "The Save button should then be selected."
- Use positive instructions when possible. State what to do before you state an exception or restriction.
- Avoid idioms, slang, metaphors, rhetorical questions, and unnecessary marketing language.
- Avoid ambiguous pronouns. Repeat the noun when `it`, `this`, or `that` can refer to more than one item.
- Keep paragraphs short. Use ordered steps for procedures and bullets for independent facts.
- Preserve exact names for APIs, libraries, commands, source-code symbols, and domain-specific terms. Explain an uncommon term the first time it appears.
- Do not reduce accuracy to simplify the language. If strict ASD-STE100 vocabulary is unavailable, follow its grammar and clarity principles and use the necessary technical term consistently.

## Validation

- Run `npm run build` after meaningful code changes; it is the primary type and production-build check.
- For visual changes, check the affected page at desktop and mobile widths when a browser is available.
- There is currently no dedicated test or lint script. Do not claim those checks passed unless such scripts are added and run.

## Change hygiene

- Preserve unrelated user changes in the working tree.
- Keep changes focused on the requested task; avoid broad refactors without a clear need.
- Do not commit generated build output such as `.next`.
- Update documentation when commands, project structure, or required environment variables change.

## Environment and secrets

- Never commit API keys, tokens, or `.env*` files containing secrets.
- The contact API may rely on external service credentials; document required variable names without exposing their values.
