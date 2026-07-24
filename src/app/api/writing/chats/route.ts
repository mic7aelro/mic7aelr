import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText } from '@/lib/writing-utils';

type StoredMessage = {
  role: 'user' | 'assistant';
  content: string;
  user: string;
  createdAt: string;
  ip: string;
  audit?: Record<string, string | number | boolean>;
};

function readAudit(value: unknown) {
  if (!value || typeof value !== 'object') return undefined;
  const audit = value as Record<string, unknown>;
  const number = (key: string) => typeof audit[key] === 'number' && Number.isFinite(audit[key]) ? audit[key] as number : undefined;
  return {
    model: cleanText(audit.model, 80),
    inputTokens: number('inputTokens'),
    outputTokens: number('outputTokens'),
    inputRatePerMillion: number('inputRatePerMillion'),
    outputRatePerMillion: number('outputRatePerMillion'),
    estimatedCostUsd: number('estimatedCostUsd'),
    status: audit.status === 'error' ? 'error' : 'success',
    changedField: audit.changedField === true,
    context: cleanText(audit.context, 40),
    pricingCurrency: cleanText(audit.pricingCurrency, 10),
    pricingSourceDate: cleanText(audit.pricingSourceDate, 20),
    httpStatus: number('httpStatus'),
    httpStatusText: cleanText(audit.httpStatusText, 30),
  };
}

function requestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return cleanText(forwarded || request.headers.get('x-real-ip') || 'unknown', 100);
}

function cleanAssistantContent(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  const embedded = firstBrace >= 0 && lastBrace > firstBrace ? content.slice(firstBrace, lastBrace + 1) : '';
  for (const candidate of [content.trim(), fenced, embedded]) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as { reply?: unknown };
      if (typeof parsed.reply === 'string') return cleanText(parsed.reply, 4_000);
    } catch { continue; }
  }
  return content;
}

function readMessages(value: unknown, request: Request, existing: StoredMessage[] = []) {
  if (!Array.isArray(value)) return [];
  const ip = requestIp(request);
  const author = cleanText(process.env.WRITING_ADMIN_USERNAME, 100) || 'author';
  const messages: StoredMessage[] = [];
  value.slice(-30).forEach((item: unknown, index: number) => {
    if (!item || typeof item !== 'object') return;
    const message = item as { role?: unknown; content?: unknown; audit?: unknown };
    const role = message.role === 'assistant' ? 'assistant' : message.role === 'user' ? 'user' : null;
    const content = cleanText(message.content, 4_000);
    if (!role || !content) return;
    const previous = existing[index];
    if (previous?.role === role && previous.content === content) {
      messages.push(previous);
      return;
    }
    const audit = readAudit(message.audit);
    messages.push({ role, content, user: role === 'assistant' ? 'Claude' : author, createdAt: new Date().toISOString(), ip, ...(audit ? { audit } : {}) } as StoredMessage);
  });
  return messages;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const database = await getWritingDatabase();
  const chats = await database.collection('writing_chats').find().sort({ updatedAt: -1 }).limit(30).toArray();
  const repairs: Promise<unknown>[] = [];
  const repairedChats = chats.map((chat) => {
    let changed = false;
    const messages = Array.isArray(chat.messages) ? chat.messages.map((message: StoredMessage) => {
      if (message.role !== 'assistant') return message;
      const content = cleanAssistantContent(message.content);
      if (content === message.content) return message;
      changed = true;
      return { ...message, content };
    }) : [];
    if (changed) repairs.push(database.collection('writing_chats').updateOne({ _id: chat._id }, { $set: { messages } }));
    return {
      id: chat._id.toString(),
      title: cleanText(chat.title, 80),
      context: cleanText(chat.context, 40),
      messages,
      updatedAt: cleanText(chat.updatedAt, 40),
    };
  });
  await Promise.all(repairs);
  return NextResponse.json({ chats: repairedChats });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const title = cleanText(body.title, 80) || 'New chat';
  const context = cleanText(body.context, 40) || 'post draft';
  const messages = readMessages(body.messages, request);
  const updatedAt = new Date().toISOString();
  const database = await getWritingDatabase();
  const result = await database.collection('writing_chats').insertOne({ title, context, messages, updatedAt, createdAt: updatedAt });
  return NextResponse.json({ id: result.insertedId.toString(), title, context, messages, updatedAt }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'This saved chat is not valid.' }, { status: 400 });
  const database = await getWritingDatabase();
  const existing = await database.collection('writing_chats').findOne({ _id: new ObjectId(id) });
  const messages = readMessages(body.messages, request, (existing?.messages || []) as StoredMessage[]);
  const updatedAt = new Date().toISOString();
  await database.collection('writing_chats').updateOne({ _id: new ObjectId(id) }, { $set: { messages, updatedAt } });
  return NextResponse.json({ id, messages, updatedAt });
}
