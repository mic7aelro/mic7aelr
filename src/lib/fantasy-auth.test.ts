import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(() => {
  process.env.FANTASY_SESSION_SECRET = 'test-secret-do-not-use-in-prod';
});

describe('hashBoardPin / pinMatchesHash', () => {
  it('matches the same PIN against its own hash', async () => {
    const { hashBoardPin, pinMatchesHash } = await import('./fantasy-auth');
    const hash = hashBoardPin('4321');
    expect(pinMatchesHash('4321', hash)).toBe(true);
  });

  it('rejects a different PIN', async () => {
    const { hashBoardPin, pinMatchesHash } = await import('./fantasy-auth');
    const hash = hashBoardPin('4321');
    expect(pinMatchesHash('0000', hash)).toBe(false);
  });

  it('produces different hashes for different PINs', async () => {
    const { hashBoardPin } = await import('./fantasy-auth');
    expect(hashBoardPin('1111')).not.toBe(hashBoardPin('2222'));
  });

  it('is deterministic for the same PIN and secret', async () => {
    const { hashBoardPin } = await import('./fantasy-auth');
    expect(hashBoardPin('9999')).toBe(hashBoardPin('9999'));
  });

  it('never stores the PIN in plain text inside the hash', async () => {
    const { hashBoardPin } = await import('./fantasy-auth');
    const hash = hashBoardPin('1234');
    expect(hash).not.toContain('1234');
  });
});
