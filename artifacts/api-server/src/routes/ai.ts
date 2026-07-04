import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  db,
  conversations,
  messages,
  locations,
  licenses,
  complianceChecks,
  tasks,
  audits,
  documents,
} from "@workspace/db";
import {
  SendChatMessageBody,
  SendChatMessageResponse,
  ListConversationsResponse,
  ListConversationMessagesParams,
  ListConversationMessagesResponse,
  DeleteConversationParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getComplianceScores, licenseStatus } from "../lib/scores";
import { toIso } from "../lib/serialize";

const router: IRouter = Router();

router.get("/ai/conversations", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, req.currentUser!.id))
    .orderBy(desc(conversations.createdAt));
  res.json(ListConversationsResponse.parse(rows.map((r) => toIso(r, ["createdAt"]))));
});

router.get("/ai/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListConversationMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, params.data.id),
        eq(conversations.userId, req.currentUser!.id),
      ),
    );
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(asc(messages.createdAt));
  res.json(ListConversationMessagesResponse.parse(rows.map((r) => toIso(r, ["createdAt"]))));
});

router.delete("/ai/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.id, params.data.id),
        eq(conversations.userId, req.currentUser!.id),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.sendStatus(204);
});

async function buildPortfolioContext(): Promise<string> {
  const [allLocations, allLicenses, allChecks, allTasks, allAudits, allDocuments, scores] =
    await Promise.all([
      db.select().from(locations),
      db.select().from(licenses),
      db.select().from(complianceChecks).orderBy(desc(complianceChecks.checkedAt)).limit(50),
      db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(50),
      db.select().from(audits).orderBy(desc(audits.conductedAt)).limit(20),
      db.select().from(documents).orderBy(desc(documents.uploadedAt)).limit(20),
      getComplianceScores(),
    ]);

  const locName = new Map(allLocations.map((l) => [l.id, l.name]));

  const lines: string[] = [];
  lines.push("== FRANCHISE LOCATIONS ==");
  for (const l of allLocations) {
    lines.push(
      `[Location #${l.id}] ${l.name} — ${l.city}, ${l.state} | status: ${l.status} | owner: ${l.ownerName ?? "n/a"} | compliance score: ${scores.get(l.id) ?? 100}/100`,
    );
  }

  lines.push("\n== LICENSES ==");
  for (const li of allLicenses) {
    lines.push(
      `[License #${li.id}] ${li.name} (${li.type}) at ${locName.get(li.locationId) ?? "?"} | expires ${li.expiryDate} | status: ${licenseStatus(li.expiryDate)}`,
    );
  }

  lines.push("\n== RECENT COMPLIANCE CHECKS ==");
  for (const c of allChecks) {
    lines.push(
      `[Check #${c.id}] ${c.category} at ${locName.get(c.locationId) ?? "?"} | ${c.status.toUpperCase()} (${c.score}/100) | ${c.description}${c.dueDate ? ` | due ${c.dueDate}` : ""}`,
    );
  }

  lines.push("\n== TASKS ==");
  for (const t of allTasks) {
    lines.push(
      `[Task #${t.id}] ${t.title} | ${t.status} | priority: ${t.priority} | source: ${t.source}${t.locationId ? ` | ${locName.get(t.locationId) ?? "?"}` : ""}${t.dueDate ? ` | due ${t.dueDate}` : ""}`,
    );
  }

  lines.push("\n== AUDITS ==");
  for (const a of allAudits) {
    lines.push(
      `[Audit #${a.id}] ${locName.get(a.locationId) ?? "?"} by ${a.auditor} | score ${a.score}/100 | ${a.conductedAt.toISOString().slice(0, 10)}${a.notes ? ` | ${a.notes}` : ""}`,
    );
  }

  lines.push("\n== DOCUMENTS / SOPs ==");
  for (const d of allDocuments) {
    const excerpt = d.content ? d.content.slice(0, 500) : "";
    lines.push(
      `[Document #${d.id}] "${d.name}" (${d.category})${d.locationId ? ` | ${locName.get(d.locationId) ?? "?"}` : ""}${excerpt ? ` | content: ${excerpt}` : ""}`,
    );
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are the FranchiseIntelligenceOS assistant — an operations intelligence advisor for a franchise portfolio.

Rules:
- Answer using ONLY the portfolio data provided in the context. If the data doesn't contain the answer, say so.
- Always cite your sources inline using the bracketed IDs from the context, e.g. [Location #3], [Check #12], [Document #5].
- Structure responses with short bullet points.
- End every response with a "Next steps" section containing 1-3 concrete suggested actions.
- Compliance scoring: 80-100 is healthy (green), 50-79 needs attention (yellow), below 50 is critical (red).
- Be concise and operational — you are talking to a busy franchise operator.`;

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { conversationId, message } = parsed.data;

  let convId = conversationId;
  if (convId) {
    const [existing] = await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.id, convId), eq(conversations.userId, req.currentUser!.id)),
      );
    if (!existing) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
  } else {
    const title = message.length > 60 ? message.slice(0, 57) + "..." : message;
    const [created] = await db
      .insert(conversations)
      .values({ title, userId: req.currentUser!.id })
      .returning();
    convId = created.id;
  }

  await db.insert(messages).values({
    conversationId: convId,
    role: "user",
    content: message,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(asc(messages.createdAt));

  const context = await buildPortfolioContext();

  let reply: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Current portfolio data (as of ${new Date().toISOString().slice(0, 10)}):\n\n${context}`,
        },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });
    reply =
      completion.choices[0]?.message?.content ??
      "I wasn't able to generate a response. Please try again.";
  } catch (err) {
    req.log.error({ err, conversationId: convId }, "OpenAI completion failed");
    res.status(502).json({
      error: "The AI assistant is temporarily unavailable. Please try again.",
    });
    return;
  }

  await db.insert(messages).values({
    conversationId: convId,
    role: "assistant",
    content: reply,
  });

  res.json(SendChatMessageResponse.parse({ conversationId: convId, reply }));
});

export default router;
