---
name: Auth retrofit lessons
description: Pitfalls when adding multi-user auth/RBAC to a previously single-user app
---

# Adding auth to a formerly single-user app

**Rule:** When retrofitting authentication onto an app built single-user, audit every pre-existing table for missing owner scoping — route-level `requireAuth` is not enough. Tables that "belonged to everyone" (e.g. chat conversations) silently become IDOR holes once multiple users exist.

**Why:** Architect review caught that AI conversation list/read/delete had no owner filter after Clerk was added — any signed-in user could read/delete others' chats. Fixed by adding an owner FK and filtering every query, returning 404 on mismatch.

**How to apply:** After wiring auth, walk each table and ask "who owns this row?" Add owner columns + query filters for per-user data; leave shared portfolio data global deliberately. Pre-auth rows without an owner may need truncation or backfill before a NOT NULL owner column can be pushed.

# First-user-becomes-admin bootstrap

**Rule:** An inline `CASE WHEN NOT EXISTS (SELECT 1 FROM users)` insert is racy — serialize with `pg_advisory_xact_lock` inside a transaction so exactly one concurrent first sign-in wins admin.
