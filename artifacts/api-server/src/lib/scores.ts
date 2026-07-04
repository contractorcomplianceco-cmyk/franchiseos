import { avg, eq } from "drizzle-orm";
import { db, complianceChecks } from "@workspace/db";

export async function getComplianceScores(
  locationId?: number,
): Promise<Map<number, number>> {
  const query = db
    .select({
      locationId: complianceChecks.locationId,
      avgScore: avg(complianceChecks.score),
    })
    .from(complianceChecks)
    .groupBy(complianceChecks.locationId);

  const rows = locationId
    ? await query.where(eq(complianceChecks.locationId, locationId))
    : await query;

  const map = new Map<number, number>();
  for (const row of rows) {
    map.set(row.locationId, Math.round(Number(row.avgScore ?? 100)));
  }
  return map;
}

export function licenseStatus(expiryDate: string): "valid" | "expiring" | "expired" {
  const expiry = new Date(expiryDate + "T00:00:00Z").getTime();
  const now = Date.now();
  if (expiry < now) return "expired";
  if (expiry - now < 30 * 24 * 60 * 60 * 1000) return "expiring";
  return "valid";
}
