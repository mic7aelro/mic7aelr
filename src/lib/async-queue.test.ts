import { describe, expect, it, vi } from 'vitest';
import { createCoalescedRunner } from './async-queue';

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

describe('createCoalescedRunner', () => {
  it('runs the task once for a single trigger', async () => {
    const task = vi.fn(async () => {});
    const trigger = createCoalescedRunner(task);

    await trigger();
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('coalesces triggers that arrive while a run is in flight into one trailing run', async () => {
    const calls: number[] = [];
    let callIndex = 0;
    const gate = deferred();

    const task = vi.fn(async () => {
      const thisCall = callIndex += 1;
      calls.push(thisCall);
      if (thisCall === 1) await gate.promise; // hold the first run open
    });

    const trigger = createCoalescedRunner(task);

    const firstRun = trigger(); // starts run #1, which is now awaiting the gate
    await Promise.resolve(); // let run #1 actually start
    void trigger(); // arrives while #1 is in flight -> should coalesce, not overlap
    void trigger(); // also arrives while #1 is in flight -> should coalesce into the SAME trailing run

    expect(task).toHaveBeenCalledTimes(1); // still just the first run; nothing overlapping it

    gate.resolve();
    await firstRun;

    // Exactly one trailing run happened for both coalesced triggers combined, not two.
    expect(task).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([1, 2]);
  });

  it('runs again on a later, separate trigger after the previous run finished', async () => {
    const task = vi.fn(async () => {});
    const trigger = createCoalescedRunner(task);

    await trigger();
    await trigger();
    await trigger();

    expect(task).toHaveBeenCalledTimes(3);
  });

  it('never overlaps two runs of the task (regression: concurrent-PATCH lost-update race)', async () => {
    let runningCount = 0;
    let maxConcurrent = 0;

    const task = vi.fn(async () => {
      runningCount += 1;
      maxConcurrent = Math.max(maxConcurrent, runningCount);
      await new Promise((r) => setTimeout(r, 5));
      runningCount -= 1;
    });

    const trigger = createCoalescedRunner(task);

    // Fire a burst of triggers with no coordination, exactly like several rapid drag
    // releases would in the UI.
    await Promise.all([trigger(), trigger(), trigger(), trigger(), trigger()]);

    expect(maxConcurrent).toBe(1);
  });
});
