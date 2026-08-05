/**
 * Full-screen handoff shown after a successful sign-in / sign-up while the
 * app route loads. Keeps the transition from feeling abrupt.
 */
export default function GettingAppReady({
  message = "Getting your app ready…",
}: {
  message?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[linear-gradient(87.99deg,var(--brand)_39.02%,var(--brand-soft)_94.45%)]"
    >
      <div
        className="size-12 animate-spin rounded-full border-4 border-white/25 border-t-white"
        aria-hidden
      />
      <div className="flex flex-col items-center gap-1 px-6 text-center">
        <p className="font-nunito text-2xl font-bold text-white">{message}</p>
        <p className="text-sm text-white/80">Just a moment</p>
      </div>
    </div>
  );
}

/** Minimum time to show the ready screen before navigating. */
export const APP_READY_MIN_MS = 2000;

export function waitForAppReady(minMs = APP_READY_MIN_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, minMs);
  });
}
