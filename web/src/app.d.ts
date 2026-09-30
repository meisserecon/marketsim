declare global {
  /** True when built or served with VITE_MOCK=1. See vite.config.ts. */
  const __MOCK__: boolean;

  namespace App {}
}

export {};
