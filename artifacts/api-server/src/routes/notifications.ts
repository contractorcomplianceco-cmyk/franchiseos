import { Router, type IRouter } from "express";
import { GetNotificationsResponse } from "@workspace/api-zod";
import { computeNotifications } from "../lib/realtime";

const router: IRouter = Router();

// REST fallback / initial load for the real-time notification feed. The live
// stream is delivered over socket.io (see lib/realtime.ts); this endpoint
// returns the same payload for the first paint and for clients without a socket.
router.get("/notifications", async (_req, res): Promise<void> => {
  const notifications = await computeNotifications();
  res.json(GetNotificationsResponse.parse({ notifications }));
});

export default router;
