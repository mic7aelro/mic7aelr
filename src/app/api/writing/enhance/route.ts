import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

function parseClaudeResponse(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const firstBrace = value.indexOf('{');
  const lastBrace = value.lastIndexOf('}');
  const embedded = firstBrace >= 0 && lastBrace > firstBrace ? value.slice(firstBrace, lastBrace + 1) : '';
  const candidates = [value.trim(), fenced, embedded].filter((candidate): candidate is string => Boolean(candidate));
  for (const candidate of candidates) {
    try { return JSON.parse(candidate) as { reply?: unknown; fieldUpdates?: Record<string, unknown> }; }
    catch { continue; }
  }
  throw new Error('Claude did not return valid JSON.');
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 503 });
  const body = await request.json();
  const draft = cleanText(body.draft, 30_000);
  const userMessage = cleanText(body.message, 2_000);
  const context = cleanText(body.context, 40) || 'writing field';
  const model = body.model === 'sonnet' ? 'claude-sonnet-5' : 'claude-haiku-4-5';
  const workspaceContext = body.workspaceContext && typeof body.workspaceContext === 'object'
    ? cleanText(JSON.stringify(body.workspaceContext), 12_000)
    : '{}';
  const history = Array.isArray(body.history)
    ? body.history.slice(-8).flatMap((item: unknown) => {
        if (!item || typeof item !== 'object') return [];
        const value = item as { role?: unknown; content?: unknown };
        const role = value.role === 'assistant' ? 'assistant' : value.role === 'user' ? 'user' : null;
        const content = cleanText(value.content, 2_000);
        return role && content ? [{ role, content }] : [];
      })
    : [];
  if (!userMessage) return NextResponse.json({ error: 'Enter a message for Claude.' }, { status: 400 });

  const client = new Anthropic({ apiKey });
  const authorAddress = process.env.WRITING_ADMIN_USERNAME?.toLowerCase() === 'michael'
    ? 'The author is Michael. Address him as Father when a direct address is useful.'
    : '';
  const message = await client.messages.create({
    model,
    max_tokens: 12_000,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            reply: { type: 'string' },
            fieldUpdates: {
              type: 'object',
              additionalProperties: false,
              properties: {
                groupDescription: { type: ['string', 'null'] },
                areaDescription: { type: ['string', 'null'] },
                postTitle: { type: ['string', 'null'] },
                postExcerpt: { type: ['string', 'null'] },
                postDraft: { type: ['string', 'null'] },
              },
              required: ['groupDescription', 'areaDescription', 'postTitle', 'postExcerpt', 'postDraft'],
            },
          },
          required: ['reply', 'fieldUpdates'],
        },
      },
    },
    system: `You are a writing assistant inside an editor. Help the author think and edit. ${authorAddress}

You can see all writing fields in the author workspace. If the author asks only for ideas, feedback, options, analysis, or answers, respond without changing a field. Treat edit, rewrite, add, remove, shorten, expand, tidy, tidy up, clean up, polish, improve, fix, and revise as direct edit commands. When the author uses an edit command, return the complete revised value for the correct field. If the author refers to "the draft," update postDraft. postDraft must contain only the post body. Do not put the title, summary, or labels such as "Title," "Excerpt," or "Body" in postDraft. Use postTitle and postExcerpt for title and summary changes. A request can change more than one field.

Preserve the author's voice and factual meaning. Do not invent facts.

Preserve the editor formatting markers. Use ## or ### for headings, **text** for bold text, _text_ for italic text, ++text++ for underlined text, - for unordered list items, and 1. for ordered list items.

Use ASD-STE100 Simplified Technical English for all chat replies and field updates. Use short, direct sentences. Use active voice. Put one main idea in each sentence. Use one word for one meaning. Do not use idioms, rhetorical questions, or unnecessary marketing language. Preserve exact technical names and necessary domain terms. Do not reduce technical accuracy.

Return valid JSON only with this exact shape:
{"reply":"A concise response to the author","fieldUpdates":{"groupDescription":null,"areaDescription":null,"postTitle":null,"postExcerpt":null,"postDraft":null}}

Set each field update to the complete revised field value only when the author requested that field change. Otherwise set it to null. Do not use markdown fences.`,
    messages: [
      ...history,
      { role: 'user', content: `${userMessage}\n\nWORKSPACE FIELDS:\n${workspaceContext}\n\nTHE CHAT WAS OPENED FROM ${context.toUpperCase()}. Its current value is:\n${draft || '(This field is empty.)'}` },
    ],
  });
  const sonnetIntroductoryRate = Date.now() < Date.UTC(2026, 8, 1);
  const inputRatePerMillion = model === 'claude-haiku-4-5' ? 1 : sonnetIntroductoryRate ? 2 : 3;
  const outputRatePerMillion = model === 'claude-haiku-4-5' ? 5 : sonnetIntroductoryRate ? 10 : 15;
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const estimatedCostUsd = (inputTokens * inputRatePerMillion + outputTokens * outputRatePerMillion) / 1_000_000;
  const responseText = message.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n').trim();
  try {
    const parsed = parseClaudeResponse(responseText);
    const fieldUpdates = {
      groupDescription: typeof parsed.fieldUpdates?.groupDescription === 'string' ? cleanText(parsed.fieldUpdates.groupDescription, 2_000) : null,
      areaDescription: typeof parsed.fieldUpdates?.areaDescription === 'string' ? cleanText(parsed.fieldUpdates.areaDescription, 2_000) : null,
      postTitle: typeof parsed.fieldUpdates?.postTitle === 'string' ? cleanText(parsed.fieldUpdates.postTitle, 160) : null,
      postExcerpt: typeof parsed.fieldUpdates?.postExcerpt === 'string' ? cleanText(parsed.fieldUpdates.postExcerpt, 400) : null,
      postDraft: typeof parsed.fieldUpdates?.postDraft === 'string' ? cleanText(parsed.fieldUpdates.postDraft, 30_000) : null,
    };
    const changedField = Object.values(fieldUpdates).some((value) => value !== null);
    return NextResponse.json({
      reply: cleanText(parsed.reply, 4_000) || 'I completed the request.',
      fieldUpdates,
      audit: {
        model,
        inputTokens,
        outputTokens,
        inputRatePerMillion,
        outputRatePerMillion,
        estimatedCostUsd,
        status: 'success',
        changedField,
        context,
        pricingCurrency: 'USD',
        pricingSourceDate: '2026-07-22',
        httpStatus: 200,
        httpStatusText: 'OK',
      },
    });
  } catch {
    return NextResponse.json({
      reply: responseText,
      fieldUpdates: { groupDescription: null, areaDescription: null, postTitle: null, postExcerpt: null, postDraft: null },
      audit: {
        model,
        inputTokens,
        outputTokens,
        inputRatePerMillion,
        outputRatePerMillion,
        estimatedCostUsd,
        status: 'success',
        changedField: false,
        context,
        pricingCurrency: 'USD',
        pricingSourceDate: '2026-07-22',
        httpStatus: 200,
        httpStatusText: 'OK',
      },
    });
  }
}
