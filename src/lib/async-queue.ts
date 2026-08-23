/**
 * Wraps an async task so repeated calls never run it concurrently. While one run is in
 * flight, further calls are coalesced into a single trailing run once it finishes, so the
 * task always eventually executes with whatever is current — never two overlapping runs
 * racing each other, and never a run silently dropped.
 */
export function createCoalescedRunner(task: () => Promise<void>) {
  let inFlight = false;
  let pending = false;

  return async function trigger() {
    pending = true;
    if (inFlight) return;
    inFlight = true;

    try {
      while (pending) {
        pending = false;
        // eslint-disable-next-line no-await-in-loop -- intentionally serialized, one run at a time
        await task();
      }
    } finally {
      inFlight = false;
    }
  };
}
