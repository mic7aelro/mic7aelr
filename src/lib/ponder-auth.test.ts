import { describe, expect, it } from 'vitest';
import { createSessionValue, isSessionValueValid, verifyPonderPassword } from './ponder-auth';

describe('Ponder password', () => {
  it('accepts only the exact password', () => {
    expect(verifyPonderPassword('Sample-Pass_1', 'Sample-Pass_1')).toBe(true);
    expect(verifyPonderPassword('sample-pass_1', 'Sample-Pass_1')).toBe(false);
    expect(verifyPonderPassword('Sample-Pass_1 ', 'Sample-Pass_1')).toBe(false);
    expect(verifyPonderPassword('', 'Sample-Pass_1')).toBe(false);
  });

  it('stays locked when the server has no password', () => {
    expect(verifyPonderPassword('anything', '')).toBe(false);
    expect(verifyPonderPassword('', '')).toBe(false);
    expect(isSessionValueValid(createSessionValue(9_999_999_999, ''), 0, '')).toBe(false);
  });
});

describe('Ponder session cookie', () => {
  const password = 'Sample-Pass_1';

  it('accepts a fresh cookie', () => {
    expect(isSessionValueValid(createSessionValue(2_000, password), 1_000, password)).toBe(true);
  });

  it('rejects an expired cookie', () => {
    expect(isSessionValueValid(createSessionValue(1_000, password), 1_001, password)).toBe(false);
  });

  it('rejects a cookie with a changed expiry or a wrong signature', () => {
    const [, signature] = createSessionValue(2_000, password).split('.');
    expect(isSessionValueValid(`9999.${signature}`, 1_000, password)).toBe(false);
    expect(isSessionValueValid('2000.forged', 1_000, password)).toBe(false);
    expect(isSessionValueValid('garbage', 1_000, password)).toBe(false);
    expect(isSessionValueValid(undefined, 1_000, password)).toBe(false);
  });

  it('rejects a cookie after the password changes', () => {
    const value = createSessionValue(2_000, password);
    expect(isSessionValueValid(value, 1_000, 'a-new-password')).toBe(false);
  });
});
