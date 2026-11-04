/** Baseten key. The correct spelling wins; the old misspelling still works. */
export function basetenKey(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const key = env.BASETEN_API_KEY || env.BASENTEN_API_KEY;
  return key ? key : undefined;
}
