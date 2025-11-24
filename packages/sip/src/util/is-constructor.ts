export function isConstructor(obj: unknown): obj is new (
  // biome-ignore lint/suspicious/noExplicitAny: Laravel Sip compatibility
  ...args: any[]
  // biome-ignore lint/suspicious/noExplicitAny: Laravel Sip compatibility
) => any {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: Laravel Sip compatibility
    new (obj as new (...args: any[]) => any)();
  } catch (err) {
    if (err instanceof Error && err.message.includes("is not a constructor")) {
      return false;
    }
  }

  return true;
}
