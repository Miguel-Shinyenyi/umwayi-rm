import type { Request, Response } from "express";
import { LedgerError } from "../ledger/types.js";

export function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token === "" ? null : token;
}

export function sendError(res: Response, err: unknown): void {
  if (err instanceof LedgerError) {
    res.status(err.statusCode).json({ error: { code: statusCode(err.statusCode), message: err.message } });
    return;
  }
  res.status(500).json({ error: { code: "internal", message: "internal error" } });
}

function statusCode(status: number): string {
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "invalid";
  return "internal";
}

export function requireToken(req: Request, res: Response): string | null {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: { code: "unauthorized", message: "missing bearer token" } });
    return null;
  }
  return token;
}
