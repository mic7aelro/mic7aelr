import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getWritingDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/writing-auth';
import { cleanText, createSlug } from '@/lib/writing-utils';
import { deleteWritingPosts } from '@/lib/writing-delete';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const name = cleanText(body.name, 100);
  const description = cleanText(body.description, 300);
  if (!name) return NextResponse.json({ error: 'Enter a group name.' }, { status: 400 });
  const database = await getWritingDatabase();
  const slug = createSlug(name);
  const exists = await database.collection('writing_groups').findOne({ slug });
  if (exists) return NextResponse.json({ error: 'A group with this name already exists.' }, { status: 409 });
  const result = await database.collection('writing_groups').insertOne({ name, slug, description, createdAt: new Date().toISOString() });
  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  const confirmation = cleanText(body.confirmation, 100);
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'This group is not valid.' }, { status: 400 });
  const database = await getWritingDatabase();
  const group = await database.collection('writing_groups').findOne({ _id: new ObjectId(id) });
  if (!group) return NextResponse.json({ error: 'This group does not exist.' }, { status: 404 });
  if (confirmation !== group.name) return NextResponse.json({ error: 'Enter the exact group name.' }, { status: 400 });
  const areas = await database.collection('writing_areas').find({ groupId: id }, { projection: { _id: 1 } }).toArray();
  const areaIds = areas.map((area) => area._id.toString());
  const posts = areaIds.length ? await database.collection('writing_posts').find({ areaId: { $in: areaIds } }, { projection: { _id: 1 } }).toArray() : [];
  await deleteWritingPosts(database, posts.map((post) => post._id.toString()));
  if (areaIds.length) await database.collection('writing_areas').deleteMany({ _id: { $in: areas.map((area) => area._id) } });
  await database.collection('writing_groups').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deleted: true });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json();
  const id = cleanText(body.id, 50);
  const name = cleanText(body.name, 100);
  const description = cleanText(body.description, 300);
  if (!ObjectId.isValid(id) || !name) return NextResponse.json({ error: 'Select a group and enter a group name.' }, { status: 400 });
  const database = await getWritingDatabase();
  const result = await database.collection('writing_groups').updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, description, updatedAt: new Date().toISOString() } },
  );
  if (!result.matchedCount) return NextResponse.json({ error: 'This group does not exist.' }, { status: 404 });
  return NextResponse.json({ id });
}
