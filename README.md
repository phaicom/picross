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
