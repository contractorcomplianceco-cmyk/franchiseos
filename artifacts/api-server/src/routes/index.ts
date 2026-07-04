import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import { requireAuth, requireWriter, requireAdmin } from "../middlewares/auth";
import locationsRouter from "./locations";
import licensesRouter from "./licenses";
import complianceRouter from "./compliance";
import tasksRouter from "./tasks";
import auditsRouter from "./audits";
import documentsRouter from "./documents";
import dashboardRouter from "./dashboard";
import expansionRouter from "./expansion";
import aiRouter from "./ai";
import notificationsRouter from "./notifications";
import storageRouter from "./storage";

const router: IRouter = Router();

// Role policy for portfolio data: reads for any signed-in user,
// creates/updates for managers and admins, deletes for admins only.
function roleGate(req: Request, res: Response, next: NextFunction) {
  if (req.method === "DELETE") {
    requireAdmin(req, res, next);
    return;
  }
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    requireWriter(req, res, next);
    return;
  }
  next();
}

router.use(healthRouter);
router.use(meRouter);

// Everything below requires a signed-in user.
router.use(requireAuth);

// AI assistant is available to every signed-in user (including managing
// their own conversations), so it is mounted before the role gate.
router.use(aiRouter);

router.use(roleGate);
router.use(locationsRouter);
router.use(licensesRouter);
router.use(complianceRouter);
router.use(tasksRouter);
router.use(auditsRouter);
router.use(documentsRouter);
router.use(dashboardRouter);
router.use(expansionRouter);
router.use(notificationsRouter);
router.use(storageRouter);

export default router;
