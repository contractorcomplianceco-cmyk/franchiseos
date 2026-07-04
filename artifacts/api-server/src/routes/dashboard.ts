import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  locations,
  tasks,
  licenses,
  complianceChecks,
  documents,
  audits,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";
import { getComplianceScores, licenseStatus } from "../lib/scores";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [allLocations, allTasks, allLicenses, allChecks, allDocuments] =
    await Promise.all([
      db.select().from(locations),
      db.select().from(tasks),
      db.select().from(licenses),
      db.select().from(complianceChecks),
      db.select({ id: documents.id }).from(documents),
    ]);

  const scores = await getComplianceScores();
  const scoreValues = allLocations.map((l) => scores.get(l.id) ?? 100);
  const avgComplianceScore = scoreValues.length
    ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
    : 100;

  const today = new Date().toISOString().slice(0, 10);
  const openTasks = allTasks.filter((t) => t.status !== "done");

  const data = {
    totalLocations: allLocations.length,
    activeLocations: allLocations.filter((l) => l.status === "active").length,
    avgComplianceScore,
    openTasks: openTasks.length,
    overdueTasks: openTasks.filter((t) => t.dueDate && t.dueDate < today).length,
    expiringLicenses: allLicenses.filter(
      (l) => licenseStatus(l.expiryDate) !== "valid",
    ).length,
    failedChecks: allChecks.filter((c) => c.status === "fail").length,
    documentsCount: allDocuments.length,
  };

  res.json(GetDashboardSummaryResponse.parse(data));
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const locationNames = new Map(
    (await db.select({ id: locations.id, name: locations.name }).from(locations)).map(
      (l) => [l.id, l.name],
    ),
  );

  const [recentTasks, recentChecks, recentAudits, recentDocuments] =
    await Promise.all([
      db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(10),
      db
        .select()
        .from(complianceChecks)
        .orderBy(desc(complianceChecks.checkedAt))
        .limit(10),
      db.select().from(audits).orderBy(desc(audits.conductedAt)).limit(10),
      db.select().from(documents).orderBy(desc(documents.uploadedAt)).limit(10),
    ]);

  const items = [
    ...recentTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      description: `Task ${t.status === "done" ? "completed" : "created"}: ${t.title}`,
      locationName: t.locationId ? (locationNames.get(t.locationId) ?? null) : null,
      timestamp: t.createdAt,
    })),
    ...recentChecks.map((c) => ({
      id: `compliance-${c.id}`,
      type: "compliance" as const,
      description: `Compliance check ${c.status === "pass" ? "passed" : c.status === "warn" ? "flagged" : "failed"}: ${c.category}`,
      locationName: locationNames.get(c.locationId) ?? null,
      timestamp: c.checkedAt,
    })),
    ...recentAudits.map((a) => ({
      id: `audit-${a.id}`,
      type: "audit" as const,
      description: `Audit completed by ${a.auditor} — score ${a.score}`,
      locationName: locationNames.get(a.locationId) ?? null,
      timestamp: a.conductedAt,
    })),
    ...recentDocuments.map((d) => ({
      id: `document-${d.id}`,
      type: "document" as const,
      description: `Document added: ${d.name}`,
      locationName: d.locationId ? (locationNames.get(d.locationId) ?? null) : null,
      timestamp: d.uploadedAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 15)
    .map((item) => ({ ...item, timestamp: item.timestamp.toISOString() }));

  res.json(GetRecentActivityResponse.parse(items));
});

export default router;
