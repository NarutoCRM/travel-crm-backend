import { Router } from "express";

import {
  getAcceptance,
  submitAcceptance
} from "../controllers/acceptance.controller.js";

import { publicLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.use(publicLimiter);

router.get(
  "/accept/:token",
  getAcceptance
);

router.post(
  "/accept/:token",
  submitAcceptance
);

export default router;