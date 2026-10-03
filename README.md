# Story Grove

A little story library for curious readers. Story Grove presents 100 original English children's stories across three grammar levels, with a browsable library, fixed-picture reader, browser read-aloud with active-paragraph highlighting, and reflection questions.

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev:static
```

## Static production build

```bash
pnpm build:static
```

The Vite output directory is `dist/public`. Set `VITE_BASE=/REPOSITORY_NAME/` for a GitHub Pages subpath or `/` when publishing at a domain root.

## Content and image assets

Story text and learning notes are maintained in `client/src/data/stories.json`. Illustration locations are mapped by numeric ID in `client/src/data/story-images.json`; the current mapping does not yet contain working, completed illustrations. The public route declaration lives in `client/public/manus-routes.json`.

## Illustration status

The current Preview has not received any completed illustration files. The first five asynchronous requests did not produce visible artwork; the other 95 illustrations have not been requested while conserving credits. The site labels missing art rather than claiming a generated picture exists.

## Privacy, accessibility, and advertising

This version does not load ad-network or analytics scripts. The advertising area is reserved and clearly labelled. AdSense activation requires the owner's approved publisher ID and any applicable consent configuration. The contact address supplied by the site owner appears on the Contact and Privacy pages.
