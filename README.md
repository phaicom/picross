# Picross

Picross puzzle project built as a `pnpm` + `turbo` monorepo.

## Workspace Layout

- `apps/web`: Nuxt web app UI.
- `packages/core`: Puzzle game and solver logic.
- `packages/parser`: `.non` parser.
- `packages/shared`: Shared types, helpers, and sample puzzles.

## Requirements

- Node.js `>=22`
- `pnpm` (version from `packageManager` in root `package.json`)

## Install

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

The web app runs on `http://localhost:3000`.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Build and Preview

```bash
pnpm build
pnpm preview
```

## Deploy

Static deploy (recommended for portfolio hosting):

```bash
pnpm generate
```

Generated static files will be in `apps/web/.output/public`.

Node server deploy:

```bash
pnpm build
pnpm -C apps/web preview
```

Production output will be in `apps/web/.output`.

## Engineering Note

The solver combines deterministic line-propagation with bounded backtracking. Presets tune iteration/backtracking/time limits so the UI can trade off speed vs solve depth while remaining responsive.
