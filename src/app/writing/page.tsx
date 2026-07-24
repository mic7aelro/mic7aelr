import Link from 'next/link';
import { WritingAdmin } from '@/components/WritingAdmin';
import { isAdmin } from '@/lib/writing-auth';
import { getWritingIndex } from '@/lib/writing-data';
import styles from './Writing.module.css';

export const dynamic = 'force-dynamic';

export default async function WritingPage() {
  const writingIndex = await getWritingIndex();
  const authenticated = await isAdmin();
  const { groups, areas, posts, configured } = writingIndex;
  return (
    <>
      {authenticated && <WritingAdmin initialAuthenticated initialIndex={writingIndex} embedded />}
      <main className={styles.main} id="published-writing">
      <section className={styles.hero}>
        <p className={styles.kicker}>Writing and discussion</p>
        <h1>Ideas in progress.</h1>
        <p className={styles.heroText}>Notes on software, systems, creative work, and the decisions that shape them. Read a post, then add to the discussion.</p>
      </section>

      {!configured ? (
        <div className={styles.setup}>
          <h2>Writing is ready for configuration.</h2>
          <p>Add the required server environment variables, then create the first group and area from the author workspace.</p>
        </div>
      ) : groups.length === 0 ? (
        <p className={styles.empty}>No writing groups are published yet.</p>
      ) : groups.map((group) => {
        const groupAreas = areas.filter((area) => area.groupId === group.id);
        const groupDescription = group.name.trim().toLowerCase() === 'movies' && !group.description.includes('\nNice. I got')
          ? group.description.replace('Nice. I got', '\nNice. I got')
          : group.description;
        return (
          <section className={styles.group} key={group.id}>
            <div className={styles.groupTitle}><h2>{group.name}</h2><p>{groupDescription}</p></div>
            <div className={styles.areas}>
              {groupAreas.map((area) => {
                const areaPosts = posts.filter((post) => post.areaId === area.id);
                return (
                  <div key={area.id}>
                    <div className={styles.areaHeader}><h3>{area.name}</h3><p>{area.description}</p></div>
                    <div className={styles.postList}>
                      {areaPosts.length ? areaPosts.map((post) => (
                        <Link className={styles.postLink} href={`/writing/${post.slug}`} key={post.id}>
                          <div><h4>{post.title}</h4><p>{post.excerpt}</p></div>
                          <time dateTime={post.publishedAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(post.publishedAt))}</time>
                        </Link>
                      )) : <p className={styles.empty}>No posts in this area yet.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      </main>
    </>
  );
}
