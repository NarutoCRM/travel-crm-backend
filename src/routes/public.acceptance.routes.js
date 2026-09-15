import { Router } from "express";

import {
    acceptEmailController,
} from "../controllers/email.controller.js";

const router = Router();

router.post(
    "/acceptance/:token",
    acceptEmailController
);

export default router;