import { Router, type IRouter } from "express";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { db, tasks } from "@workspace/db";
import {
  ListTasksQueryParams,
  ListTasksResponse,
  CreateTaskBody,
  CreateTaskResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
  DeleteTaskParams,
} from "@workspace/api-zod";
import { toIso } from "../lib/serialize";

const router: IRouter = Router();

router.get("/tasks", async (req, res): Promise<void> => {
  const query = ListTasksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const conditions: SQL[] = [];
  if (query.data.locationId) conditions.push(eq(tasks.locationId, query.data.locationId));
  if (query.data.status) conditions.push(eq(tasks.status, query.data.status));
  const rows = conditions.length
    ? await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt))
    : await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  res.json(ListTasksResponse.parse(rows.map((r) => toIso(r, ["createdAt"]))));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(tasks).values(parsed.data).returning();
  res.status(201).json(CreateTaskResponse.parse(toIso(row, ["createdAt"])));
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(tasks)
    .set(parsed.data)
    .where(eq(tasks.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(UpdateTaskResponse.parse(toIso(row, ["createdAt"])));
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(tasks)
    .where(eq(tasks.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
