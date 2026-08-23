import { describe, expect, it } from 'vitest';
import { readJsonBody } from './read-json-body';

function requestWith(body: string) {
  return new Request('http://localhost/test', { method: 'POST', body });
}

describe('readJsonBody', () => {
  it('parses a valid JSON object body', async () => {
    const result = await readJsonBody(requestWith('{"name":"test"}'));
    expect(result).toEqual({ name: 'test' });
  });

  it('returns null for malformed JSON instead of throwing', async () => {
    const result = await readJsonBody(requestWith('not json{{'));
    expect(result).toBeNull();
  });

  it('returns null for a JSON body that is not an object (e.g. an array or a bare string)', async () => {
    expect(await readJsonBody(requestWith('[1,2,3]'))).toBeNull();
    expect(await readJsonBody(requestWith('"just a string"'))).toBeNull();
    expect(await readJsonBody(requestWith('null'))).toBeNull();
  });

  it('returns null for an empty body', async () => {
    const result = await readJsonBody(requestWith(''));
    expect(result).toBeNull();
  });
});
