import { Router, type IRouter } from "express";
import { db, locations, tasks } from "@workspace/db";
import { GetExpansionReadinessResponse } from "@workspace/api-zod";
import { getComplianceScores } from "../lib/scores";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

const router: IRouter = Router();

router.get("/expansion/readiness", async (_req, res): Promise<void> => {
  const [allLocations, openTasks, scores] = await Promise.all([
    db.select().from(locations),
    db.select().from(tasks),
    getComplianceScores(),
  ]);

  const byState = new Map<
    string,
    { count: number; scoreSum: number; openTasks: number }
  >();

  for (const loc of allLocations) {
    const state = loc.state.toUpperCase();
    const entry = byState.get(state) ?? { count: 0, scoreSum: 0, openTasks: 0 };
    entry.count += 1;
    entry.scoreSum += scores.get(loc.id) ?? 100;
    byState.set(state, entry);
  }

  const locationState = new Map(
    allLocations.map((l) => [l.id, l.state.toUpperCase()]),
  );
  for (const task of openTasks) {
    if (task.status === "done" || !task.locationId) continue;
    const state = locationState.get(task.locationId);
    if (!state) continue;
    const entry = byState.get(state);
    if (entry) entry.openTasks += 1;
  }

  const items = [...byState.entries()].map(([state, entry]) => {
    const avgComplianceScore = Math.round(entry.scoreSum / entry.count);
    const taskPenalty = Math.min(entry.openTasks * 8, 40);
    const maturityBonus = Math.min(entry.count * 5, 20);
    const readinessScore = Math.max(
      0,
      Math.min(100, Math.round(avgComplianceScore * 0.7 + maturityBonus - taskPenalty + 10)),
    );

    let recommendation: string;
    if (readinessScore >= 80) {
      recommendation =
        "Strong operational footing. Ready to support new units — begin site selection and franchisee recruitment.";
    } else if (readinessScore >= 50) {
      recommendation =
        "Moderate readiness. Close out open operational tasks and lift compliance scores before committing to new units.";
    } else {
      recommendation =
        "Not expansion-ready. Focus on remediating compliance failures and stabilizing existing locations first.";
    }

    return {
      state,
      stateName: STATE_NAMES[state] ?? state,
      readinessScore,
      locationCount: entry.count,
      avgComplianceScore,
      openTaskCount: entry.openTasks,
      recommendation,
    };
  });

  items.sort((a, b) => b.readinessScore - a.readinessScore);
  res.json(GetExpansionReadinessResponse.parse(items));
});

export default router;
