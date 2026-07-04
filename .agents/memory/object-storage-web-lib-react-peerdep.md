---
name: Source-imported lib needs react in devDependencies
description: Why a non-composite workspace lib imported as source (e.g. object-storage-web ObjectUploader) must list react/react-dom itself.
---

# Non-composite libs imported as source need their own react dep symlinked

`lib/object-storage-web` is a non-composite lib consumed as **source** (not
built to `.d.ts`). React is declared as a `peerDependency`, but peerDeps are not
symlinked into the lib's own `node_modules`. So the first time a consuming
artifact imports something from it that references React types (e.g.
`ObjectUploader`), the artifact typecheck fails with
`Cannot find module 'react'` *inside the lib's files*.

**Why:** bundler/`moduleResolution: bundler` resolves the lib's source against
the lib's own `node_modules`, where the peer react was never installed.

**How to apply:** add `react` + `react-dom` (`catalog:`) to the lib's
`devDependencies` and run `pnpm install`. Do NOT add the lib to the root
`tsconfig.json` references — it is not composite; bundler resolution handles it.
