import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WritingComments } from '@/components/WritingComments';
import { WritingBody } from '@/components/WritingBody';
import { getPostBySlug } from '@/lib/writing-data';
import styles from '../Writing.module.css';

export const dynamic = 'force-dynamic';

export default async function WritingPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return (
    <main className={styles.article}>
      <Link className={styles.back} href="/writing">Back to writing</Link>
      <article>
        <header className={styles.articleHeader}>
          <div className={styles.articleTitle}><h1>{post.title}</h1><p>{post.excerpt}</p><time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(post.publishedAt))}</time></div>
          {post.ratingBreakdown && typeof post.rating === 'number' && <aside className={styles.reviewScorePanel} aria-label={`Rating: ${post.rating} out of 100`}><div className={styles.reviewScore}><strong>{post.rating}</strong><span>100</span></div><dl className={styles.scoreLegend}><div><dt><span>30%</span> Story</dt><dd>{post.ratingBreakdown.story}/10</dd></div><div><dt><span>30%</span> Music and sound</dt><dd>{post.ratingBreakdown.musicAndSound}/10</dd></div><div><dt><span>20%</span> Cinematography</dt><dd>{post.ratingBreakdown.cinematography}/10</dd></div><div><dt><span>12%</span> Direction</dt><dd>{post.ratingBreakdown.direction}/10</dd></div><div><dt><span>8%</span> Acting</dt><dd>{post.ratingBreakdown.acting}/10</dd></div></dl></aside>}
        </header>
        <WritingBody body={post.body} />
      </article>
      <WritingComments postId={post.id} />
    </main>
  );
}
