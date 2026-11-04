export function basetenApiKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.BASETEN_API_KEY || env.BASENTEN_API_KEY || undefined;
}
