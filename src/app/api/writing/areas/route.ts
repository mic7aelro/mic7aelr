import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';
import { deleteWritingPosts } from '@/lib/writing-delete';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const groupId = cleanText(body.groupId, 50);
  const name = cleanText(body.name, 100);
  const description = cleanText(body.description, 300);
  if (!ObjectId.isValid(groupId) || !name) return NextResponse.json({ error: 'Select a group and enter an area name.' }, { status: 400 });
  const database = await getWritingDatabase();
  const slug = createSlug(name);
  const exists = await database.collection('writing_areas').findOne({ groupId, slug });
  if (exists) return NextResponse.json({ error: 'This area already exists in the selected group.' }, { status: 409 });
  const result = await database.collection('writing_areas').insertOne({ groupId, name, slug, description, createdAt: new Date().toISOString() });
  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  const confirmation = cleanText(body.confirmation, 100);
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'This area is not valid.' }, { status: 400 });
  const database = await getWritingDatabase();
  const area = await database.collection('writing_areas').findOne({ _id: new ObjectId(id) });
  if (!area) return NextResponse.json({ error: 'This area does not exist.' }, { status: 404 });
  if (confirmation !== area.name) return NextResponse.json({ error: 'Enter the exact area name.' }, { status: 400 });
  const posts = await database.collection('writing_posts').find({ areaId: id }, { projection: { _id: 1 } }).toArray();
  await deleteWritingPosts(database, posts.map((post) => post._id.toString()));
  await database.collection('writing_areas').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deleted: true });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  const groupId = cleanText(body.groupId, 50);
  const name = cleanText(body.name, 100);
  const description = cleanText(body.description, 300);
  if (!ObjectId.isValid(id) || !ObjectId.isValid(groupId) || !name) return NextResponse.json({ error: 'Select an area and group, then enter an area name.' }, { status: 400 });
  const database = await getWritingDatabase();
  const result = await database.collection('writing_areas').updateOne(
    { _id: new ObjectId(id) },
    { $set: { groupId, name, description, updatedAt: new Date().toISOString() } },
  );
  if (!result.matchedCount) return NextResponse.json({ error: 'This area does not exist.' }, { status: 404 });
  return NextResponse.json({ id });
}
