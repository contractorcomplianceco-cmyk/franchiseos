import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { verifyToken } from "@clerk/express";
import { and, isNotNull, ne } from "drizzle-orm";
import { db, licenses, tasks, locations } from "@workspace/db";
import { licenseStatus } from "./scores";
import { logger } from "./logger";

export interface NotificationItem {
  id: string;
  type: "license_expiring" | "task_overdue";
  severity: "warning" | "critical";
  title: string;
  message: string;
  locationName: string | null;
  entityId: number | null;
  createdAt: string;
}

let io: SocketIOServer | null = null;
let broadcastInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Compute the current set of real-time alerts from live portfolio data:
 * expiring/expired licenses and overdue open tasks. These are the same
 * conditions that feed the dashboard "Risk Alerts" metric.
 */
export async function computeNotifications(): Promise<NotificationItem[]> {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const locationNames = new Map(
    (
      await db.select({ id: locations.id, name: locations.name }).from(locations)
    ).map((l) => [l.id, l.name] as const),
  );

  const allLicenses = await db.select().from(licenses);
  const licenseAlerts: NotificationItem[] = allLicenses
    .map((l) => ({ l, status: licenseStatus(l.expiryDate) }))
    .filter(({ status }) => status !== "valid")
    .map(({ l, status }) => ({
      id: `license-${l.id}`,
      type: "license_expiring" as const,
      severity: status === "expired" ? "critical" : "warning",
      title: status === "expired" ? "License expired" : "License expiring soon",
      message: `${l.name} (${l.type}) ${status === "expired" ? "expired on" : "expires on"} ${l.expiryDate}`,
      locationName: locationNames.get(l.locationId) ?? null,
      entityId: l.id,
      createdAt: now,
    }));

  const openDatedTasks = await db
    .select()
    .from(tasks)
    .where(and(ne(tasks.status, "done"), isNotNull(tasks.dueDate)));
  const taskAlerts: NotificationItem[] = openDatedTasks
    .filter((t) => t.dueDate && t.dueDate < today)
    .map((t) => {
      const daysOverdue = Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(t.dueDate + "T00:00:00Z").getTime()) /
            86_400_000,
        ),
      );
      return {
        id: `task-${t.id}`,
        type: "task_overdue" as const,
        severity: daysOverdue > 7 ? "critical" : "warning",
        title: "Task overdue",
        message: `${t.title} — ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue`,
        locationName: t.locationId
          ? (locationNames.get(t.locationId) ?? null)
          : null,
        entityId: t.id,
        createdAt: now,
      };
    });

  // Critical alerts first, then warnings.
  return [...licenseAlerts, ...taskAlerts].sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "critical" ? -1 : 1;
  });
}

/**
 * Verify a socket handshake using the Clerk session JWT carried in the
 * `__session` cookie (the same cookie the REST API trusts). Falls back to an
 * explicit `auth.token` for non-browser clients.
 */
async function isSocketAuthenticated(socket: Socket): Promise<boolean> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return false;

  const cookieHeader = socket.handshake.headers.cookie ?? "";
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  const authToken =
    typeof socket.handshake.auth?.["token"] === "string"
      ? (socket.handshake.auth["token"] as string)
      : undefined;
  const token = cookieMatch?.[1]
    ? decodeURIComponent(cookieMatch[1])
    : authToken;
  if (!token) return false;

  try {
    await verifyToken(token, { secretKey });
    return true;
  } catch {
    return false;
  }
}

export function setupRealtime(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    // Mounted under /api so the shared Replit proxy (which routes /api to this
    // service) forwards both the websocket upgrade and the long-polling
    // fallback. socket.io degrades to HTTP long-polling automatically if the
    // proxy does not allow the websocket upgrade.
    path: "/api/socket.io",
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    void isSocketAuthenticated(socket).then((ok) => {
      if (ok) {
        next();
      } else {
        next(new Error("Unauthorized"));
      }
    });
  });

  io.on("connection", (socket) => {
    void (async () => {
      try {
        socket.emit("notifications", await computeNotifications());
      } catch (err) {
        logger.error({ err }, "Failed to send initial notifications");
      }
    })();
  });

  // Recompute periodically so time-based transitions (a license crossing its
  // expiry, a task becoming overdue) surface without any user action.
  if (broadcastInterval) clearInterval(broadcastInterval);
  broadcastInterval = setInterval(() => {
    void broadcastNotifications();
  }, 60_000);

  const stop = () => {
    if (broadcastInterval) {
      clearInterval(broadcastInterval);
      broadcastInterval = null;
    }
    io?.close();
  };
  httpServer.on("close", stop);

  logger.info("Realtime notifications initialized");
  return io;
}

/** Push the current notification set to every connected client. */
export async function broadcastNotifications(): Promise<void> {
  if (!io) return;
  try {
    io.emit("notifications", await computeNotifications());
  } catch (err) {
    logger.error({ err }, "Failed to broadcast notifications");
  }
}
