---
name: Vite Tailwind CSS @import ordering
description: Why third-party @import url(...) must sit above @import "tailwindcss" in the entry CSS, and how the error manifests.
---

# `@import url(...)` must precede `@import "tailwindcss"`

In a Vite + Tailwind v4 entry stylesheet, any `@import url('https://fonts...')`
must appear **above** `@import "tailwindcss"`.

**Why:** Tailwind's import expands inline into thousands of generated CSS rules.
A url-import placed after it ends up following real CSS statements in the
expanded output, and PostCSS rejects it with
`@import must precede all other statements (besides @charset or empty @layer)` —
with a confusing line number (e.g. 5000+) that points into the *expanded* file,
not your source. Empty `@layer name, name;` statements before the imports are
allowed and do not trigger this.

**How to apply:** Order the top of the entry CSS as: empty `@layer` list →
font/third-party `@import url(...)` → `@import "tailwindcss"` → other plugin
imports. If you see the "must precede" error at an impossibly high line number,
this ordering is the cause.
