// Vercel entry. The Express app is built once per warm instance from the compiled dist folder.
import { buildApp } from "../dist/build.js";

let appPromise;

export default async function handler(req, res) {
  appPromise ??= buildApp();
  const app = await appPromise;
  return app(req, res);
}
