import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, audits } from "@workspace/db";
import {
  ListAuditsQueryParams,
  ListAuditsResponse,
  CreateAuditBody,
  CreateAuditResponse,
  DeleteAuditParams,
} from "@workspace/api-zod";
import { toIso } from "../lib/serialize";

const router: IRouter = Router();

router.get("/audits", async (req, res): Promise<void> => {
  const query = ListAuditsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = query.data.locationId
    ? await db
        .select()
        .from(audits)
        .where(eq(audits.locationId, query.data.locationId))
        .orderBy(desc(audits.conductedAt))
    : await db.select().from(audits).orderBy(desc(audits.conductedAt));
  res.json(ListAuditsResponse.parse(rows.map((r) => toIso(r, ["conductedAt"]))));
});

router.post("/audits", async (req, res): Promise<void> => {
  const parsed = CreateAuditBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { conductedAt, ...rest } = parsed.data;
  const [row] = await db
    .insert(audits)
    .values({
      ...rest,
      ...(conductedAt ? { conductedAt: new Date(conductedAt) } : {}),
    })
    .returning();
  res.status(201).json(CreateAuditResponse.parse(toIso(row, ["conductedAt"])));
});

router.delete("/audits/:id", async (req, res): Promise<void> => {
  const params = DeleteAuditParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(audits)
    .where(eq(audits.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Audit not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
