import { ObjectId } from 'mongodb';
import { getWritingDatabase, isWritingConfigured } from '@/lib/mongodb';
import { serializeDocument } from '@/lib/writing-utils';
import type { WritingIndex } from '@/types/writing';

type StoredGroup = { _id: ObjectId; name: string; slug: string; description: string; createdAt: string };
type StoredArea = { _id: ObjectId; groupId: string; name: string; slug: string; description: string; createdAt: string };
type StoredPost = { _id: ObjectId; areaId: string; title: string; slug: string; excerpt: string; rating?: number; ratingBreakdown?: { story: number; direction: number; acting: number; cinematography: number; musicAndSound: number }; body: string; publishedAt: string };

export async function getWritingIndex(): Promise<WritingIndex> {
  if (!isWritingConfigured()) return { groups: [], areas: [], posts: [], configured: false };
  const database = await getWritingDatabase();
  const [groups, areas, posts] = await Promise.all([
    database.collection<StoredGroup>('writing_groups').find().sort({ createdAt: 1 }).toArray(),
    database.collection<StoredArea>('writing_areas').find().sort({ createdAt: 1 }).toArray(),
    database.collection<StoredPost>('writing_posts').find().sort({ publishedAt: -1 }).toArray(),
  ]);
  return {
    groups: groups.map(serializeDocument),
    areas: areas.map(serializeDocument),
    posts: posts.map(serializeDocument),
    configured: true,
  };
}

export async function getPostBySlug(slug: string) {
  if (!isWritingConfigured()) return null;
  const database = await getWritingDatabase();
  const post = await database.collection<StoredPost>('writing_posts').findOne({ slug });
  return post ? serializeDocument(post) : null;
}
