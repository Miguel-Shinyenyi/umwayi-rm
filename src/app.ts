import express from "express";
import { healthHandler } from "./routes/health.js";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.get("/health", healthHandler);

  return app;
}
