---
name: video-js (artifacts/demo) typecheck fixes
description: Why the video-js demo artifact fails tsc and the type-only fix pattern
---

The `artifacts/demo` video-js artifact can fail `tsc` while running fine at runtime.
Three recurring, type-only causes and their fixes (never change runtime values/timing):

1. **Missing DOM lib.** Its `tsconfig.json` must set `"lib": ["esnext", "dom", "dom.iterable"]`
   (mirrors `artifacts/franchise-os`). `tsconfig.base.json` only sets `lib: ["es2022"]`, so
   without this override you get `window`/`document`/`HTMLAudioElement` not-found errors.

2. **framer-motion `Easing` tuples.** A standalone `const ease = [0.16, 1, 0.3, 1];` infers
   `number[]`, not assignable to `Easing`. Fix: annotate as a tuple
   `const ease: [number, number, number, number] = [...]`. Inline `transition={{ ease }}` on
   motion components is contextually typed and fine — only the standalone const needs typing.

3. **Variants transition widening.** In `animations.ts`, transition objects inside
   `Variants`-typed consts widen `type:'spring'`/`ease:'circOut'` to `string`; add `as const`
   (or `as Transition`) to the transition object.

**Why:** framer-motion v12 tightened `Easing`/`Transition`/`Variant` union types; the demo
predates that. **How to apply:** after any framer-motion catalog bump, re-run
`pnpm --filter @workspace/demo run typecheck`. Note the demo `vite build` also requires
`PORT` (and `BASE_PATH`) env at config-load time — a build failure mentioning PORT is
env-config, not a code regression.
