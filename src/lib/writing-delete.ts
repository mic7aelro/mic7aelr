import { type Db, ObjectId } from 'mongodb';

export async function deleteWritingPosts(database: Db, postIds: string[]) {
  if (!postIds.length) return;
  const comments = await database.collection('writing_comments').find({ postId: { $in: postIds } }, { projection: { _id: 1 } }).toArray();
  const commentIds = comments.map((comment) => comment._id.toString());
  if (commentIds.length) await database.collection('writing_reactions').deleteMany({ commentId: { $in: commentIds } });
  await database.collection('writing_comments').deleteMany({ postId: { $in: postIds } });
  await database.collection('writing_posts').deleteMany({ _id: { $in: postIds.map((id) => new ObjectId(id)) } });
}
