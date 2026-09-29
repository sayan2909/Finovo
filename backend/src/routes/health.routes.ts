import { Router } from "express";
import { execRawSql } from "../db";

const router = Router();

// GET /api/health
router.get("/", async (_req, res) => {
  try {
    await execRawSql("SELECT 1;");
    return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
