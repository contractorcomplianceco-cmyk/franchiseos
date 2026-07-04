import { Router, type IRouter } from "express";
import { GetCurrentUserResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/me", requireAuth, (req, res) => {
  const user = req.currentUser!;
  res.json(
    GetCurrentUserResponse.parse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }),
  );
});

export default router;
