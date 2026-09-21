import { afterEach, describe, expect, it, vi } from 'vitest';
import { createJevDecider } from './jev';

const request = {
  stage: 'cross',
  state: { faces: {} },
  questions: {
    cross_color: { type: 'choice' as const, instructions: 'Which cross?', criteria: { white: 'a', yellow: 'b' } },
    quality: { type: 'score' as const, instructions: 'How good?', criteria: ['Low', 'High'] },
  },
};

afterEach(() => vi.unstubAllGlobals());

describe('createJevDecider', () => {
  it('sends the documented request and reads choice and score answers', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      model: 'jev-latest',
      answers: {
        cross_color: { type: 'choice', choice: 'white', probabilities: { white: 0.8, yellow: 0.2 }, confidence: 0.6 },
        quality: { type: 'score', score: 1.4, legend: { 0: 'Low', 1: 'High' }, confidence: 0.9 },
      },
      usage: { input_tokens: 10, output_tokens: 2 },
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const answers = await createJevDecider('test-key')(request);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.typesafe.ai/v1/systemone');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key');
    expect(JSON.parse(init.body as string)).toMatchObject({ model: 'jev-latest', state: request.state, questions: request.questions });
    expect(answers?.cross_color).toEqual({ type: 'choice', choice: 'white', probabilities: { white: 0.8, yellow: 0.2 }, confidence: 0.6 });
    expect(answers?.quality).toEqual({ type: 'score', score: 1.4, confidence: 0.9 });
  });

  it('reads answers that have no type field', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      answers: {
        cross_color: { choice: 'yellow', probabilities: { white: 0.1, yellow: 0.9 }, confidence: 0.7 },
        quality: { score: 3.2, confidence: 0.8 },
      },
    }), { status: 200 })));

    const answers = await createJevDecider('test-key')(request);

    expect(answers?.cross_color).toMatchObject({ type: 'choice', choice: 'yellow' });
    expect(answers?.quality).toMatchObject({ type: 'score', score: 3.2 });
  });

  it('throws a message without the key when the API rejects the request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 401 })));
    await expect(createJevDecider('secret-value')(request)).rejects.toThrow(/status 401/);
    await expect(createJevDecider('secret-value')(request)).rejects.not.toThrow(/secret-value/);
  });
});
