import type { Request, Response } from "express";

export interface HealthBody {
  status: "ok";
  time: string;
}

export function healthBody(now: Date = new Date()): HealthBody {
  return { status: "ok", time: now.toISOString() };
}

export function healthHandler(_req: Request, res: Response): void {
  res.status(200).json(healthBody());
}
