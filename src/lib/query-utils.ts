/** Prevent Supabase calls from hanging forever (broken session, network, etc.). */
export const withTimeout = async <T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const isMissingTableError = (error: { code?: string; message?: string } | null): boolean =>
  error?.code === "PGRST205" ||
  Boolean(error?.message?.includes("Could not find the table")) ||
  Boolean(error?.message?.includes("does not exist"));
