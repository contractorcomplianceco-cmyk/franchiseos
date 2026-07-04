import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, licenses } from "@workspace/db";
import {
  ListLicensesQueryParams,
  ListLicensesResponse,
  CreateLicenseBody,
  CreateLicenseResponse,
  UpdateLicenseBody,
  UpdateLicenseParams,
  UpdateLicenseResponse,
  DeleteLicenseParams,
} from "@workspace/api-zod";
import { licenseStatus } from "../lib/scores";
import { broadcastNotifications } from "../lib/realtime";

const router: IRouter = Router();

router.get("/licenses", async (req, res): Promise<void> => {
  const query = ListLicensesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = query.data.locationId
    ? await db.select().from(licenses).where(eq(licenses.locationId, query.data.locationId))
    : await db.select().from(licenses).orderBy(licenses.expiryDate);
  res.json(
    ListLicensesResponse.parse(
      rows.map((l) => ({ ...l, status: licenseStatus(l.expiryDate) })),
    ),
  );
});

router.post("/licenses", async (req, res): Promise<void> => {
  const parsed = CreateLicenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(licenses).values(parsed.data).returning();
  void broadcastNotifications();
  res
    .status(201)
    .json(CreateLicenseResponse.parse({ ...row, status: licenseStatus(row.expiryDate) }));
});

router.patch("/licenses/:id", async (req, res): Promise<void> => {
  const params = UpdateLicenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLicenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(licenses)
    .set(parsed.data)
    .where(eq(licenses.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "License not found" });
    return;
  }
  void broadcastNotifications();
  res.json(UpdateLicenseResponse.parse({ ...row, status: licenseStatus(row.expiryDate) }));
});

router.delete("/licenses/:id", async (req, res): Promise<void> => {
  const params = DeleteLicenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(licenses)
    .where(eq(licenses.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "License not found" });
    return;
  }
  void broadcastNotifications();
  res.sendStatus(204);
});

export default router;
