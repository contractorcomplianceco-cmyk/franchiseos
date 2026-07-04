import { Router, type IRouter } from "express";
import healthRouter from "./health";
import locationsRouter from "./locations";
import licensesRouter from "./licenses";
import complianceRouter from "./compliance";
import tasksRouter from "./tasks";
import auditsRouter from "./audits";
import documentsRouter from "./documents";
import dashboardRouter from "./dashboard";
import expansionRouter from "./expansion";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(locationsRouter);
router.use(licensesRouter);
router.use(complianceRouter);
router.use(tasksRouter);
router.use(auditsRouter);
router.use(documentsRouter);
router.use(dashboardRouter);
router.use(expansionRouter);
router.use(aiRouter);

export default router;
