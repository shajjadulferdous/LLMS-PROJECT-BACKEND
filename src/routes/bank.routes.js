import { Router } from "express";
import { jwtverifyJWT } from "../middlewares/auth.middlewares.js";
import { createAccount, deposit, withdraw, getAccount } from "../controllers/bank.controller.js";

const router = Router();

router.post("/", jwtverifyJWT, createAccount);
router.get("/me", jwtverifyJWT, getAccount);
router.post("/deposit", jwtverifyJWT, deposit);
router.post("/withdraw", jwtverifyJWT, withdraw);

export default router;
