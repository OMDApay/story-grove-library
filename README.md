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

## GitHub Pages

Run `pnpm build:github-pages` to generate the deployable `docs/` directory for `OMDApay/story-grove-library`. Configure Pages to deploy from branch `main`, folder `/docs`. This build is self-contained and does not use GitHub Actions. It mirrors the 100 story illustrations and hero image into `docs/images/` because Manus-only `/manus-storage/` paths are not available on GitHub Pages.

## Content and image assets

Story text and learning notes are maintained in `client/src/data/stories.json`. Illustration locations are mapped by numeric ID in `client/src/data/story-images.json`. The public route declaration lives in `client/public/manus-routes.json`.

## Illustration assets

The preview's 100 story illustrations and separate hero image are mirrored in `docs/images/` as WebP files for GitHub Pages. All 100 story assets plus the hero were retrieved as image responses and validated by their WebP file signature. The source manifest at `client/src/data/story-images.json` keeps the Manus storage paths used by the Manus preview.

## Privacy, accessibility, and advertising

This version does not load ad-network or analytics scripts. The advertising area is reserved and clearly labelled. AdSense activation requires the owner's approved publisher ID and any applicable consent configuration. The contact address supplied by the site owner appears on the Contact and Privacy pages.
