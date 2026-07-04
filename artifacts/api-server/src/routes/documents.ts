import { Router, type IRouter } from "express";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { db, documents } from "@workspace/db";
import {
  ListDocumentsQueryParams,
  ListDocumentsResponse,
  CreateDocumentBody,
  CreateDocumentResponse,
  GetDocumentParams,
  GetDocumentResponse,
  DeleteDocumentParams,
} from "@workspace/api-zod";
import { toIso } from "../lib/serialize";

const router: IRouter = Router();

router.get("/documents", async (req, res): Promise<void> => {
  const query = ListDocumentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const conditions: SQL[] = [];
  if (query.data.locationId)
    conditions.push(eq(documents.locationId, query.data.locationId));
  if (query.data.taskId) conditions.push(eq(documents.taskId, query.data.taskId));
  const rows = conditions.length
    ? await db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.uploadedAt))
    : await db.select().from(documents).orderBy(desc(documents.uploadedAt));
  res.json(ListDocumentsResponse.parse(rows.map((r) => toIso(r, ["uploadedAt"]))));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(documents).values(parsed.data).returning();
  res.status(201).json(CreateDocumentResponse.parse(toIso(row, ["uploadedAt"])));
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json(GetDocumentResponse.parse(toIso(row, ["uploadedAt"])));
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(documents)
    .where(eq(documents.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
