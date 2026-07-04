import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, complianceChecks, tasks, locations } from "@workspace/db";
import {
  ListComplianceChecksQueryParams,
  ListComplianceChecksResponse,
  CreateComplianceCheckBody,
  CreateComplianceCheckResponse,
  UpdateComplianceCheckBody,
  UpdateComplianceCheckParams,
  UpdateComplianceCheckResponse,
  DeleteComplianceCheckParams,
} from "@workspace/api-zod";
import { toIso } from "../lib/serialize";

const router: IRouter = Router();

router.get("/compliance", async (req, res): Promise<void> => {
  const query = ListComplianceChecksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = query.data.locationId
    ? await db
        .select()
        .from(complianceChecks)
        .where(eq(complianceChecks.locationId, query.data.locationId))
        .orderBy(desc(complianceChecks.checkedAt))
    : await db
        .select()
        .from(complianceChecks)
        .orderBy(desc(complianceChecks.checkedAt));
  res.json(ListComplianceChecksResponse.parse(rows.map((r) => toIso(r, ["checkedAt"]))));
});

router.post("/compliance", async (req, res): Promise<void> => {
  const parsed = CreateComplianceCheckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(complianceChecks).values(parsed.data).returning();

  // Auto-create a remediation task when a check fails or needs attention
  if (row.status === "fail" || row.status === "warn") {
    const [loc] = await db
      .select({ name: locations.name })
      .from(locations)
      .where(eq(locations.id, row.locationId));
    await db.insert(tasks).values({
      locationId: row.locationId,
      title: `Resolve ${row.status === "fail" ? "failed" : "flagged"} compliance check: ${row.category}`,
      description: `${row.description}${loc ? ` (${loc.name})` : ""} — auto-created from compliance rules.`,
      status: "todo",
      priority: row.status === "fail" ? "high" : "medium",
      source: "compliance",
      dueDate: row.dueDate,
    });
  }

  res.status(201).json(CreateComplianceCheckResponse.parse(toIso(row, ["checkedAt"])));
});

router.patch("/compliance/:id", async (req, res): Promise<void> => {
  const params = UpdateComplianceCheckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateComplianceCheckBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(complianceChecks)
    .set(parsed.data)
    .where(eq(complianceChecks.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Compliance check not found" });
    return;
  }
  res.json(UpdateComplianceCheckResponse.parse(toIso(row, ["checkedAt"])));
});

router.delete("/compliance/:id", async (req, res): Promise<void> => {
  const params = DeleteComplianceCheckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(complianceChecks)
    .where(eq(complianceChecks.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Compliance check not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
