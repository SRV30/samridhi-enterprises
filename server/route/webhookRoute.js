import express from "express";
import { stripeWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Note: Stripe requires the raw body to construct the event
router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
