import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getWritingDatabase } from '@/lib/mongodb';
import { cleanText } from '@/lib/writing-utils';

const VISITOR_COOKIE = 'writing_visitor';

async function getVisitorId() {
  return (await cookies()).get(VISITOR_COOKIE)?.value || '';
}

export async function GET(request: Request) {
  const postId = new URL(request.url).searchParams.get('postId') || '';
  if (!ObjectId.isValid(postId)) return NextResponse.json({ comments: [] });
  const database = await getWritingDatabase();
  const visitorId = await getVisitorId();
  const comments = await database.collection('writing_comments').find({ postId }).sort({ createdAt: 1 }).toArray();
  const commentIds = comments.map(({ _id }) => _id.toString());
  const reactions = commentIds.length
    ? await database.collection('writing_reactions').find({ commentId: { $in: commentIds } }).toArray()
    : [];
  return NextResponse.json({
    comments: comments.map(({ _id, ...comment }) => {
      const matches = reactions.filter((reaction) => reaction.commentId === _id.toString());
      const viewerReaction = matches.find((reaction) => reaction.visitorId === visitorId)?.value || null;
      return {
        ...comment,
        id: _id.toString(),
        likes: matches.filter((reaction) => reaction.value === 'like').length,
        dislikes: matches.filter((reaction) => reaction.value === 'dislike').length,
        viewerReaction,
      };
    }),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const postId = cleanText(body.postId, 50);
  const name = cleanText(body.name, 80) || 'Anonymous';
  const comment = cleanText(body.comment, 2_000);
  if (!ObjectId.isValid(postId) || !comment) return NextResponse.json({ error: 'Enter a comment.' }, { status: 400 });
  const database = await getWritingDatabase();
  const postExists = await database.collection('writing_posts').findOne({ _id: new ObjectId(postId) });
  if (!postExists) return NextResponse.json({ error: 'This post does not exist.' }, { status: 404 });
  const result = await database.collection('writing_comments').insertOne({ postId, name, comment, createdAt: new Date().toISOString() });
  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const commentId = cleanText(body.commentId, 50);
  const value = body.value === 'like' || body.value === 'dislike' ? body.value : '';
  if (!ObjectId.isValid(commentId) || !value) return NextResponse.json({ error: 'Select like or dislike.' }, { status: 400 });
  const store = await cookies();
  let visitorId = store.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
    store.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  const database = await getWritingDatabase();
  const reactions = database.collection('writing_reactions');
  const existing = await reactions.findOne({ commentId, visitorId });
  if (existing && existing.value === value) {
    await reactions.deleteOne({ _id: existing._id });
  } else {
    await reactions.updateOne({ commentId, visitorId }, { $set: { value, updatedAt: new Date().toISOString() } }, { upsert: true });
  }
  return NextResponse.json({ success: true });
}
