import type { NextFunction, Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq, sql } from "drizzle-orm";
import { db, users, type User, type UserRole } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

async function provisionUser(clerkId: string): Promise<User> {
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (existing[0]) return existing[0];

  let email = "";
  let name = "";
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    email = clerkUser.primaryEmailAddress?.emailAddress ?? "";
    name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
  } catch {
    // Clerk lookup failure should not block provisioning
  }

  // First user in the system becomes admin; everyone after defaults to user.
  // An advisory transaction lock serializes concurrent first sign-ins so
  // exactly one user can win the "table was empty" check.
  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(874312)`);
    const [row] = await tx
      .insert(users)
      .values({
        clerkId,
        email,
        name,
        role: sql`case when not exists (select 1 from users) then 'admin' else 'user' end`,
      })
      .onConflictDoNothing({ target: users.clerkId })
      .returning();
    return row;
  });
  if (created) return created;

  const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  return row!;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.currentUser = await provisionUser(clerkId);
    next();
  } catch (err) {
    req.log.error({ err }, "Failed to provision user");
    res.status(500).json({ error: "Failed to load user" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.currentUser;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(user.role as UserRole)) {
      res.status(403).json({ error: "You don't have permission to do this" });
      return;
    }
    next();
  };
}

export const requireWriter = requireRole("admin", "manager");
export const requireAdmin = requireRole("admin");
