import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';
import { deleteWritingPosts } from '@/lib/writing-delete';

function getCategoryRating(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 0 && rating <= 10 ? Math.round(rating * 10) / 10 : undefined;
}

function getRatings(body: Record<string, unknown>) {
  const ratingBreakdown = {
    story: getCategoryRating(body.storyRating),
    direction: getCategoryRating(body.directionRating),
    acting: getCategoryRating(body.actingRating),
    cinematography: getCategoryRating(body.cinematographyRating),
    musicAndSound: getCategoryRating(body.musicAndSoundRating),
  };
  const values = Object.values(ratingBreakdown);
  if (values.every((value) => value === null)) return null;
  if (values.some((value) => value === null || value === undefined)) return undefined;
  const completeBreakdown = ratingBreakdown as Record<keyof typeof ratingBreakdown, number>;
  return {
    rating: Math.round(
      completeBreakdown.story * 3
      + completeBreakdown.musicAndSound * 3
      + completeBreakdown.cinematography * 2
      + completeBreakdown.direction * 1.2
      + completeBreakdown.acting * 0.8,
    ),
    ratingBreakdown: completeBreakdown,
  };
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const areaId = cleanText(body.areaId, 50);
  const title = cleanText(body.title, 160);
  const excerpt = cleanText(body.excerpt, 400);
  const ratings = getRatings(body);
  const postBody = cleanText(body.body, 30_000);
  if (!ObjectId.isValid(areaId) || !title || !postBody) {
    return NextResponse.json({ error: 'Select an area, enter a title, and add the post text.' }, { status: 400 });
  }
  if (ratings === undefined) return NextResponse.json({ error: 'Enter all five ratings from 0 to 10, or leave all five ratings empty.' }, { status: 400 });
  const database = await getWritingDatabase();
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let suffix = 2;
  while (await database.collection('writing_posts').findOne({ slug })) slug = `${baseSlug}-${suffix++}`;
  const result = await database.collection('writing_posts').insertOne({
    areaId,
    title,
    slug,
    excerpt: excerpt || postBody.slice(0, 220),
    ...(ratings || {}),
    body: postBody,
    publishedAt: new Date().toISOString(),
  });
  return NextResponse.json({ id: result.insertedId.toString(), slug }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  const areaId = cleanText(body.areaId, 50);
  const title = cleanText(body.title, 160);
  const excerpt = cleanText(body.excerpt, 400);
  const ratings = getRatings(body);
  const postBody = cleanText(body.body, 30_000);
  if (!ObjectId.isValid(id) || !ObjectId.isValid(areaId) || !title || !postBody) {
    return NextResponse.json({ error: 'Select a post and area, then enter a title and post text.' }, { status: 400 });
  }
  if (ratings === undefined) return NextResponse.json({ error: 'Enter all five ratings from 0 to 10, or leave all five ratings empty.' }, { status: 400 });
  const database = await getWritingDatabase();
  const result = await database.collection('writing_posts').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: { areaId, title, excerpt: excerpt || postBody.slice(0, 220), body: postBody, updatedAt: new Date().toISOString(), ...(ratings || {}) },
      ...(ratings === null ? { $unset: { rating: '', ratingBreakdown: '' } } : {}),
    },
  );
  if (!result.matchedCount) return NextResponse.json({ error: 'This post does not exist.' }, { status: 404 });
  return NextResponse.json({ id });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  const confirmation = cleanText(body.confirmation, 160);
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'This post is not valid.' }, { status: 400 });
  const database = await getWritingDatabase();
  const post = await database.collection('writing_posts').findOne({ _id: new ObjectId(id) });
  if (!post) return NextResponse.json({ error: 'This post does not exist.' }, { status: 404 });
  if (confirmation !== post.title) return NextResponse.json({ error: 'Enter the exact post title.' }, { status: 400 });
  await deleteWritingPosts(database, [id]);
  return NextResponse.json({ deleted: true });
}
