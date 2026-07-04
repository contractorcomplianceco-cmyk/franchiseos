import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, locations } from "@workspace/db";
import {
  CreateLocationBody,
  CreateLocationResponse,
  GetLocationParams,
  GetLocationResponse,
  UpdateLocationBody,
  UpdateLocationParams,
  UpdateLocationResponse,
  DeleteLocationParams,
  ListLocationsResponse,
} from "@workspace/api-zod";
import { getComplianceScores } from "../lib/scores";

const router: IRouter = Router();

router.get("/locations", async (_req, res): Promise<void> => {
  const rows = await db.select().from(locations).orderBy(locations.name);
  const scores = await getComplianceScores();
  const data = rows.map((l) => ({
    ...l,
    complianceScore: scores.get(l.id) ?? 100,
  }));
  res.json(ListLocationsResponse.parse(data));
});

router.post("/locations", async (req, res): Promise<void> => {
  const parsed = CreateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(locations).values(parsed.data).returning();
  res.status(201).json(CreateLocationResponse.parse({ ...row, complianceScore: 100 }));
});

router.get("/locations/:id", async (req, res): Promise<void> => {
  const params = GetLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  const scores = await getComplianceScores(row.id);
  res.json(
    GetLocationResponse.parse({ ...row, complianceScore: scores.get(row.id) ?? 100 }),
  );
});

router.patch("/locations/:id", async (req, res): Promise<void> => {
  const params = UpdateLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(locations)
    .set(parsed.data)
    .where(eq(locations.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  const scores = await getComplianceScores(row.id);
  res.json(
    UpdateLocationResponse.parse({ ...row, complianceScore: scores.get(row.id) ?? 100 }),
  );
});

router.delete("/locations/:id", async (req, res): Promise<void> => {
  const params = DeleteLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(locations)
    .where(eq(locations.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
